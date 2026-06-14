'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const HeroSceneInner = dynamic(
  () => import('./hero-scene').then((m) => m.HeroScene),
  { ssr: false }
);

export function HeroScene() {
  return (
    <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
      <HeroSceneInner />
    </Suspense>
  );
}
