'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: LatLngExpression;
  zoom?: number;
  markers?: Array<{
    id: string;
    position: LatLngExpression;
    label: string;
    description?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
}

const RecenterButton: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
};

export const InteractiveMap: React.FC<MapProps> = ({
  center,
  zoom = 13,
  markers = [],
  onMarkerClick,
  className = '',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className={`bg-gray-200 rounded-lg ${className}`} />;
  }

  return (
    <MapContainer center={center} zoom={zoom} className={`rounded-lg z-10 ${className}`}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <RecenterButton center={center} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          eventHandlers={{ click: () => onMarkerClick?.(marker.id) }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">{marker.label}</h3>
              {marker.description && <p>{marker.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
