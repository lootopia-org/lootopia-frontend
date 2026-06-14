'use client';

import { Download, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAppDownloadUrl } from '@/lib/utils';

interface AppDownloadBannerProps {
  compact?: boolean;
  title?: string;
  description?: string;
}

export function AppDownloadBanner({
  compact = false,
  title,
  description,
}: AppDownloadBannerProps) {
  const t = useTranslations('common.appDownload');
  const downloadUrl = getAppDownloadUrl();
  const bannerTitle = title ?? t('title');
  const bannerDescription = description ?? t('description');

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-teal" />
          <p className="text-sm text-white/70">{bannerDescription}</p>
        </div>
        <Button variant="teal" size="sm" asChild>
          <a href={downloadUrl} download>
            <Download className="h-4 w-4" />
            {t('downloadApp')}
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-teal-500/20 glow-gold">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-gold/20">
          <Smartphone className="h-10 w-10 text-gold" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-gradient-gold">{bannerTitle}</h3>
          <p className="mt-2 text-sm text-white/60">{bannerDescription}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button size="lg" asChild>
            <a href={downloadUrl} download>
              <Download className="h-5 w-5" />
              {t('downloadForAndroid')}
            </a>
          </Button>
          <p className="text-xs text-white/40">{t('directDownloadNote')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AppDownloadQr() {
  const t = useTranslations('common.appDownload');
  const downloadUrl = getAppDownloadUrl();

  return (
    <Card className="p-6 text-center">
      <p className="text-sm text-white/60 mb-4">{t('qr.scanPrompt')}</p>
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(downloadUrl)}`}
          alt={t('qr.alt')}
          width={120}
          height={120}
        />
      </div>
    </Card>
  );
}
