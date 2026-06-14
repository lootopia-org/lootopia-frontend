'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { HuntAnalytics } from '@/types';

interface HuntHeatmapInnerProps {
  mapKey: string;
  analytics: HuntAnalytics;
}

function parseCoord(value?: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function HuntHeatmapInner({ mapKey, analytics }: HuntHeatmapInnerProps) {
  const t = useTranslations('hunts.detail.heatmap');
  const { center, maxCompletions, markers, userDots } = useMemo(() => {
    const stepMarkers = analytics.steps
      .map((step) => {
        const lat = parseCoord(step.latitude);
        const lng = parseCoord(step.longitude);
        if (lat === null || lng === null) return null;
        return { ...step, lat, lng };
      })
      .filter(Boolean) as Array<(typeof analytics.steps)[number] & { lat: number; lng: number }>;

    const userDots = analytics.userLocations
      .map((loc) => {
        const lat = parseCoord(loc.latitude);
        const lng = parseCoord(loc.longitude);
        if (lat === null || lng === null) return null;
        return { lat, lng };
      })
      .filter(Boolean) as Array<{ lat: number; lng: number }>;

    const allPoints = [
      ...stepMarkers.map((m) => [m.lat, m.lng] as [number, number]),
      ...userDots.map((d) => [d.lat, d.lng] as [number, number]),
    ];

    const center: [number, number] =
      allPoints.length > 0
        ? [
            allPoints.reduce((sum, p) => sum + p[0], 0) / allPoints.length,
            allPoints.reduce((sum, p) => sum + p[1], 0) / allPoints.length,
          ]
        : [37.7749, -122.4194];

    const maxCompletions = Math.max(1, ...stepMarkers.map((s) => s.completionCount));

    return { center, maxCompletions, markers: stepMarkers, userDots };
  }, [analytics]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = window.setTimeout(() => setMounted(true), 50);
    return () => {
      window.clearTimeout(timer);
      setMounted(false);
    };
  }, [mapKey]);

  if (markers.length === 0 && userDots.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl glass text-sm text-white/50">
        {t('empty')}
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-72 w-full rounded-xl glass animate-pulse" />;
  }

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={13}
      className="h-72 w-full rounded-xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userDots.map((dot, i) => (
        <CircleMarker
          key={`user-${i}`}
          center={[dot.lat, dot.lng]}
          radius={6}
          pathOptions={{ color: '#2dd4bf', fillColor: '#2dd4bf', fillOpacity: 0.35, weight: 1 }}
        >
          <Tooltip direction="top" opacity={0.9}>
            {t('tooltip.recentPlayer')}
          </Tooltip>
        </CircleMarker>
      ))}

      {markers.map((step) => {
        const intensity = step.completionCount / maxCompletions;
        const radius = 12 + intensity * 28;
        return (
          <CircleMarker
            key={`${step.stepId}-${step.lat}-${step.lng}-${step.order}`}
            center={[step.lat, step.lng]}
            radius={radius}
            pathOptions={{
              color: '#d4a017',
              fillColor: '#d4a017',
              fillOpacity: 0.25 + intensity * 0.45,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{t('topSteps', { order: step.order, title: step.title })}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {t('tooltip.completions', {
                    count: step.completionCount,
                    suffix: step.completionCount === 1 ? '' : 's',
                  })}
                </p>
              </div>
            </Popup>
            <Tooltip direction="top" opacity={0.95}>
              {step.title} · {t('visits', { count: step.completionCount })}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
