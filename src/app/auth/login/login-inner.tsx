'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { get } from '@github/webauthn-json';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/session-store';
import { loginSchema } from '@/lib/schemas/hunt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { z } from 'zod';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const { pendingToken, mfaMethods, setPendingMfa, clearPendingMfa, setUser } = useAuthStore();
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const redirectByRole = async () => {
    const user = await authApi.me();
    setUser(user);
    if (user.role === 'admin') router.push('/admin');
    else if (user.role === 'partner') router.push('/partner');
    else router.push(next.startsWith('/admin') || next.startsWith('/partner') ? '/dashboard' : next);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      authApi.persistToken(res.token);

      if (res.mfaRequired) {
        setPendingMfa(res.token, res.mfaMethods);
        toast.info('Enter your authenticator code to continue');
        return;
      }

      await redirectByRole();
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
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
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const onPasskeyLogin = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast.error('Enter your email first');
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
      toast.success('Signed in with passkey');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Passkey login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">Sign in</CardTitle>
          <CardDescription>Access your Lootopia dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingToken && mfaMethods.includes('totp') ? (
            <div className="space-y-4">
              <Label htmlFor="totp">Authenticator code</Label>
              <Input
                id="totp"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
              <Button className="w-full" onClick={onTotpSubmit} disabled={loading}>
                Verify
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearPendingMfa}>
                Back
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-xs text-rose-400">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password && (
                  <p className="text-xs text-rose-400">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Sign in
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={onPasskeyLogin} disabled={loading}>
                Sign in with passkey
              </Button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-white/50 space-y-2">
            <Link href="/auth/forgot-password" className="text-gold hover:underline block">
              Forgot password?
            </Link>
            <p>
              No account?{' '}
              <Link href="/auth/register" className="text-teal hover:underline">
                Register
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
