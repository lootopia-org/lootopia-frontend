import { getCaptureConfig, getCaptureConfigForSession } from '@/lib/capture-config';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    return Response.json(getCaptureConfigForSession(sessionId));
  }

  return Response.json(getCaptureConfig());
}
