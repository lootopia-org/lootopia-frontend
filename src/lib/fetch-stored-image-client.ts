import { getAuthToken } from '@/lib/api/client';
import { extractStoredImageKey } from '@/lib/image-utils';

function buildMediaProxyPath(storedUrl: string): string {
  const params = new URLSearchParams({ url: storedUrl });
  const key = extractStoredImageKey(storedUrl);
  if (key) {
    params.set('key', key);
  }
  return `/media/stored-image?${params.toString()}`;
}

function contentTypeForReference(storedUrl: string): string {
  const lower = storedUrl.trim().toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

/** Client-side fetch of a stored image via the same-origin media proxy. */
export async function fetchStoredImageBlob(storedUrl: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildMediaProxyPath(storedUrl), {
    credentials: 'include',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Image fetch failed (${response.status})`);
  }

  const bytes = await response.arrayBuffer();
  if (bytes.byteLength === 0) {
    throw new Error('Empty image response');
  }

  const headerType = response.headers.get('content-type')?.split(';')[0]?.trim();
  const mimeType =
    headerType && headerType.startsWith('image/')
      ? headerType
      : contentTypeForReference(storedUrl);

  return new Blob([bytes], { type: mimeType });
}

export { buildMediaProxyPath };
