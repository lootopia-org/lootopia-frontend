'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Compass() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[1, 0.08, 8, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.15, 0.5, 4]} />
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.12, 0.4, 4]} />
        <meshStandardMaterial color="#2DD4BF" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function DashboardScene() {
  return (
    <div className="h-32 w-32 opacity-80">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#D4AF37" />
        <Compass />
      </Canvas>
    </div>
  );
}
