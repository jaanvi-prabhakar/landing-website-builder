import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Mouse tracker (shared across meshes) ─── */
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

/* ─── Materials ─── */
function useGoldMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c9a84c'),
        metalness: 0.85,
        roughness: 0.2,
        emissive: new THREE.Color('#5a3d0a'),
        emissiveIntensity: 0.15,
      }),
    []
  );
}

function usePlateMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1a130b'),
        metalness: 0.3,
        roughness: 0.6,
        emissive: new THREE.Color('#0d0a06'),
        emissiveIntensity: 0.05,
      }),
    []
  );
}

function useInnerMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2a1f12'),
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color('#1a130b'),
        emissiveIntensity: 0.1,
      }),
    []
  );
}

/* ─── The floating plate assembly ─── */
function Plate() {
  const groupRef = useRef();
  const goldMat = useGoldMaterial();
  const plateMat = usePlateMaterial();
  const innerMat = useInnerMaterial();

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    const t = state.clock.elapsedTime;

    // Slow Y rotation + mouse-based tilt
    groupRef.current.rotation.y = t * 0.15 + mouse.x * 0.3;
    groupRef.current.rotation.x = -0.3 + mouse.y * 0.2;
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.03 + mouse.x * 0.05;

    // Gentle bob
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.12;
  });

  return (
    <group ref={groupRef} rotation={[-0.3, 0, 0]}>
      {/* ── Plate base (flat cylinder) ── */}
      <mesh material={plateMat} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.85, 0.12, 64]} />
      </mesh>

      {/* ── Inner plate surface (slightly smaller, raised) ── */}
      <mesh material={innerMat} position={[0, 0.07, 0]}>
        <cylinderGeometry args={[1.5, 1.55, 0.06, 64]} />
      </mesh>

      {/* ── Gold outer rim (torus) ── */}
      <mesh material={goldMat} position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.82, 0.06, 16, 64]} />
      </mesh>

      {/* ── Gold inner rim accent ── */}
      <mesh material={goldMat} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.52, 0.03, 12, 64]} />
      </mesh>

      {/* ── Subtle gold ring decoration in center ── */}
      <mesh material={goldMat} position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.015, 12, 48]} />
      </mesh>

      {/* ── Plate underside lip ── */}
      <mesh material={plateMat} position={[0, -0.06, 0]}>
        <cylinderGeometry args={[1.1, 1.15, 0.06, 48]} />
      </mesh>
    </group>
  );
}

/* ─── Scene with lights ─── */
function Scene() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#f5ead0" />

      {/* Key light — warm saffron from upper-right */}
      <pointLight
        position={[3, 4, 3]}
        intensity={60}
        color="#d4912a"
        distance={12}
        decay={2}
      />

      {/* Fill light — amber from left */}
      <pointLight
        position={[-3, 2, 2]}
        intensity={30}
        color="#e8a540"
        distance={10}
        decay={2}
      />

      {/* Rim light — warm highlight from behind */}
      <pointLight
        position={[0, -1, -3]}
        intensity={20}
        color="#c9a84c"
        distance={8}
        decay={2}
      />

      {/* Subtle red accent from below */}
      <pointLight
        position={[2, -3, 1]}
        intensity={10}
        color="#8b2c1a"
        distance={6}
        decay={2}
      />

      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
        <Plate />
      </Float>
    </>
  );
}

/* ─── Exported Canvas ─── */
export default function HeroPlate() {
  return (
    <div className="hero-plate">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
