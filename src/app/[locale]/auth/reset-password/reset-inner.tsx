'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
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

export default function ResetPasswordInner() {
  const t = useTranslations('auth.resetPassword');
  const tv = useTranslations('validation');
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);

  const { resetPasswordSchema } = useMemo(
    () => createHuntSchemas(getValidationMessages(tv)),
    [tv]
  );

  type ResetForm = z.infer<typeof resetPasswordSchema>;

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenParam, newPassword: '' },
  });

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      await authApi.resetPassword(data.token, data.newPassword);
      toast.success(t('toasts.passwordUpdated'));
      router.push('/auth/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.resetFailed'));
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!tokenParam && (
              <div className="space-y-2">
                <Label htmlFor="token">{t('fields.token')}</Label>
                <Input id="token" {...form.register('token')} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('fields.newPassword')}</Label>
              <Input id="newPassword" type="password" {...form.register('newPassword')} />
              {form.formState.errors.newPassword && (
                <p className="text-xs text-rose-400">{form.formState.errors.newPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {t('actions.reset')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="text-teal hover:underline">
              {t('links.backToSignIn')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
