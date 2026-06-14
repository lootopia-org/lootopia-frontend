'use client';

import dynamic from 'next/dynamic';

interface CheckpointMapProps {
  mapKey: string;
  latitude?: string;
  longitude?: string;
  onSelect: (lat: number, lng: number) => void;
}

export const CheckpointMap = dynamic(() => import('./checkpoint-map-inner'), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-xl glass animate-pulse" />,
});

export type { CheckpointMapProps };
