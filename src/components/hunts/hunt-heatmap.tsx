'use client';

import dynamic from 'next/dynamic';
import type { HuntAnalytics } from '@/types';

interface HuntHeatmapProps {
  analytics: HuntAnalytics;
  mapKey: string;
}

export const HuntHeatmap = dynamic(() => import('./hunt-heatmap-inner'), {
  ssr: false,
  loading: () => <div className="h-72 w-full rounded-xl glass animate-pulse" />,
});

export type { HuntHeatmapProps };
