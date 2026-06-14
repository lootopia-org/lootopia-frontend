'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_LAT = 37.7749;
const DEFAULT_LNG = -122.4194;

function parseCoord(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapViewSync({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container?.isConnected) {
      return;
    }
    map.setView([latitude, longitude], map.getZoom(), { animate: false });
  }, [latitude, longitude, map]);

  return null;
}

interface CheckpointMapProps {
  mapKey: string;
  latitude?: string;
  longitude?: string;
  onSelect: (lat: number, lng: number) => void;
}

export default function CheckpointMapInner({
  mapKey,
  latitude,
  longitude,
  onSelect,
}: CheckpointMapProps) {
  const lat = parseCoord(latitude, DEFAULT_LAT);
  const lng = parseCoord(longitude, DEFAULT_LNG);
  const [mounted, setMounted] = useState(false);

  // Tear down and recreate the Leaflet instance whenever the step map identity changes.
  useEffect(() => {
    setMounted(false);
    const timer = window.setTimeout(() => setMounted(true), 50);
    return () => {
      window.clearTimeout(timer);
      setMounted(false);
    };
  }, [mapKey]);

  if (!mounted) {
    return <div className="h-64 w-full rounded-xl bg-white/[0.02] animate-pulse" />;
  }

  return (
    <MapContainer
      key={mapKey}
      center={[lat, lng]}
      zoom={13}
      className="h-64 w-full rounded-xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onSelect={onSelect} />
      <MapViewSync latitude={lat} longitude={lng} />
      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
