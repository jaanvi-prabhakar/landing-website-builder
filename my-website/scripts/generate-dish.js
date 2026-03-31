const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env manually (no dotenv dependency)
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const API_KEY = envVars.REACT_APP_TOGETHER_API_KEY;
if (!API_KEY) {
  console.error('Missing REACT_APP_TOGETHER_API_KEY in .env');
  process.exit(1);
}

const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'dish.png');

const prompt =
  'A beautiful plate of pani puri Indian tapas, vibrant garnish with fresh cilantro, pomegranate seeds, and micro herbs, ' +
  'shot from directly above on a dark slate surface, dramatic warm saffron side lighting, ' +
  'shallow depth of field, photorealistic professional food photography, 8k, ultra detailed';

const payload = JSON.stringify({
  model: 'black-forest-labs/FLUX.1-schnell',
  prompt,
  width: 1024,
  height: 1024,
  n: 1,
  response_format: 'b64_json',
});

const options = {
  hostname: 'api.together.xyz',
  path: '/v1/images/generations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
    'Content-Length': Buffer.byteLength(payload),
  },
};

console.log('Generating dish image via Together AI (FLUX.1-schnell)...');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`API error ${res.statusCode}:`, body);
      process.exit(1);
    }

    const json = JSON.parse(body);
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      console.error('No image data in response:', JSON.stringify(json, null, 2));
      process.exit(1);
    }

    fs.writeFileSync(OUTPUT_PATH, Buffer.from(b64, 'base64'));
    console.log(`Saved to ${OUTPUT_PATH}`);
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  process.exit(1);
});

req.write(payload);
req.end();
