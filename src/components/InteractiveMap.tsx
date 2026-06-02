'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MarkerType = 'chase' | 'user' | 'step';

interface MapMarker {
  id: string;
  position: LatLngExpression;
  type: MarkerType;
  label: string;
  description?: string;
}

interface MapProps {
  center: LatLngExpression;
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (markerId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  editable?: boolean;
}

const RecenterButton: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
};

const MapClickHandler: React.FC<{ onClick?: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const createCustomIcon = (type: MarkerType) => {
  const colors = {
    chase: '#ff6b35',
    user: '#4ade80',
    step: '#3b82f6',
  };
  const color = colors[type] || '#6b7280';
  
  return new Icon({
    iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'%3E%3Cpath fill='%23${color.slice(1)}' d='M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z'/%3E%3Ccircle fill='white' cx='16' cy='16' r='8'/%3E%3C/svg%3E`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const getMarkerColor = (type: MarkerType) => {
  switch (type) {
    case 'chase':
      return '#ff6b35';
    case 'user':
      return '#4ade80';
    case 'step':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

export const InteractiveMap: React.FC<MapProps> = ({
  center,
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
  className = '',
  editable = false,
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
      {editable && onMapClick && <MapClickHandler onClick={onMapClick} />}
      {markers.map((marker) => (
        <React.Fragment key={marker.id}>
          <Marker
            position={marker.position}
            icon={createCustomIcon(marker.type || 'step')}
            eventHandlers={{ click: () => onMarkerClick?.(marker.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getMarkerColor(marker.type || 'step') }}
                  />
                  <span className="text-xs uppercase font-semibold text-gray-500">
                    {marker.type || 'step'}
                  </span>
                </div>
                <h3 className="font-bold">{marker.label}</h3>
                {marker.description && <p>{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
          {marker.type === 'user' && (
            <Circle
              center={marker.position}
              radius={50}
              pathOptions={{
                color: getMarkerColor(marker.type),
                fillColor: getMarkerColor(marker.type),
                fillOpacity: 0.2,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};
