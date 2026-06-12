'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { get } from '@github/webauthn-json';
import { authApi } from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { User } from '@/types';

/**
 * Relais de connexion passkey pour l'app mobile (flow RFC 8252).
 * L'app ouvre le navigateur système sur cette page avec un paramètre
 * `redirect_uri` ; après authentification WebAuthn, on redirige vers
 * `<redirect_uri>?token=<JWT>` (deep link qui rouvre l'app).
 *
 * Sécurité : seuls les redirect_uri du scheme `lootopia://` sont acceptés
 * (protection open-redirect). Aucune redirection n'est faite sinon.
 */
const ALLOWED_SCHEME = 'lootopia://';

export default function MobileAuthPageInner() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const isValidRedirect =
    redirectUri !== null && redirectUri.startsWith(ALLOWED_SCHEME);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Session web déjà active ? On propose de continuer sans repasser par la passkey.
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
      .catch(() => {
        // Session expirée ou invalide : on ignore, l'utilisateur passera par la passkey.
      });
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

  const cancelToApp = useCallback(
    () => returnToApp('error=auth_failed'),
    [returnToApp]
  );

  const onPasskeyLogin = async () => {
    setError(null);
    if (!email) {
      setError('Saisissez votre email pour continuer.');
      return;
    }
    setLoading(true);
    try {
      const begin = await authApi.beginWebauthnLogin(email);
      const credential = await get({
        publicKey: begin.publicKey as unknown as Parameters<
          typeof get
        >[0]['publicKey'],
      });
      const res = await authApi.completeWebauthnLogin(begin.handle, credential);
      // Token brut renvoyé par l'API (pas le storage web) → deep link vers l'app.
      sendToken(res.token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'La connexion par passkey a échoué.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">
            Connexion à l&apos;app mobile
          </CardTitle>
          <CardDescription>
            Authentifiez-vous avec votre passkey pour retourner dans
            l&apos;application Lootopia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidRedirect ? (
            <div className="space-y-2 text-sm">
              <p className="text-rose-400">
                Lien de redirection invalide ou manquant.
              </p>
              <p className="text-white/50">
                Cette page doit être ouverte depuis l&apos;application mobile
                Lootopia.
              </p>
            </div>
          ) : redirecting ? (
            <p className="text-sm text-white/70">
              Retour vers l&apos;application…
            </p>
          ) : (
            <div className="space-y-4">
              {sessionUser && sessionToken && (
                <>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => sendToken(sessionToken)}
                    disabled={loading}
                  >
                    Continuer en tant que {sessionUser.username}
                  </Button>
                  <p className="text-center text-xs text-white/40">
                    ou connectez-vous avec une passkey
                  </p>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email webauthn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>
              <Button
                type="button"
                variant={sessionUser ? 'secondary' : 'default'}
                className="w-full"
                onClick={onPasskeyLogin}
                disabled={loading}
              >
                {loading ? 'Connexion…' : 'Se connecter avec une passkey'}
              </Button>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={cancelToApp}
                disabled={loading}
              >
                Annuler et revenir à l&apos;app
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
