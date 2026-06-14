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

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const tv = useTranslations('validation');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { forgotPasswordSchema } = useMemo(
    () => createHuntSchemas(getValidationMessages(tv)),
    [tv]
  );

  type ForgotForm = z.infer<typeof forgotPasswordSchema>;

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success(t('toasts.resetLinkSent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">{t('title')}</CardTitle>
          <CardDescription>{sent ? t('sent.default') : t('description')}</CardDescription>
        </CardHeader>
        {!sent && (
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input id="email" type="email" {...form.register('email')} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {t('actions.sendResetLink')}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm">
              <Link href="/auth/login" className="text-teal hover:underline">
                {t('links.backToSignIn')}
              </Link>
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
