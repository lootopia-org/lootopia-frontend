'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { fetchStoredImageBlob } from '@/lib/fetch-stored-image-client';
import { isStoredImageReference } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

type Props = {
  storedUrl: string;
  alt: string;
  className?: string;
};

export function RemoteStoredImage({ storedUrl, alt, className }: Props) {
  const t = useTranslations('common.image');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isStoredImageReference(storedUrl)) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setFailed(true);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    setFailed(false);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    void fetchStoredImageBlob(storedUrl)
      .then((blob) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [storedUrl]);

  if (!isStoredImageReference(storedUrl) || failed) {
    return (
      <div className={cn('px-4 py-8 text-center', className)}>
        <p className="text-sm text-white/60">{t('previewUnavailable')}</p>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className={cn('relative flex min-h-24 w-full items-center justify-center', className)}>
        <div className="flex flex-col items-center justify-center gap-2 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs">{t('loadingPreview')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative flex min-h-24 w-full items-center justify-center', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={blobUrl} alt={alt} className="max-h-80 w-full object-contain" />
    </div>
  );
}
