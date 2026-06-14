'use client';

import { useTranslations } from 'next-intl';

type Props = {
  sessionId: string;
  deepLink: string;
};

export function CaptureRedirectClient({ sessionId, deepLink }: Props) {
  const t = useTranslations('hunts.wizard.photoCapture.captureRedirect');

  if (!sessionId) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold text-white">{t('invalidTitle')}</h1>
        <p className="text-sm text-white/60">{t('invalidMessage')}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-white">{t('expoTitle')}</h1>
      <p className="text-sm text-white/60">{t('expoMessage')}</p>
      <a
        href={deepLink}
        className="rounded-lg bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal/90"
      >
        {t('openCapture')}
      </a>
      <p className="text-xs text-white/40 break-all">{deepLink}</p>
    </main>
  );
}
