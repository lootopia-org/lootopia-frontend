'use client';

import React from 'react';
import { Card } from './Card';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

interface GamificationStatsProps {
  points: number;
  level: number;
  progressPercentage: number;
  completedChases: number;
}

export const GamificationStats: React.FC<GamificationStatsProps> = ({
  points,
  level,
  progressPercentage,
  completedChases,
}) => {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="text-center bg-card-orange shadow-arcade">
        <div className="space-y-2">
          <div className="text-4xl font-black text-dark">{points}</div>
          <p className="text-sm font-medium text-gray-600">{t('gamification.points')}</p>
        </div>
      </Card>

      <Card className="text-center bg-card-blue shadow-arcade">
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-dark"
          >
            {level}
          </motion.div>
          <p className="text-sm font-medium text-gray-600">{t('gamification.level')}</p>
        </div>
      </Card>

      <Card className="text-center bg-card-yellow shadow-arcade">
        <div className="space-y-2">
          <div className="relative w-16 h-16 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="4"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#FF6B35"
                strokeWidth="4"
                strokeDasharray={`${(progressPercentage / 100) * 176} 176`}
                initial={{ strokeDasharray: '0 176' }}
                animate={{ strokeDasharray: `${(progressPercentage / 100) * 176} 176` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-dark">
              {progressPercentage}%
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600">{t('gamification.nextLevel')}</p>
        </div>
      </Card>

      <Card className="text-center bg-card-green shadow-arcade">
        <div className="space-y-2">
          <div className="text-4xl font-black text-dark">{completedChases}</div>
          <p className="text-sm font-medium text-gray-600">{t('gamification.chases')}</p>
        </div>
      </Card>
    </div>
  );
};
