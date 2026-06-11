'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ArStepScene = dynamic(
  () => import('@/components/three/ar-step-scene').then((m) => m.ArStepScene),
  { ssr: false }
);

export function ArStepPreview() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-white/50">
        AR preview — players will discover this treasure at the mapped location in the mobile app.
      </p>
      <Suspense
        fallback={
          <div className="h-48 w-full rounded-xl border border-teal-500/20 bg-teal-500/5 animate-pulse" />
        }
      >
        <ArStepScene />
      </Suspense>
    </div>
  );
}
