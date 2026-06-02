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
          className={`cursor-pointer border-l-4 ${
            index === currentStepIndex ? 'border-l-primary bg-orange-50' : 'border-l-gray-300'
          }`}
        >
          <div className="space-y-2" onClick={() => onStepClick?.(step.id)}>
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                step.completed ? 'bg-success' : index === currentStepIndex ? 'bg-primary' : 'bg-gray-400'
              }`}>
                {step.completed ? '✓' : step.order}
              </div>
              <div>
                <h3 className="font-bold text-dark">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">💡 {step.clue}</span>
              {step.reward && <span className="font-semibold text-primary">{t('common.pointsValue', { points: step.reward })}</span>}
            </div>

            {step.arContent && (
              <div className="text-xs text-blue-600 font-medium">{t('common.arContentAvailable')}</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
