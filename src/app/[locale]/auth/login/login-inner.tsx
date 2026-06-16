'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { get } from '@github/webauthn-json';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/session-store';
import { createHuntSchemas } from '@/lib/schemas/hunt';
import { getValidationMessages } from '@/lib/i18n/validation-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { z } from 'zod';

export default function LoginPageInner() {
  const t = useTranslations('auth.login');
  const tv = useTranslations('validation');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const { pendingToken, mfaMethods, setPendingMfa, clearPendingMfa, setUser } = useAuthStore();
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginSchema } = useMemo(
    () => createHuntSchemas(getValidationMessages(tv)),
    [tv]
  );

  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const redirectByRole = async () => {
    const user = await authApi.me();
    setUser(user);
    if (user.role === 'admin') router.replace('/admin');
    else if (user.role === 'partner') router.replace('/partner');
    else router.replace(next.startsWith('/admin') || next.startsWith('/partner') ? '/dashboard' : next);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      authApi.persistToken(res.token);

      if (res.mfaRequired) {
        setPendingMfa(res.token, res.mfaMethods);
        toast.info(t('info.mfaRequired'));
        return;
      }

      await redirectByRole();
      toast.success(t('toasts.welcomeBack'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onTotpSubmit = async () => {
    if (!pendingToken || totpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await authApi.verifyTotp(pendingToken, totpCode);
      authApi.persistToken(res.token);
      clearPendingMfa();
      await redirectByRole();
      toast.success(t('toasts.welcomeBack'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const onPasskeyLogin = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast.error(t('toasts.enterEmailFirst'));
      return;
    }
    setLoading(true);
    try {
      const begin = await authApi.beginWebauthnLogin(email);
      const credential = await get({
        publicKey: begin.publicKey as unknown as Parameters<typeof get>[0]['publicKey'],
      });
      const res = await authApi.completeWebauthnLogin(begin.handle, credential);
      authApi.persistToken(res.token);
      await redirectByRole();
      toast.success(t('toasts.signedInWithPasskey'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.passkeyLoginFailed'));
    } finally {
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
          {pendingToken && mfaMethods.includes('totp') ? (
            <div className="space-y-4">
              <Label htmlFor="totp">{t('fields.totp')}</Label>
              <Input
                id="totp"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder={t('placeholders.totp')}
                maxLength={6}
              />
              <Button className="w-full" onClick={onTotpSubmit} disabled={loading}>
                {t('actions.verify')}
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearPendingMfa}>
                {t('actions.back')}
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-xs text-rose-400">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('fields.password')}</Label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password && (
                  <p className="text-xs text-rose-400">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {t('actions.signIn')}
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={onPasskeyLogin} disabled={loading}>
                {t('actions.signInWithPasskey')}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-white/50 space-y-2">
            <Link href="/auth/forgot-password" className="text-gold hover:underline block">
              {t('links.forgotPassword')}
            </Link>
            <p>
              {t('links.noAccount')}{' '}
              <Link href="/auth/register" className="text-teal hover:underline">
                {t('links.register')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
