'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { ChaseCard } from '@/components/ChaseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useAsync';
import { chaseService } from '@/lib/chase-service';
import { useI18n } from '@/hooks/useI18n';
import { Chase } from '@/types';

export default function MyChases() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const { status: chaseStatus, data: chases } = useAsync(
    () => user ? chaseService.getUserChases(user.id) : Promise.resolve([]),
    !!user
  ) as { status: string; data: Chase[] | null };

  if (authLoading || chaseStatus === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  // Vue joueur : uniquement les chasses publiées.
  const visibleChases = (chases ?? []).filter((chase) => chase.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-dark mb-4">{t('myChases.title')}</h1>
          <p className="text-gray-600 font-medium text-lg">{t('myChases.subtitle')}</p>
        </div>

        {visibleChases.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">{t('myChases.empty')}</p>
            <a href="/chases" className="text-primary font-semibold hover:underline">
              {t('myChases.explore')}
            </a>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleChases.map((chase) => (
              <ChaseCard key={chase.id} chase={chase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
