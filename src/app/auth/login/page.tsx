'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { useI18n } from '@/hooks/useI18n';
import { useNotificationStore } from '@/lib/notification-store';
import { authService } from '@/lib/auth-service';
import { tokenService, userService } from '@/lib/storage-service';
import { useAuthStore } from '@/lib/auth-store';
import { getMockAuthResponse, mockCredentials, MockRole } from '@/lib/mock-auth';
import { LoginResponse, User } from '@/types';
import { get as webauthnGet } from '@github/webauthn-json';

type LoginStage = 'credentials' | 'mfa';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { setUser } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });
  const [stage, setStage] = useState<LoginStage>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingMethods, setPendingMethods] = useState<Array<'totp' | 'webauthn'>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);

  const supportsWebauthn = useMemo(
    () => typeof window !== 'undefined' && 'PublicKeyCredential' in window,
    []
  );

  const persistSession = async (token: string) => {
    tokenService.setToken(token);
    const user = await authService.me();
    userService.setUser(user);
    setUser(user);
    return user;
  };

  const routeAfterLogin = (user: User) => {
    if (user.role === 'admin' || user.role === 'partner') {
      router.push('/partner-studio');
      return;
    }

    router.push('/chases');
  };

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = t('auth.login.validation.emailRequired');
    if (!formData.password) newErrors.password = t('auth.login.validation.passwordRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMfaCode = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) newErrors.code = t('auth.login.validation.codeRequired');

    setErrors((current) => ({ ...current, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginResponse = async (response: LoginResponse) => {
    if (response.mfaRequired) {
      setPendingToken(response.token);
      setPendingMethods(response.mfaMethods);
      setStage('mfa');
      setMfaMessage(
        response.mfaMethods.includes('totp')
          ? t('auth.login.mfa.totpRequired')
          : t('auth.login.mfa.passkeyRequired')
      );
      return;
    }

    const user = await persistSession(response.token);
    addNotification({ type: 'success', message: t('auth.login.messages.success') });
    routeAfterLogin(user);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (stage === 'credentials' && !validateCredentials()) {
      return;
    }

    if (stage === 'mfa' && pendingMethods.includes('totp') && !validateMfaCode()) {
      return;
    }

    setIsLoading(true);
    setEmailNotVerified(false);

    try {
      if (stage === 'mfa') {
        if (!pendingToken) {
          throw new Error('Missing pending token');
        }

        if (pendingMethods.includes('totp')) {
          const response = await authService.verifyTotp(pendingToken, formData.code);
          const user = await persistSession(response.token);
          addNotification({ type: 'success', message: t('auth.login.messages.success') });
          routeAfterLogin(user);
          return;
        }

        throw new Error(t('auth.login.mfa.passkeyRequired'));
      }

      const response = await authService.login(formData.email, formData.password);
      await handleLoginResponse(response);
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      // L'API renvoie ses erreurs en texte brut (pas de JSON {code,message}).
      const text =
        typeof data === 'string' ? data : data?.message || data?.code || '';
      const isEmailNotVerified =
        status === 403 || data?.code === 'email_not_verified' || /verif/i.test(text);

      if (isEmailNotVerified) {
        setEmailNotVerified(true);
        addNotification({ type: 'error', message: t('auth.login.messages.emailNotVerified') });
      } else {
        addNotification({
          type: 'error',
          message: text || error?.message || t('auth.login.messages.error'),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMock = async (role: MockRole) => {
    setIsLoading(true);
    try {
      const response = getMockAuthResponse(role);
      tokenService.setToken(response.token);
      userService.setUser(response.user);
      setUser(response.user);

      addNotification({
        type: 'success',
        message: t(
          role === 'admin'
            ? 'auth.login.mock.adminSuccess'
            : role === 'partner'
              ? 'auth.login.mock.partnerSuccess'
              : 'auth.login.mock.playerSuccess'
        ),
      });

      routeAfterLogin(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!formData.email) {
      setErrors((current) => ({
        ...current,
        email: t('auth.login.validation.emailRequired'),
      }));
      return;
    }

    setIsLoading(true);
    try {
      await authService.resendVerification(formData.email);
      addNotification({
        type: 'success',
        message: t('auth.login.messages.verificationSent'),
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error?.response?.data?.message || t('auth.login.messages.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPasskey = async () => {
    if (!supportsWebauthn) {
      addNotification({ type: 'error', message: t('auth.login.mfa.passkeyUnsupported') });
      return;
    }

    if (!formData.email) {
      setErrors((current) => ({
        ...current,
        email: t('auth.login.validation.emailRequired'),
      }));
      return;
    }

    setIsLoading(true);
    try {
      const beginResponse = await authService.beginWebauthnLogin(formData.email);

      // L'API attend exactement le JSON produit par webauthn-json (`get`),
      // qui consomme directement les options `publicKey` renvoyées par /begin.
      // Le serveur renvoie les options au format JSON (base64url) malgré le type DOM déclaré.
      const credential = await webauthnGet({ publicKey: beginResponse.publicKey as any });

      const completeResponse = await authService.completeWebauthnLogin(
        beginResponse.handle,
        credential
      );
      const user = await persistSession(completeResponse.token);

      addNotification({ type: 'success', message: t('auth.login.messages.passkeySuccess') });
      routeAfterLogin(user);
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error?.response?.data?.message || t('auth.login.messages.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-dark">{t('auth.login.title')}</h1>
          <p className="text-gray-600 font-medium">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.login.form.email')}
            type="email"
            placeholder={t('auth.login.form.emailPlaceholder')}
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            error={errors.email}
            disabled={stage === 'mfa'}
          />

          {stage === 'credentials' ? (
            <Input
              label={t('auth.login.form.password')}
              type="password"
              placeholder={t('auth.login.form.passwordPlaceholder')}
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              error={errors.password}
            />
          ) : (
            <Input
              label={t('auth.login.mfa.codeLabel')}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={t('auth.login.mfa.codePlaceholder')}
              value={formData.code}
              onChange={(event) => setFormData({ ...formData, code: event.target.value })}
              error={errors.code}
            />
          )}

          {mfaMessage && <p className="rounded-xl border-2 border-dark bg-card-blue px-4 py-3 text-sm font-medium text-dark">{mfaMessage}</p>}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {stage === 'mfa' ? t('auth.login.mfa.submit') : t('auth.login.form.submit')}
          </Button>

          {stage === 'mfa' && pendingMethods.includes('webauthn') && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              isLoading={isLoading}
              onClick={loginWithPasskey}
            >
              {t('auth.login.mfa.loginWithPasskey')}
            </Button>
          )}

          {/* Connexion par passkey : chemin autonome qui ne demande que l'email
              (begin -> navigator.credentials.get -> complete -> session). */}
          {stage === 'credentials' && supportsWebauthn && (
            <>
              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                {t('auth.login.form.or')}
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                isLoading={isLoading}
                onClick={loginWithPasskey}
              >
                {t('auth.login.mfa.loginWithPasskey')}
              </Button>
            </>
          )}
        </form>

        {emailNotVerified && (
          <div className="rounded-xl border-2 border-dark bg-card-orange p-4 space-y-3">
            <p className="text-sm font-medium text-dark">{t('auth.login.messages.emailNotVerified')}</p>
            <Button type="button" variant="outline" className="w-full" isLoading={isLoading} onClick={resendVerification}>
              {t('auth.login.mfa.resendVerification')}
            </Button>
          </div>
        )}

        <div className="space-y-3 rounded-xl border-2 border-dark bg-card-yellow p-4">
          <div className="text-sm font-bold text-dark">{t('auth.login.mock.title')}</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setFormData({
                  email: mockCredentials.admin.email,
                  password: mockCredentials.admin.password,
                  code: '',
                });
                setStage('credentials');
              }}
            >
              {t('auth.login.mock.fillAdmin')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setFormData({
                  email: mockCredentials.partner.email,
                  password: mockCredentials.partner.password,
                  code: '',
                });
                setStage('credentials');
              }}
            >
              {t('auth.login.mock.fillPartner')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setFormData({
                  email: mockCredentials.player.email,
                  password: mockCredentials.player.password,
                  code: '',
                });
                setStage('credentials');
              }}
            >
              {t('auth.login.mock.fillPlayer')}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              type="button"
              className="w-full"
              isLoading={isLoading}
              onClick={() => loginWithMock('admin')}
            >
              {t('auth.login.mock.loginAdmin')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              isLoading={isLoading}
              onClick={() => loginWithMock('partner')}
            >
              {t('auth.login.mock.loginPartner')}
            </Button>
            <Button
              type="button"
              className="w-full"
              isLoading={isLoading}
              onClick={() => loginWithMock('player')}
            >
              {t('auth.login.mock.loginPlayer')}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          {t('auth.login.noAccount')}{' '}
          <Link href="/auth/register" className="text-primary font-semibold hover:underline">
            {t('auth.login.createOne')}
          </Link>
        </div>

        <Link href="/" className="text-center text-sm text-gray-600 hover:underline">
          {t('auth.login.backHome')}
        </Link>
      </Card>
    </div>
  );
}