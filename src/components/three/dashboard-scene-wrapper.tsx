'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DashboardSceneInner = dynamic(
  () => import('./dashboard-scene').then((m) => m.DashboardScene),
  { ssr: false }
);

export function DashboardSceneWrapper() {
  return (
    <Suspense fallback={null}>
      <DashboardSceneInner />
    </Suspense>
  );
}
