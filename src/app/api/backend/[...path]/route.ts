import { NextRequest } from 'next/server';

/**
 * Proxy serveur vers le backend d'authentification.
 *
 * Pourquoi : l'API distante applique une allowlist d'origines et renvoie
 * 400 "Unsupported origin" à toute requête portant un en-tête `Origin`
 * (donc toute requête navigateur). En relayant côté serveur, on appelle
 * l'API sans `Origin` (fetch serveur-à-serveur) et on évite le CORS,
 * puisque le navigateur ne parle qu'au même origine (/api/backend/...).
 */

const API_BASE = (process.env.BACKEND_API_URL || 'https://api.wookiesrpeople2.dev').replace(/\/$/, '');

// On ne transmet QUE les en-têtes utiles — surtout pas Origin / Host / Cookie.
const forwardRequestHeaders = (req: NextRequest): Headers => {
  const headers = new Headers();
  const authorization = req.headers.get('authorization');
  if (authorization) headers.set('authorization', authorization);
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', 'application/json');
  return headers;
};

const proxy = async (req: NextRequest, path: string[]): Promise<Response> => {
  const target = `${API_BASE}/${(path ?? []).join('/')}${req.nextUrl.search}`;
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: forwardRequestHeaders(req),
      body: hasBody ? await req.text() : undefined,
      cache: 'no-store',
    });
  } catch {
    return Response.json({ message: 'Backend injoignable.' }, { status: 502 });
  }

  const body = await upstream.text();
  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get('content-type');
  if (upstreamContentType) responseHeaders.set('content-type', upstreamContentType);

  return new Response(body, { status: upstream.status, headers: responseHeaders });
};

type Ctx = { params: { path: string[] } };

export const GET = (req: NextRequest, { params }: Ctx) => proxy(req, params.path);
export const POST = (req: NextRequest, { params }: Ctx) => proxy(req, params.path);
export const PUT = (req: NextRequest, { params }: Ctx) => proxy(req, params.path);
export const PATCH = (req: NextRequest, { params }: Ctx) => proxy(req, params.path);
export const DELETE = (req: NextRequest, { params }: Ctx) => proxy(req, params.path);
