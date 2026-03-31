import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Config ─── */
const PARTICLE_COUNT = 600;
const DEPTH = 12;
const MOUSE_INFLUENCE = 2.5;
const MOUSE_RADIUS = 4;

/* ─── Saffron / Gold / Deep-red palette ─── */
const COLORS = [
  new THREE.Color('#d4912a'),  // saffron
  new THREE.Color('#c9a84c'),  // gold
  new THREE.Color('#e8d5a3'),  // gold-light
  new THREE.Color('#8b2c1a'),  // deep-red
  new THREE.Color('#d4912a'),  // saffron again (weighted)
  new THREE.Color('#f5c542'),  // bright saffron
  new THREE.Color('#a67c2e'),  // dark gold
];

/* ─── Vertex Shader ─── */
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aRandom;
  attribute vec3 aColor;
  attribute vec3 aVelocity;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Organic drift
    float t = uTime * 0.15;
    pos.x += sin(t * 1.3 + aRandom * 12.0) * 0.4;
    pos.y += cos(t * 0.9 + aRandom * 8.0) * 0.35 + sin(t * 0.4) * 0.15;
    pos.z += sin(t * 0.7 + aRandom * 6.0) * 0.25;

    // Slow upward float
    pos.y += mod(uTime * aVelocity.y * 0.3 + aRandom * 20.0, 12.0) - 6.0;

    // Mouse repulsion
    vec2 mouseWorld = uMouse * 6.0;
    vec2 diff = pos.xy - mouseWorld;
    float dist = length(diff);
    float influence = smoothstep(${MOUSE_RADIUS.toFixed(1)}, 0.0, dist) * ${MOUSE_INFLUENCE.toFixed(1)};
    pos.xy += normalize(diff + vec2(0.001)) * influence;

    // Subtle pulse
    float pulse = 1.0 + sin(uTime * 2.0 + aRandom * 6.28) * 0.15;

    vColor = aColor;
    // Depth-based fade: particles further from camera are dimmer
    float depthFade = smoothstep(${DEPTH.toFixed(1)}, 0.0, abs(pos.z));
    vAlpha = (0.25 + aRandom * 0.2) * depthFade;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * pulse * uPixelRatio * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/* ─── Fragment Shader ─── */
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    // Soft glow falloff
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.15, 0.0, d) * 0.6;
    float alpha = min((glow + core) * vAlpha, 0.85);

    gl_FragColor = vec4(vColor, alpha);
  }
`;

/* ─── Particles Mesh ─── */
function Particles() {
  const meshRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const mouseTarget = useRef(new THREE.Vector2(0, 0));

  const { positions, sizes, randoms, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread particles in a wide, deep volume
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * DEPTH;

      sizes[i] = (Math.random() * 3.0 + 0.5) * 1;
      randoms[i] = Math.random();

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = Math.random() * 0.3 + 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    return { positions, sizes, randoms, colors, velocities };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    []
  );

  const handlePointerMove = useCallback(
    (e) => {
      mouseTarget.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    },
    []
  );

  // Attach global listener for mouse tracking
  useMemo(() => {
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth mouse lerp
    mouseRef.current.lerp(mouseTarget.current, 0.06);
    mat.uniforms.uMouse.value.copy(mouseRef.current);
  });

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" array={sizes} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" array={randoms} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" array={colors} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-aVelocity" array={velocities} count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── A few larger, slowly orbiting "ember" particles for depth ─── */
function Embers() {
  const meshRef = useRef();
  const count = 40;

  const { positions, sizes, randoms, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      sizes[i] = (Math.random() * 6.0 + 3.0) * 1;
      randoms[i] = Math.random();

      // Embers are mostly bright saffron/gold
      const emberColors = [
        new THREE.Color('#d4912a'),
        new THREE.Color('#f5c542'),
        new THREE.Color('#e8d5a3'),
      ];
      const c = emberColors[Math.floor(Math.random() * emberColors.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 1] = Math.random() * 0.15 + 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    return { positions, sizes, randoms, colors, velocities };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" array={sizes} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" array={randoms} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" array={colors} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-aVelocity" array={velocities} count={count} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Exported Canvas Wrapper ─── */
export default function HeroParticles() {
  return (
    <div className="hero-canvas">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <Particles />
        <Embers />
      </Canvas>
    </div>
  );
}
