export interface GeocodeResult {
  latitude: string;
  longitude: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);

  const data = (await response.json()) as GeocodeResult & { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to look up address');
  }

  return data;
}
