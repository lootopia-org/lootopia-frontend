import { getBackendUrl } from '@/lib/server/backend-url';

export type StoredImagePayload = {
  contentType: string;
  bytes: Buffer;
};

/** Fetch image bytes via backend `GET /upload/image/view?url=…`. */
export async function fetchStoredImageFromBackend(
  storedUrl: string,
  sessionToken: string
): Promise<StoredImagePayload | null> {
  const response = await fetch(
    `${getBackendUrl()}/upload/image/view?url=${encodeURIComponent(storedUrl)}`,
    {
      headers: { Cookie: `session=${sessionToken}` },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return null;
  }

  return {
    contentType: response.headers.get('content-type') || 'image/jpeg',
    bytes: Buffer.from(await response.arrayBuffer()),
  };
}
