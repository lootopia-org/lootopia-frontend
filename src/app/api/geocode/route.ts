import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ message: 'Address query is required' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('q', query);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Lootopia-Frontend/1.0 (partner-hunt-builder)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Geocoding service unavailable' },
        { status: 502 }
      );
    }

    const results = (await response.json()) as NominatimResult[];

    if (!results.length) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }

    const [match] = results;

    return NextResponse.json({
      latitude: match.lat,
      longitude: match.lon,
      displayName: match.display_name,
    });
  } catch {
    return NextResponse.json({ message: 'Failed to geocode address' }, { status: 500 });
  }
}
