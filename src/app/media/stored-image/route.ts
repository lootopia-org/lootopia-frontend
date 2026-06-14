import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { fetchStoredImageFromBackend } from '@/lib/server/fetch-stored-image';

/**
 * Same-origin proxy to backend `GET /upload/image/view`.
 * Lives outside `/api/*` so it is not swallowed by the API rewrite.
 */
export async function GET(request: NextRequest) {
  const storedUrl = request.nextUrl.searchParams.get('url');
  if (!storedUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  const cookieStore = await cookies();
  const session =
    cookieStore.get('session')?.value ?? cookieStore.get('authToken')?.value;
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await fetchStoredImageFromBackend(storedUrl, session);
  if (!payload) {
    return new Response('Failed to fetch image', { status: 502 });
  }

  return new Response(new Uint8Array(payload.bytes), {
    headers: {
      'Content-Type': payload.contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
