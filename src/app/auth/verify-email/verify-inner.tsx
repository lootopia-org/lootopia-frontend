'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailInner() {
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
        toast.success('Email verified!');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">
            {status === 'loading' && 'Verifying email…'}
            {status === 'success' && 'Email verified!'}
            {status === 'error' && 'Verification failed'}
          </CardTitle>
          <CardDescription>
            {status === 'success' && 'Your account is ready. Sign in to continue.'}
            {status === 'error' && 'The link may be invalid or expired.'}
          </CardDescription>
        </CardHeader>
        {status !== 'loading' && (
          <CardContent>
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
