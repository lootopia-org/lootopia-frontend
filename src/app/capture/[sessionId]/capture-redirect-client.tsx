'use client';

type Props = {
  sessionId: string;
  deepLink: string;
};

export function CaptureRedirectClient({ sessionId, deepLink }: Props) {
  if (!sessionId) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold text-white">Invalid capture link</h1>
        <p className="text-sm text-white/60">Start a new capture from the hunt wizard on web.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-white">Open in Expo Go</h1>
      <p className="text-sm text-white/60">
        Open Lootopia Mobile in Expo Go first (same tunnel), then tap the button below. Sign in with
        your partner account before taking the photo.
      </p>
      <a
        href={deepLink}
        className="rounded-lg bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal/90"
      >
        Open capture in Lootopia Mobile
      </a>
      <p className="text-xs text-white/40 break-all">{deepLink}</p>
    </main>
  );
}
