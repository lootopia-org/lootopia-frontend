'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailInner() {
  const t = useTranslations('auth.verify');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success(t('toast'));
      })
      .catch(() => setStatus('error'));
  }, [token, t]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">
            {status === 'loading' && t('loading')}
            {status === 'success' && t('successTitle')}
            {status === 'error' && t('errorTitle')}
          </CardTitle>
          <CardDescription>
            {status === 'success' && t('successDescription')}
            {status === 'error' && t('errorDescription')}
          </CardDescription>
        </CardHeader>
        {status !== 'loading' && (
          <CardContent>
            <Button asChild>
              <Link href="/auth/login">{t('signIn')}</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
