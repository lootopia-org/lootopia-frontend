'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { geocodeAddress } from '@/lib/geocoding';
import { CheckpointMap } from '@/components/hunts/checkpoint-map';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (value: string) => {
    onAddressChange(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (suggestion: Suggestion) => {
    onAddressChange(suggestion.display_name);
    onLocationChange(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white/80">
        <MapPin className="h-4 w-4 text-gold" />
        {t('heading')}
      </div>

      <div className="space-y-2" ref={containerRef}>
        <Label htmlFor="step-address">{t('address')}</Label>
        <div className="relative">
          <Input
            id="step-address"
            value={address}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t('addressPlaceholder')}
            autoComplete="off"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 animate-pulse">
              {t('lookingUp')}
            </span>
          )}
          {open && (
            <ul className="absolute z-50 mt-1 w-full rounded-md border border-white/10 bg-background shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <li
                  key={s.place_id}
                  onMouseDown={() => handleSelect(s)}
                  className="cursor-pointer px-3 py-2 text-sm text-white/80 hover:bg-white/10 truncate"
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
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