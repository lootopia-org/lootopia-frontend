'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { createHuntSchemas } from '@/lib/schemas/hunt';
import { getValidationMessages } from '@/lib/i18n/validation-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { z } from 'zod';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tv = useTranslations('validation');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { registerSchema } = useMemo(
    () => createHuntSchemas(getValidationMessages(tv)),
    [tv]
  );

  type RegisterForm = z.infer<typeof registerSchema>;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', bio: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
        bio: data.bio,
        avatar: '',
      });
      setSuccess(true);
      toast.success(t('toasts.checkEmail'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">{t('success.title')}</CardTitle>
            <CardDescription>{t('success.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/login">{t('success.goToSignIn')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('fields.username')}</Label>
              <Input id="username" {...form.register('username')} />
              {form.formState.errors.username && (
                <p className="text-xs text-rose-400">{form.formState.errors.username.message}</p>
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="bio">{t('fields.bioOptional')}</Label>
              <Input id="bio" {...form.register('bio')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {t('actions.createMyAccount')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-white/50">
            {t('links.haveAccount')}{' '}
            <Link href="/auth/login" className="text-teal hover:underline">
              {t('links.signIn')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
