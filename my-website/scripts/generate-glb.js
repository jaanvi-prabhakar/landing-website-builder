const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Load .env ───
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const API_KEY = envVars.REACT_APP_TRIPO_API_KEY;
if (!API_KEY) {
  console.error('Missing REACT_APP_TRIPO_API_KEY in .env');
  process.exit(1);
}

const IMAGE_PATH = path.resolve(__dirname, '..', 'public', 'dish.png');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'dish.glb');
const BASE_URL = 'api.tripo3d.ai';
const POLL_INTERVAL = 3000;

// ─── Helpers ───
function request(method, urlPath, body, contentType) {
  return new Promise((resolve, reject) => {
    const isFullUrl = urlPath.startsWith('https://');
    const url = isFullUrl ? new URL(urlPath) : null;
    const options = {
      hostname: isFullUrl ? url.hostname : BASE_URL,
      path: isFullUrl ? url.pathname + url.search : urlPath,
      method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    };
    if (body && contentType) {
      options.headers['Content-Type'] = contentType;
    }

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, body: buf });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function uploadMultipart(filePath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const boundary = '----TripoUpload' + Date.now();
    const CRLF = '\r\n';

    const preamble =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
      `Content-Type: image/png${CRLF}${CRLF}`;
    const epilogue = `${CRLF}--${boundary}--${CRLF}`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(preamble, 'utf-8'),
      fileData,
      Buffer.from(epilogue, 'utf-8'),
    ]);

    const options = {
      hostname: BASE_URL,
      path: '/v2/openapi/upload',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (downloadUrl) => {
      const parsed = new URL(downloadUrl);
      const mod = parsed.protocol === 'https:' ? https : require('http');
      mod.get(downloadUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => reject(new Error(`Download failed ${res.statusCode}: ${body}`)));
          return;
        }
        const ws = fs.createWriteStream(dest);
        res.pipe(ws);
        ws.on('finish', () => { ws.close(); resolve(); });
      }).on('error', reject);
    };
    follow(url);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ───
async function main() {
  // 1. Upload image
  console.log('Uploading dish.png to Tripo...');
  const uploadRes = await uploadMultipart(IMAGE_PATH);
  if (uploadRes.status !== 200) {
    console.error(`Upload failed ${uploadRes.status}:`, uploadRes.body);
    process.exit(1);
  }
  const uploadJson = JSON.parse(uploadRes.body);
  const imageToken = uploadJson.data?.image_token;
  if (!imageToken) {
    console.error('No image_token in upload response:', uploadRes.body);
    process.exit(1);
  }
  console.log(`Image uploaded. Token: ${imageToken}`);

  // 2. Create image-to-model task
  console.log('Creating image-to-3D task...');
  const taskPayload = JSON.stringify({
    type: 'image_to_model',
    file: {
      type: 'png',
      file_token: imageToken,
    },
  });
  const taskRes = await request('POST', '/v2/openapi/task', taskPayload, 'application/json');
  if (taskRes.status !== 200) {
    console.error(`Task creation failed ${taskRes.status}:`, taskRes.body.toString());
    process.exit(1);
  }
  const taskJson = JSON.parse(taskRes.body.toString());
  const taskId = taskJson.data?.task_id;
  if (!taskId) {
    console.error('No task_id in response:', taskRes.body.toString());
    process.exit(1);
  }
  console.log(`Task created: ${taskId}`);

  // 3. Poll for completion
  console.log('Polling for completion...');
  while (true) {
    await sleep(POLL_INTERVAL);
    const pollRes = await request('GET', `/v2/openapi/task/${taskId}`);
    const pollJson = JSON.parse(pollRes.body.toString());
    const status = pollJson.data?.status;
    const progress = pollJson.data?.progress || 0;

    process.stdout.write(`\r  Status: ${status} | Progress: ${progress}%`);

    if (status === 'success') {
      console.log('\nTask complete!');
      const output = pollJson.data?.output || {};
      const modelUrl = output.model || output.pbr_model || output.base_model;
      if (!modelUrl) {
        console.error('No model URL in output:', JSON.stringify(output, null, 2));
        process.exit(1);
      }

      // 4. Download .glb
      console.log(`Downloading .glb from ${modelUrl}...`);
      await downloadFile(modelUrl, OUTPUT_PATH);
      const size = fs.statSync(OUTPUT_PATH).size;
      console.log(`Saved to ${OUTPUT_PATH} (${(size / 1024).toFixed(0)} KB)`);
      return;
    }

    if (status === 'failed' || status === 'cancelled' || status === 'banned') {
      console.error(`\nTask ${status}.`, JSON.stringify(pollJson.data, null, 2));
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
