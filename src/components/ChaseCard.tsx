'use client';

import React from 'react';
import { Card } from './Card';
import { Chase } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/hooks/useI18n';

interface ChaseCardProps {
  chase: Chase;
}

export const ChaseCard: React.FC<ChaseCardProps> = ({ chase }) => {
  const { t } = useI18n();
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <Link href={`/chases/${chase.id}`}>
      <Card hover className="cursor-pointer">
        <div className="space-y-3">
          {chase.image && (
            <Image
              src={chase.image}
              alt={chase.title}
              width={640}
              height={320}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          <div>
            <h3 className="text-lg font-bold text-dark">{chase.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{chase.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${difficultyColors[chase.difficulty]}`}>
              {t(`common.difficulty.${chase.difficulty}`)}
            </span>
            <span className="text-sm font-semibold text-primary">{chase.rating}/5 ⭐</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{t('common.durationMin', { minutes: chase.estimatedDuration })}</span>
            <span>{t('common.playersCount', { count: chase.participants })}</span>
          </div>

          <div className="text-xs text-gray-600">
            {t('common.by')} <strong>{chase.partner.name}</strong>
          </div>
        </div>
      </Card>
    </Link>
  );
};
