import { mobileCaptureDeepLink } from '@/lib/capture-config';
import { CaptureRedirectClient } from './capture-redirect-client';

type Props = {
  params: Promise<{ sessionId: string }>;
};

export default async function CaptureRedirectPage({ params }: Props) {
  const { sessionId } = await params;

  if (!sessionId) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold text-white">Invalid capture link</h1>
        <p className="text-sm text-white/60">Start a new capture from the hunt wizard on web.</p>
      </main>
    );
  }

  const deepLink = mobileCaptureDeepLink(sessionId);

  return <CaptureRedirectClient sessionId={sessionId} deepLink={deepLink} />;
}
