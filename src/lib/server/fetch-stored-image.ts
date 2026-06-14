import { getBackendUrl } from '@/lib/server/backend-url';
import { extractStoredImageKey } from '@/lib/image-utils';

export type StoredImagePayload = {
  contentType: string;
  bytes: Buffer;
};

function contentTypeForReference(storedUrl: string): string {
  const lower = storedUrl.trim().toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

/** Fetch image bytes via backend `GET /upload/image/view?url=…`. */
export async function fetchStoredImageFromBackend(
  storedUrl: string,
  sessionToken: string
): Promise<StoredImagePayload | null> {
  const params = new URLSearchParams({ url: storedUrl });
  const key = extractStoredImageKey(storedUrl);
  if (key) {
    params.set('key', key);
  }

  const response = await fetch(
    `${getBackendUrl()}/upload/image/view?${params.toString()}`,
    {
      headers: {
        Cookie: `session=${sessionToken}`,
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return null;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    return null;
  }

  const headerType = response.headers.get('content-type')?.split(';')[0]?.trim();
  const contentType =
    headerType && headerType.startsWith('image/')
      ? headerType
      : contentTypeForReference(storedUrl);

  return { contentType, bytes };
}
