'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function TreasureChest() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.6;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.1, 0.55, 0.75]} />
        <meshStandardMaterial color="#8B6914" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.15, 0.25, 0.8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.62, 0.41]}>
        <torusGeometry args={[0.08, 0.025, 8, 16]} />
        <meshStandardMaterial color="#F5E6A3" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#2DD4BF"
          emissive="#2DD4BF"
          emissiveIntensity={0.35}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export function ArStepScene() {
  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-teal-500/20 bg-gradient-to-b from-teal-500/10 to-background">
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 42 }}>
        <ambientLight intensity={0.45} />
        <pointLight position={[2, 3, 2]} intensity={1.1} color="#D4AF37" />
        <pointLight position={[-2, 1, -1]} intensity={0.5} color="#2DD4BF" />
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
          <TreasureChest />
        </Float>
        <Sparkles count={40} scale={3} size={2} speed={0.35} color="#D4AF37" />
      </Canvas>
    </div>
  );
}
