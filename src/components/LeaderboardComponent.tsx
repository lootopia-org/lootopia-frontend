'use client';

import React from 'react';
import { Card } from './Card';
import { Leaderboard } from '@/types';
import { useI18n } from '@/hooks/useI18n';

interface LeaderboardProps {
  leaderboard: Leaderboard[];
  currentUserRank?: number;
}

export const LeaderboardComponent: React.FC<LeaderboardProps> = ({ leaderboard, currentUserRank }) => {
  const { t } = useI18n();

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '◦';
    }
  };

  return (
    <Card>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-dark mb-4">{t('leaderboard.topPlayers')}</h2>
        {leaderboard.map((entry) => (
          <div
            key={entry.user.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              currentUserRank === entry.rank ? 'bg-orange-50 border-2 border-primary' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
              <div>
                <p className="font-semibold text-dark">{entry.user.username}</p>
                <p className="text-xs text-gray-600">
                  {t('leaderboard.chasesCompleted', { count: entry.chases_completed })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{entry.points}</p>
              <p className="text-xs text-gray-600">{t('leaderboard.points')}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
