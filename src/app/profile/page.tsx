'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GamificationStats } from '@/components/GamificationStats';
import { LeaderboardComponent } from '@/components/LeaderboardComponent';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useAsync';
import { gamificationService } from '@/lib/gamification-service';
import { useI18n } from '@/hooks/useI18n';
import { Leaderboard } from '@/types';

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const { status: statsStatus, data: stats } = useAsync(
    () => user ? gamificationService.getUserStats(user.id) : Promise.resolve(null),
    !!user
  );

  const { status: leaderboardStatus, data: leaderboard } = useAsync(
    () => gamificationService.getLeaderboard(50),
    true
  ) as { status: string; data: Leaderboard[] | null };

  const { status: rankStatus, data: userRank } = useAsync(
    () => user ? gamificationService.getUserRank(user.id) : Promise.resolve(0),
    !!user
  );

  if (authLoading || statsStatus === 'pending' || leaderboardStatus === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Image
          src={user.profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=FF6B35&color=fff&size=128&bold=true`}
          alt={user.username}
          width={128}
          height={128}
          className="w-32 h-32 rounded-full border-4 border-primary object-cover"
        />
        <div>
          <h1 className="text-4xl font-bold text-dark">{user.username}</h1>
          {user.role && (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t(`common.roles.${user.role}`)}
            </p>
          )}
          {user.role && (
            <p className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-primary">
              {t('profile.demoProfile')}
            </p>
          )}
          <p className="text-gray-600 text-lg">{user.email}</p>
          {user.profile.bio && (
            <p className="text-gray-600 mt-2">{user.profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div>
          <h2 className="text-2xl font-bold text-dark mb-6">{t('profile.yourStats')}</h2>
          <GamificationStats
            points={user.profile.points}
            level={user.profile.level}
            progressPercentage={75}
            completedChases={user.profile.completedChases}
          />
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard && (
        <div>
          <h2 className="text-2xl font-bold text-dark mb-6">{t('profile.globalLeaderboard')}</h2>
          <LeaderboardComponent
            leaderboard={leaderboard}
            currentUserRank={userRank ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
