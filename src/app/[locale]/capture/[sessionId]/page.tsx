import { mobileCaptureDeepLink } from '@/lib/capture-config';
import { CaptureRedirectClient } from './capture-redirect-client';

type Props = {
  params: Promise<{ sessionId: string }>;
};

export default async function CaptureRedirectPage({ params }: Props) {
  const { sessionId } = await params;
  const deepLink = mobileCaptureDeepLink(sessionId);
  return <CaptureRedirectClient sessionId={sessionId} deepLink={deepLink} />;
}
