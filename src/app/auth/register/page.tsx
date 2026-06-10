'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { useI18n } from '@/hooks/useI18n';
import { useNotificationStore } from '@/lib/notification-store';
import { authService } from '@/lib/auth-service';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t('auth.register.validation.emailRequired');
    if (!formData.password) newErrors.password = t('auth.register.validation.passwordRequired');
    if (formData.password.length < 8) newErrors.password = t('auth.register.validation.passwordMin');
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.validation.passwordMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // L'API renvoie ses erreurs en texte brut (pas de JSON {message}), et le
  // proxy renvoie un 502 JSON quand le backend est injoignable. On traduit
  // le statut HTTP en un message clair plutôt qu'un « Échec » générique.
  const messageForError = (error: any): string => {
    // Timeout / requête avortée côté client
    if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message ?? '')) {
      return t('auth.register.messages.timeout');
    }

    const status: number | undefined = error?.response?.status;

    // Aucune réponse = réseau coupé / proxy qui n'a pas pu joindre le backend
    if (!status) {
      return t('auth.register.messages.unreachable');
    }

    switch (true) {
      case status === 409:
        return t('auth.register.messages.alreadyExists');
      case status === 400 || status === 422:
        return t('auth.register.messages.invalidInput');
      case status === 502 || status === 503 || status === 504:
        return t('auth.register.messages.unreachable');
      case status >= 500:
        // 500 ici = le serveur a planté en envoyant l'email de vérification (SMTP).
        return t('auth.register.messages.serverError');
      default: {
        const data = error?.response?.data;
        const serverText = typeof data === 'string' ? data : data?.message;
        return serverText || t('auth.register.messages.error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.register(formData.email, formData.password);

      // 2xx : compte créé côté serveur.
      addNotification({
        type: 'success',
        message: t('auth.register.messages.success'),
      });

      router.push('/auth/login');
    } catch (error: any) {
      addNotification({ type: 'error', message: messageForError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-dark">{t('auth.register.title')}</h1>
          <p className="text-gray-600 font-medium">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.register.form.email')}
            type="email"
            placeholder={t('auth.register.form.emailPlaceholder')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <Input
            label={t('auth.register.form.password')}
            type="password"
            placeholder={t('auth.register.form.passwordPlaceholder')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />

          <Input
            label={t('auth.register.form.confirmPassword')}
            type="password"
            placeholder={t('auth.register.form.passwordPlaceholder')}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('auth.register.form.submit')}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {t('auth.register.alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </div>

        <Link href="/" className="text-center text-sm text-gray-600 hover:underline">
          {t('auth.register.backHome')}
        </Link>
      </Card>
    </div>
  );
}
