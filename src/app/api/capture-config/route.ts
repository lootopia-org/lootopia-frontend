import { getCaptureConfig, getCaptureConfigForSession } from '@/lib/capture-config';

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const sessionId = searchParams.get('sessionId');
  const requestOrigin = requestUrl.origin;

  if (sessionId) {
    return Response.json(getCaptureConfigForSession(sessionId, requestOrigin));
  }

  return Response.json(getCaptureConfig(requestOrigin));
}
