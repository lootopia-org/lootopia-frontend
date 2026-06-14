'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import type { HuntFormValues } from '@/lib/schemas/hunt';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Props = {
  index: number;
  control: Control<HuntFormValues>;
  setValue: UseFormSetValue<HuntFormValues>;
  error?: string;
};

export function QrStepFields({ index, control, setValue, error }: Props) {
  const t = useTranslations('hunts.wizard.qrStep');
  const answer = useWatch({ control, name: `steps.${index}.answer` }) ?? '';
  const scanInAr = useWatch({ control, name: `steps.${index}.scanInAr` }) ?? false;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const payload = answer.trim();
    if (!payload) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    void QRCode.toDataURL(payload, { margin: 1, width: 200 }).then((dataUrl) => {
      if (!cancelled) {
        setQrDataUrl(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [answer]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('contentLabel')}</Label>
        <Input
          value={answer}
          onChange={(event) =>
            setValue(`steps.${index}.answer`, event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder={t('contentPlaceholder')}
        />
        <p className="text-xs text-white/40">{t('contentHint')}</p>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-gold"
          checked={scanInAr}
          onChange={(event) =>
            setValue(`steps.${index}.scanInAr`, event.target.checked, {
              shouldDirty: true,
            })
          }
        />
        <span>
          <span className="block text-sm font-medium text-white">{t('scanInArLabel')}</span>
          <span className="mt-1 block text-xs text-white/40">{t('scanInArHint')}</span>
        </span>
      </label>

      {qrDataUrl ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={t('previewAlt')} className="h-[200px] w-[200px]" />
          <Button type="button" variant="secondary" size="sm" asChild>
            <a href={qrDataUrl} download={`step-${index + 1}-qr.png`}>
              <Download className="h-4 w-4" />
              {t('download')}
            </a>
          </Button>
        </div>
      ) : (
        <p className="text-xs text-white/40">{t('previewEmpty')}</p>
      )}
    </div>
  );
}
