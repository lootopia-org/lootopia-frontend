'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { isHttpStoredImageUrl, toImageProxySrc } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

type Props = {
  /** Stored reference from step `answer` / `awnser` (internal S3 URL). */
  storedUrl: string;
  alt: string;
  className?: string;
};

export function RemoteStoredImage({ storedUrl, alt, className }: Props) {
  const t = useTranslations('common.image');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
  }, [storedUrl]);

  if (!isHttpStoredImageUrl(storedUrl)) {
    return (
      <div className={cn('px-4 py-8 text-center', className)}>
        <p className="text-sm text-white/60">{t('previewUnavailable')}</p>
      </div>
    );
  }

  const src = toImageProxySrc(storedUrl);

  if (failed) {
    return (
      <div className={cn('px-4 py-8 text-center', className)}>
        <p className="text-sm text-white/60">{t('previewUnavailable')}</p>
        <p className="mt-2 break-all text-xs text-white/40">{storedUrl}</p>
      </div>
    );
  }

  return (
    <div className={cn('relative flex min-h-24 w-full items-center justify-center', className)}>
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs">{t('loadingPreview')}</span>
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn('max-h-80 w-full object-contain', loading ? 'opacity-0' : 'opacity-100')}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      />
    </div>
  );
}
