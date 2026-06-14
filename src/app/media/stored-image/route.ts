import { NextRequest } from 'next/server';
import { fetchStoredImageFromBackend } from '@/lib/server/fetch-stored-image';

function sessionFromRequest(request: NextRequest): string | undefined {
  const cookieSession =
    request.cookies.get('session')?.value ?? request.cookies.get('authToken')?.value;
  if (cookieSession) {
    return cookieSession;
  }

  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    if (token) {
      return token;
    }
  }

  return undefined;
}

/**
 * Same-origin proxy to backend `GET /upload/image/view`.
 * Used by `<img src="…">` (cookies) and optional Bearer from client fetch.
 */
export async function GET(request: NextRequest) {
  const storedUrl =
    request.nextUrl.searchParams.get('url') ?? request.nextUrl.searchParams.get('key');
  if (!storedUrl) {
    return new Response('Missing url or key parameter', { status: 400 });
  }

  const session = sessionFromRequest(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await fetchStoredImageFromBackend(storedUrl, session);
  if (!payload || payload.bytes.length === 0) {
    return new Response('Failed to fetch image', { status: 502 });
  }

  return new Response(payload.bytes as unknown as ArrayBuffer, {
    headers: {
      'Content-Type': payload.contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
