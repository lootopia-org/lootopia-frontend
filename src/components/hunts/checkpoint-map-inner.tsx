'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface CheckpointMapProps {
  latitude?: string;
  longitude?: string;
  onSelect: (lat: number, lng: number) => void;
}

export default function CheckpointMapInner({
  latitude,
  longitude,
  onSelect,
}: CheckpointMapProps) {
  const center: [number, number] = [
    Number(latitude) ?? 37.7749,
    Number(longitude) ?? -122.4194,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-64 w-full rounded-xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onSelect={onSelect} />
      {latitude !== undefined && longitude !== undefined && (
        <Marker position={[Number(latitude), Number(longitude)]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
