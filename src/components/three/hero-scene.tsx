'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

function TreasureChest() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D4AF37',
        metalness: 0.9,
        roughness: 0.2,
        emissive: '#D4AF37',
        emissiveIntensity: 0.15,
      }),
    []
  );

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3d2817',
        metalness: 0.1,
        roughness: 0.8,
      }),
    []
  );

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={group}>
        {/* Chest base */}
        <mesh material={woodMaterial} position={[0, -0.2, 0]}>
          <boxGeometry args={[1.4, 0.6, 0.9]} />
        </mesh>
        {/* Chest lid */}
        <mesh material={woodMaterial} position={[0, 0.15, -0.1]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[1.4, 0.3, 0.9]} />
        </mesh>
        {/* Gold bands */}
        {[-0.4, 0, 0.4].map((x) => (
          <mesh key={x} material={goldMaterial} position={[x, -0.2, 0.46]}>
            <boxGeometry args={[0.08, 0.65, 0.05]} />
          </mesh>
        ))}
        {/* Lock */}
        <mesh material={goldMaterial} position={[0, -0.05, 0.48]}>
          <boxGeometry args={[0.2, 0.25, 0.08]} />
        </mesh>
      </group>
    </Float>
  );
}

function Coins() {
  const coins = useMemo(() => {
    return Array.from({ length: 24 }, () => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4 - 2,
      ] as [number, number, number],
      scale: 0.08 + Math.random() * 0.06,
      speed: 0.5 + Math.random(),
    }));
  }, []);

  return (
    <>
      {coins.map((coin, i) => (
        <FloatingCoin key={i} {...coin} />
      ))}
    </>
  );
}

function FloatingCoin({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, 0.15, 16]} />
      <meshStandardMaterial
        color="#D4AF37"
        metalness={1}
        roughness={0.15}
        emissive="#D4AF37"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#D4AF37" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#2DD4BF" />
        <Stars radius={50} depth={50} count={2000} factor={3} fade speed={0.5} />
        <TreasureChest />
        <Coins />
        <EffectComposer>
          <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.8} />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
