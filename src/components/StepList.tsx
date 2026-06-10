'use client';

import React from 'react';
import { Card } from './Card';
import { ChaseStep } from '@/types';
import { useI18n } from '@/hooks/useI18n';

interface StepListProps {
  steps: ChaseStep[];
  currentStepIndex?: number;
  onStepClick?: (stepId: string) => void;
}

export const StepList: React.FC<StepListProps> = ({ steps, currentStepIndex = 0, onStepClick }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <Card
          key={step.id}
          hover
          className={`cursor-pointer ${
            index === currentStepIndex ? 'bg-card-orange' : ''
          }`}
        >
          <div className="space-y-2" onClick={() => onStepClick?.(step.id)}>
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-dark font-bold text-white ${
                step.completed ? 'bg-success' : index === currentStepIndex ? 'bg-primary' : 'bg-gray-400'
              }`}>
                {step.completed ? '✓' : step.order}
              </div>
              <div>
                <h3 className="font-extrabold text-dark">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">💡 {step.clue}</span>
              {step.reward && <span className="rounded-full border-2 border-dark bg-card-yellow px-3 py-1 text-xs font-bold text-dark">{t('common.pointsValue', { points: step.reward })}</span>}
            </div>

            {step.arContent && (
              <div className="inline-flex rounded-full border-2 border-dark bg-card-blue px-3 py-1 text-xs font-bold text-dark">{t('common.arContentAvailable')}</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
