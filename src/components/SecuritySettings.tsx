'use client';

import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { create as webauthnCreate } from '@github/webauthn-json';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { useI18n } from '@/hooks/useI18n';
import { useNotificationStore } from '@/lib/notification-store';
import { authService, WebauthnCredential } from '@/lib/auth-service';
import { useAuthStore } from '@/lib/auth-store';

type TotpStage = 'idle' | 'enrolling' | 'disabling';

const errorMessage = (error: any, fallback: string): string => {
  const data = error?.response?.data;
  const text = typeof data === 'string' ? data : data?.message || data?.code;
  return text || error?.message || fallback;
};

export const SecuritySettings: React.FC = () => {
  const { t } = useI18n();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();

  const supportsWebauthn = useMemo(
    () => typeof window !== 'undefined' && 'PublicKeyCredential' in window,
    []
  );

  // L'état "TOTP activé" n'est pas garanti par /me : on l'initialise depuis le
  // champ éventuel renvoyé par l'API puis on le suit localement.
  const [totpEnabled, setTotpEnabled] = useState<boolean>(
    Boolean((user as any)?.totpEnabled ?? (user as any)?.mfaEnabled)
  );
  const [totpStage, setTotpStage] = useState<TotpStage>('idle');
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpBusy, setTotpBusy] = useState(false);

  const [credentials, setCredentials] = useState<WebauthnCredential[]>([]);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);

  const refreshCredentials = async () => {
    try {
      const list = await authService.listWebauthnCredentials();
      setCredentials(Array.isArray(list) ? list : []);
    } catch {
      // Session non-MFA / endpoint indisponible : on garde une liste vide
      // plutôt que de spammer l'utilisateur au chargement.
      setCredentials([]);
    } finally {
      setCredentialsLoaded(true);
    }
  };

  useEffect(() => {
    refreshCredentials();
  }, []);

  useEffect(() => {
    if (!otpauthUri) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(otpauthUri, { margin: 1, width: 220 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [otpauthUri]);

  const startTotpEnroll = async () => {
    setTotpBusy(true);
    try {
      const { secret: enrollSecret, otpauthUri: uri } = await authService.beginTotpEnroll();
      setSecret(enrollSecret);
      setOtpauthUri(uri);
      setTotpCode('');
      setTotpStage('enrolling');
    } catch (error: any) {
      addNotification({ type: 'error', message: errorMessage(error, t('profile.security.messages.error')) });
    } finally {
      setTotpBusy(false);
    }
  };

  const confirmTotpEnroll = async () => {
    if (!totpCode.trim()) {
      addNotification({ type: 'error', message: t('profile.security.totp.codeRequired') });
      return;
    }
    setTotpBusy(true);
    try {
      await authService.verifyTotpEnroll(totpCode.trim());
      setTotpEnabled(true);
      setTotpStage('idle');
      setOtpauthUri(null);
      setSecret(null);
      setTotpCode('');
      addNotification({ type: 'success', message: t('profile.security.totp.enabledSuccess') });
    } catch (error: any) {
      addNotification({ type: 'error', message: errorMessage(error, t('profile.security.totp.invalidCode')) });
    } finally {
      setTotpBusy(false);
    }
  };

  const confirmTotpDisable = async () => {
    if (!totpCode.trim()) {
      addNotification({ type: 'error', message: t('profile.security.totp.codeRequired') });
      return;
    }
    setTotpBusy(true);
    try {
      await authService.disableTotp(totpCode.trim());
      setTotpEnabled(false);
      setTotpStage('idle');
      setTotpCode('');
      addNotification({ type: 'success', message: t('profile.security.totp.disabledSuccess') });
    } catch (error: any) {
      addNotification({ type: 'error', message: errorMessage(error, t('profile.security.totp.invalidCode')) });
    } finally {
      setTotpBusy(false);
    }
  };

  const cancelTotpFlow = () => {
    setTotpStage('idle');
    setOtpauthUri(null);
    setSecret(null);
    setTotpCode('');
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      addNotification({ type: 'success', message: t('profile.security.totp.secretCopied') });
    } catch {
      // clipboard indisponible : le secret reste affiché à l'écran
    }
  };

  const addPasskey = async () => {
    if (!supportsWebauthn) {
      addNotification({ type: 'error', message: t('profile.security.passkeys.unsupported') });
      return;
    }
    setPasskeyBusy(true);
    try {
      const begin = await authService.beginWebauthnRegister();
      // L'API renvoie les options `publicKey` au format webauthn-json ; on les
      // passe directement à `create` qui produit le JSON attendu par /complete.
      const credential = await webauthnCreate({ publicKey: begin.publicKey as any });
      await authService.completeWebauthnRegister(begin.handle, credential);
      addNotification({ type: 'success', message: t('profile.security.passkeys.addedSuccess') });
      await refreshCredentials();
    } catch (error: any) {
      // L'utilisateur peut annuler le prompt navigateur (NotAllowedError) : pas une vraie erreur.
      if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
        setPasskeyBusy(false);
        return;
      }
      addNotification({ type: 'error', message: errorMessage(error, t('profile.security.passkeys.error')) });
    } finally {
      setPasskeyBusy(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black tracking-tight text-dark mb-6">{t('profile.security.title')}</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* TOTP */}
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-dark">{t('profile.security.totp.title')}</h3>
              <p className="text-sm text-gray-600">{t('profile.security.totp.description')}</p>
            </div>
            <span
              className={`shrink-0 rounded-full border-2 border-dark px-3 py-1 text-xs font-bold text-dark ${
                totpEnabled ? 'bg-card-green' : 'bg-gray-100'
              }`}
            >
              {totpEnabled ? t('profile.security.statusEnabled') : t('profile.security.statusDisabled')}
            </span>
          </div>

          {totpStage === 'idle' && (
            <div className="flex gap-3">
              {totpEnabled ? (
                <Button variant="danger" isLoading={totpBusy} onClick={() => setTotpStage('disabling')}>
                  {t('profile.security.totp.disable')}
                </Button>
              ) : (
                <Button isLoading={totpBusy} onClick={startTotpEnroll}>
                  {t('profile.security.totp.enable')}
                </Button>
              )}
            </div>
          )}

          {totpStage === 'enrolling' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">{t('profile.security.totp.scanInstructions')}</p>
              {qrDataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="TOTP QR code"
                  className="mx-auto h-48 w-48 rounded-xl border-2 border-dark bg-white p-2 shadow-arcade-sm"
                />
              )}
              {secret && (
                <div className="rounded-xl border-2 border-dark bg-card-yellow p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                    {t('profile.security.totp.manualEntry')}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <code className="break-all text-sm font-semibold text-dark">{secret}</code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="shrink-0 text-sm font-semibold text-primary hover:underline"
                    >
                      {t('profile.security.totp.copy')}
                    </button>
                  </div>
                </div>
              )}
              <Input
                label={t('profile.security.totp.codeLabel')}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <div className="flex gap-3">
                <Button isLoading={totpBusy} onClick={confirmTotpEnroll}>
                  {t('profile.security.totp.confirm')}
                </Button>
                <Button variant="outline" onClick={cancelTotpFlow} disabled={totpBusy}>
                  {t('profile.security.cancel')}
                </Button>
              </div>
            </div>
          )}

          {totpStage === 'disabling' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">{t('profile.security.totp.disableInstructions')}</p>
              <Input
                label={t('profile.security.totp.codeLabel')}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="danger" isLoading={totpBusy} onClick={confirmTotpDisable}>
                  {t('profile.security.totp.confirmDisable')}
                </Button>
                <Button variant="outline" onClick={cancelTotpFlow} disabled={totpBusy}>
                  {t('profile.security.cancel')}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Passkeys */}
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-dark">{t('profile.security.passkeys.title')}</h3>
              <p className="text-sm text-gray-600">{t('profile.security.passkeys.description')}</p>
            </div>
            <span className="shrink-0 rounded-full border-2 border-dark bg-card-blue px-3 py-1 text-xs font-bold text-dark">
              {credentials.length}
            </span>
          </div>

          {credentialsLoaded && credentials.length === 0 && (
            <p className="text-sm text-gray-500">{t('profile.security.passkeys.empty')}</p>
          )}

          {credentials.length > 0 && (
            <ul className="divide-y divide-gray-200 rounded-xl border-2 border-dark">
              {credentials.map((cred) => (
                <li key={cred.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dark">
                      {cred.name || t('profile.security.passkeys.unnamed')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('profile.security.passkeys.added')}{' '}
                      {new Date(cred.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {cred.lastUsedAt && (
                    <span className="shrink-0 text-xs text-gray-400">
                      {t('profile.security.passkeys.lastUsed')}{' '}
                      {new Date(cred.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Button isLoading={passkeyBusy} onClick={addPasskey} disabled={!supportsWebauthn}>
            {t('profile.security.passkeys.add')}
          </Button>
          {!supportsWebauthn && (
            <p className="text-xs text-gray-500">{t('profile.security.passkeys.unsupported')}</p>
          )}
        </Card>
      </div>
    </div>
  );
};
