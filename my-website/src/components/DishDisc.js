import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Disc 3D scene (one per card) ─── */
function Disc({ color, emissive, spotColor, isInView }) {
  const groupRef = useRef();
  const entryProgress = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);

  const discMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.6,
        roughness: 0.35,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
      }),
    [color, emissive]
  );

  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#c9a84c'),
        metalness: 0.9,
        roughness: 0.15,
        emissive: new THREE.Color('#5a3d0a'),
        emissiveIntensity: 0.2,
      }),
    []
  );

  const onPointerMove = useCallback((e) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  const onPointerEnter = useCallback(() => { isHovered.current = true; }, []);
  const onPointerLeave = useCallback(() => {
    isHovered.current = false;
    mouse.current.x = 0;
    mouse.current.y = 0;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Scroll-triggered entry: rotate from flat (PI/2) to angled (-0.5)
    const targetEntry = isInView ? 1 : 0;
    entryProgress.current += (targetEntry - entryProgress.current) * 0.035;
    const ep = entryProgress.current;

    // Base rotation: flat at 0, angled when visible
    const baseX = THREE.MathUtils.lerp(Math.PI / 2, -0.45, ep);

    // Smooth mouse tracking
    const lerpFactor = isHovered.current ? 0.08 : 0.04;
    mouseSmooth.current.x += (mouse.current.x - mouseSmooth.current.x) * lerpFactor;
    mouseSmooth.current.y += (mouse.current.y - mouseSmooth.current.y) * lerpFactor;

    // Hover tilt intensity ramps up when hovered
    const tiltStrength = isHovered.current ? 0.35 : 0.08;
    const tiltX = mouseSmooth.current.y * tiltStrength;
    const tiltY = mouseSmooth.current.x * tiltStrength;

    groupRef.current.rotation.x = baseX + tiltX;
    groupRef.current.rotation.y = t * 0.2 + tiltY;
    groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.02;

    // Gentle bob
    groupRef.current.position.y = Math.sin(t * 0.7) * 0.08 * ep;

    // Scale in on entry
    const s = THREE.MathUtils.lerp(0.4, 1, ep);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef} onPointerMove={onPointerMove} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
      {/* Disc surface */}
      <mesh material={discMat}>
        <cylinderGeometry args={[1.3, 1.35, 0.1, 64]} />
      </mesh>

      {/* Gold rim */}
      <mesh material={rimMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.33, 0.05, 16, 64]} />
      </mesh>

      {/* Inner ring decoration */}
      <mesh material={rimMat} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.02, 12, 48]} />
      </mesh>

      {/* Center accent */}
      <mesh material={discMat} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.82, 0.85, 0.04, 48]} />
      </mesh>

      {/* Spotlight from above */}
      <spotLight
        position={[0, 4, 1]}
        angle={0.5}
        penumbra={0.8}
        intensity={40}
        color={spotColor}
        distance={10}
        decay={2}
        castShadow={false}
      />
    </group>
  );
}

/* ─── Canvas wrapper for a single dish card ─── */
export default function DishDisc3D({ color, emissive, spotColor, label, subtitle, isInView }) {
  return (
    <div className="dish-disc-canvas">
      <Canvas
        camera={{ position: [0, 1.8, 3.5], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} color="#f5ead0" />
        <pointLight position={[-2, 2, 2]} intensity={15} color="#d4912a" distance={8} decay={2} />
        <pointLight position={[2, -1, 1]} intensity={8} color={spotColor} distance={6} decay={2} />
        <Disc color={color} emissive={emissive} spotColor={spotColor} isInView={isInView} />
      </Canvas>
      <div className="dish-disc-label">
        <span className="dish-disc-name">{label}</span>
        <span className="dish-disc-sub">{subtitle}</span>
      </div>
    </div>
  );
}
