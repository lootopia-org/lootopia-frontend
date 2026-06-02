'use client';

import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LeaderboardComponent } from '@/components/LeaderboardComponent';
import { useAsync } from '@/hooks/useAsync';
import { gamificationService } from '@/lib/gamification-service';
import { useI18n } from '@/hooks/useI18n';
import { Leaderboard } from '@/types';

export default function LeaderboardPage() {
  const { t } = useI18n();
  const { status, data: leaderboard } = useAsync(
    () => gamificationService.getLeaderboard(100),
    true
  ) as { status: string; data: Leaderboard[] | null };

  if (status === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-dark mb-4">{t('leaderboard.title')}</h1>
          <p className="text-gray-600 text-lg">{t('leaderboard.subtitle')}</p>
        </div>

        {leaderboard && <LeaderboardComponent leaderboard={leaderboard} />}
      </div>
    </div>
  );
}
