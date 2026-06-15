import { extractStoredImageKey } from '@/lib/image-utils';

export type StoredImagePayload = {
  contentType: string;
  bytes: Buffer;
};

export type StoredImageFetchResult =
  | { ok: true; payload: StoredImagePayload }
  | { ok: false; status: number; message: string };

function contentTypeForReference(storedUrl: string): string {
  const lower = storedUrl.trim().toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function serverSideViewUrl(storedUrl: string): string {
  const params = new URLSearchParams({ url: storedUrl });
  const key = extractStoredImageKey(storedUrl);
  if (key) {
    params.set('key', key);
  }

  const port = process.env.PORT ?? '3000';
  return `http://127.0.0.1:${port}/api/upload/image/view?${params.toString()}`;
}

/** Fetch image bytes via the same `/api` rewrite used by the browser. */
export async function fetchStoredImageFromBackend(
  storedUrl: string,
  sessionToken: string
): Promise<StoredImageFetchResult> {
  let response: Response;
  try {
    response = await fetch(serverSideViewUrl(storedUrl), {
      headers: {
        Cookie: `session=${sessionToken}`,
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    });
  } catch {
    return { ok: false, status: 502, message: 'Failed to reach image service' };
  }

  if (!response.ok) {
    const message = (await response.text()) || 'Failed to fetch image';
    return { ok: false, status: response.status, message };
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    return { ok: false, status: 502, message: 'Empty image response' };
  }

  const headerType = response.headers.get('content-type')?.split(';')[0]?.trim();
  const contentType =
    headerType && headerType.startsWith('image/')
      ? headerType
      : contentTypeForReference(storedUrl);

  return { ok: true, payload: { contentType, bytes } };
}
