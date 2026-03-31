import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Mouse tracker ─── */
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

/* ─── GLB Dish Model ─── */
function DishModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/dish.glb');

  // Center and scale the model on first load
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.8 / maxDim;

    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    scene.scale.setScalar(scale);
  }, [scene]);

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
      <primitive object={scene} />
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
        <DishModel />
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

useGLTF.preload('/dish.glb');
