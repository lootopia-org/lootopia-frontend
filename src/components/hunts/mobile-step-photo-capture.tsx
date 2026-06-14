'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import { Smartphone, Loader2 } from 'lucide-react';
import {
  fetchCaptureConfig,
  stepPhotoSessionApi,
  type CaptureSessionConfig,
  type StepPhotoSession,
} from '@/lib/api/step-photo-sessions';
import { subscribeStepPhotoCaptured } from '@/lib/ws/step-photo-events';
import { Button } from '@/components/ui/button';

interface MobileStepPhotoCaptureProps {
  stepKey: string;
  huntId?: string;
  onPhotoCaptured: (photoUrl: string) => void;
}

export function MobileStepPhotoCapture({
  stepKey,
  huntId,
  onPhotoCaptured,
}: MobileStepPhotoCaptureProps) {
  const t = useTranslations('hunts.wizard.photoCapture');
  const [session, setSession] = useState<StepPhotoSession | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [useDirectExpoQr, setUseDirectExpoQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      const created = await stepPhotoSessionApi.create(stepKey, huntId);
      const captureConfig = (await fetchCaptureConfig(created.sessionId)) as CaptureSessionConfig;
      setSession(created);
      setWaiting(true);
      setUseDirectExpoQr(captureConfig.useDirectExpoQr);
      const qr = await QRCode.toDataURL(captureConfig.qrUrl, { margin: 1, width: 180 });
      setQrUrl(captureConfig.qrUrl);
      setQrDataUrl(qr);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.startFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.status === 'completed') {
      return;
    }

    const applyPhoto = (photoUrl: string) => {
      setWaiting(false);
      onPhotoCaptured(photoUrl);
    };

    const unsubscribe = subscribeStepPhotoCaptured((payload) => {
      if (payload.sessionId !== session.sessionId) {
        return;
      }
      applyPhoto(payload.photoUrl);
    });

    const poll = window.setInterval(async () => {
      try {
        const latest = await stepPhotoSessionApi.get(session.sessionId);
        setSession(latest);
        if (latest.photoUrl) {
          applyPhoto(latest.photoUrl);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (/invalid|expired|unauthorized/i.test(message)) {
          setWaiting(false);
          setError(t('errors.sessionExpired'));
        }
      }
    }, 2000);

    return () => {
      unsubscribe();
      window.clearInterval(poll);
    };
  }, [session, onPhotoCaptured, t]);

  const captureLink = qrUrl;

  return (
    <div className="rounded-xl border border-teal/20 bg-teal/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Smartphone className="h-5 w-5 text-teal mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">{t('heading')}</p>
          <p className="text-xs text-white/50">{t('description')}</p>
        </div>
      </div>

      {!session ? (
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={() => void startCapture()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
          {loading ? t('actions.starting') : t('actions.usePhoneCamera')}
        </Button>
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={t('qr.alt')} className="rounded-lg border border-white/10 bg-white p-2" />
          ) : null}
          <div className="space-y-2 text-xs text-white/50 min-w-[12rem]">
            {waiting ? (
              <p className="flex items-center gap-2 text-teal">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('status.waiting')}
              </p>
            ) : (
              <p className="text-gold">{t('status.received')}</p>
            )}
            {captureLink ? (
              <p className="break-all">
                {useDirectExpoQr ? t('qr.expoHint') : t('qr.signInHint')}
                <br />
                <span className="text-white/70">{captureLink}</span>
              </p>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSession(null);
                setQrUrl(null);
                setQrDataUrl(null);
                setWaiting(false);
                setError(null);
              }}
            >
              {t('actions.cancelCapture')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => void startCapture()}>
              {t('actions.startNewCapture')}
            </Button>
          </div>
        </div>
      )}

      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
