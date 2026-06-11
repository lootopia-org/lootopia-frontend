'use client';

import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { geocodeAddress } from '@/lib/geocoding';
import { CheckpointMap } from '@/components/hunts/checkpoint-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepLocationPickerProps {
  address?: string;
  latitude?: string;
  longitude?: string;
  onAddressChange: (address: string) => void;
  onLocationChange: (latitude: number, longitude: number) => void;
  error?: string;
}

export function StepLocationPicker({
  address = '',
  latitude,
  longitude,
  onAddressChange,
  onLocationChange,
  error,
}: StepLocationPickerProps) {
  const [lookingUp, setLookingUp] = useState(false);

  const handleLookup = async () => {
    const query = address.trim();
    if (!query) {
      toast.error('Enter an address first');
      return;
    }

    setLookingUp(true);
    try {
      const result = await geocodeAddress(query);
      onAddressChange(result.displayName);
      onLocationChange(Number(result.latitude), Number(result.longitude));
      toast.success('Location found');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Address lookup failed');
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white/80">
        <MapPin className="h-4 w-4 text-gold" />
        Location
      </div>

      <div className="space-y-2">
        <Label htmlFor="step-address">Address</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="step-address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="e.g. 1 Market St, San Francisco, CA"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleLookup();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleLookup()}
            disabled={lookingUp}
            className="shrink-0"
          >
            <Search className="h-4 w-4" />
            {lookingUp ? 'Looking up…' : 'Look up'}
          </Button>
        </div>
        <p className="text-xs text-white/40">
          Enter an address to fetch coordinates, or fine-tune by clicking the map.
        </p>
      </div>

      {latitude !== undefined && longitude !== undefined && (
        <p className="text-xs text-white/50 font-mono">
          {latitude}, {longitude}
        </p>
      )}

      <CheckpointMap
        latitude={latitude}
        longitude={longitude}
        onSelect={onLocationChange}
      />

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
