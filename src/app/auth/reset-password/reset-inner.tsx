'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { resetPasswordSchema } from '@/lib/schemas/hunt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { z } from 'zod';

type ResetForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenParam, newPassword: '' },
  });

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      await authApi.resetPassword(data.token, data.newPassword);
      toast.success('Password updated. Please sign in.');
      router.push('/auth/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">Set new password</CardTitle>
          <CardDescription>Choose a strong new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!tokenParam && (
              <div className="space-y-2">
                <Label htmlFor="token">Reset token</Label>
                <Input id="token" {...form.register('token')} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...form.register('newPassword')} />
              {form.formState.errors.newPassword && (
                <p className="text-xs text-rose-400">{form.formState.errors.newPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Update password
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="text-teal hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
