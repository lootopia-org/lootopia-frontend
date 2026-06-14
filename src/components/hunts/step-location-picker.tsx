'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { geocodeAddress } from '@/lib/geocoding';
import { CheckpointMap } from '@/components/hunts/checkpoint-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepLocationPickerProps {
  mapKey: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  onAddressChange: (address: string) => void;
  onLocationChange: (latitude: number, longitude: number) => void;
  error?: string;
}

export function StepLocationPicker({
  mapKey,
  address = '',
  latitude,
  longitude,
  onAddressChange,
  onLocationChange,
  error,
}: StepLocationPickerProps) {
  const t = useTranslations('hunts.wizard.location');
  const [lookingUp, setLookingUp] = useState(false);

  const handleLookup = async () => {
    const query = address.trim();
    if (!query) {
      toast.error(t('toasts.enterAddress'));
      return;
    }

    setLookingUp(true);
    try {
      const result = await geocodeAddress(query);
      onAddressChange(result.displayName);
      onLocationChange(Number(result.latitude), Number(result.longitude));
      toast.success(t('toasts.found'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.lookupFailed'));
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white/80">
        <MapPin className="h-4 w-4 text-gold" />
        {t('heading')}
      </div>

      <div className="space-y-2">
        <Label htmlFor="step-address">{t('address')}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="step-address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t('addressPlaceholder')}
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
            {lookingUp ? t('lookingUp') : t('lookup')}
          </Button>
        </div>
        <p className="text-xs text-white/40">{t('hint')}</p>
      </div>

      {latitude !== undefined && longitude !== undefined && (
        <p className="text-xs text-white/50 font-mono">
          {latitude}, {longitude}
        </p>
      )}

      <CheckpointMap
        mapKey={mapKey}
        latitude={latitude}
        longitude={longitude}
        onSelect={onLocationChange}
      />

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
