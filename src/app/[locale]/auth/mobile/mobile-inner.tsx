'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { get } from '@github/webauthn-json';
import { authApi } from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/types';

const ALLOWED_SCHEME = 'lootopia://';

export default function MobileAuthPageInner() {
  const t = useTranslations('auth.mobile');
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const isValidRedirect = redirectUri !== null && redirectUri.startsWith(ALLOWED_SCHEME);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    let cancelled = false;
    authApi
      .me()
      .then((user) => {
        if (!cancelled) {
          setSessionUser(user);
          setSessionToken(token);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const returnToApp = useCallback(
    (query: string) => {
      if (!isValidRedirect || !redirectUri) return;
      setRedirecting(true);
      window.location.href = `${redirectUri}?${query}`;
    },
    [isValidRedirect, redirectUri]
  );

  const sendToken = useCallback(
    (token: string) => returnToApp(`token=${encodeURIComponent(token)}`),
    [returnToApp]
  );

  const cancelToApp = useCallback(() => returnToApp('error=auth_failed'), [returnToApp]);

  const onPasskeyLogin = async () => {
    setError(null);
    if (!email) {
      setError(t('errors.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      const begin = await authApi.beginWebauthnLogin(email);
      const credential = await get({
        publicKey: begin.publicKey as unknown as Parameters<typeof get>[0]['publicKey'],
      });
      const res = await authApi.completeWebauthnLogin(begin.handle, credential);
      sendToken(res.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.passkeyFailed'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidRedirect ? (
            <div className="space-y-2 text-sm">
              <p className="text-rose-400">{t('invalidRedirect.error')}</p>
              <p className="text-white/50">{t('invalidRedirect.hint')}</p>
            </div>
          ) : redirecting ? (
            <p className="text-sm text-white/70">{t('redirecting')}</p>
          ) : (
            <div className="space-y-4">
              {sessionUser && sessionToken && (
                <>
                  <Button type="button" className="w-full" onClick={() => sendToken(sessionToken)} disabled={loading}>
                    {t('continueAs', { username: sessionUser.username })}
                  </Button>
                  <p className="text-center text-xs text-white/40">{t('orPasskey')}</p>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email webauthn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholders.email')}
                />
              </div>
              <Button
                type="button"
                variant={sessionUser ? 'secondary' : 'default'}
                className="w-full"
                onClick={onPasskeyLogin}
                disabled={loading}
              >
                {loading ? t('actions.connecting') : t('actions.signInWithPasskey')}
              </Button>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button type="button" variant="ghost" className="w-full" onClick={cancelToApp} disabled={loading}>
                {t('actions.cancel')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
