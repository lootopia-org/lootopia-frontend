'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { registerSchema } from '@/lib/schemas/hunt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { z } from 'zod';

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
        avatar: ""
      });
      setSuccess(true);
      toast.success('Check your email to verify your account');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to your inbox. Click it to activate your account, then sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/login">Go to sign in</Link>
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
          <CardTitle className="font-[family-name:var(--font-syne)] text-2xl">Create account</CardTitle>
          <CardDescription>Join Lootopia and start your adventure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...form.register('username')} />
              {form.formState.errors.username && (
                <p className="text-xs text-rose-400">{form.formState.errors.username.message}</p>
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Input id="bio" {...form.register('bio')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Create account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-teal hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
