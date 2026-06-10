'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StepList } from '@/components/StepList';
import { InteractiveMap } from '@/components/InteractiveMap';
import { ARViewer } from '@/components/ARViewer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAsync } from '@/hooks/useAsync';
import { useNotificationStore } from '@/lib/notification-store';
import { useAuthStore } from '@/lib/auth-store';
import { chaseService } from '@/lib/chase-service';
import { useI18n } from '@/hooks/useI18n';
import { Chase, UserProgress } from '@/types';

export default function ChaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chaseId = params.id as string;
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { t } = useI18n();

  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const { status: chaseStatus, data: chase } = useAsync(
    () => chaseService.getChase(chaseId),
    true
  ) as { status: string; data: Chase | null };

  const { data: progress, execute: reloadProgress } = useAsync(
    () => chaseService.getCaseProgress(chaseId),
    false
  ) as { data: UserProgress | null; execute: () => Promise<any> };

  useEffect(() => {
    if (user && chase) {
      reloadProgress();
    }
  }, [user, chase, reloadProgress]);

  const handleStartChase = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsStarting(true);
    try {
      await chaseService.startChase(chaseId);
      addNotification({
        type: 'success',
        message: t('chaseDetail.notifications.started'),
      });
      reloadProgress();
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('chaseDetail.notifications.startError'),
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteStep = async () => {
    if (!selectedStep) return;

    try {
      await chaseService.completeStep(chaseId, selectedStep);
      addNotification({
        type: 'success',
        message: t('chaseDetail.notifications.stepCompleted'),
      });
      reloadProgress();
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('chaseDetail.notifications.stepError'),
      });
    }
  };

  if (chaseStatus === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

  if (!chase) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 text-lg">{t('chaseDetail.notFound')}</p>
        <Button className="mt-4" onClick={() => router.push('/chases')}>
          {t('chaseDetail.backToChases')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        {chase.image && (
          <Image
            src={chase.image}
            alt={chase.title}
            width={1280}
            height={640}
            className="w-full h-80 object-cover rounded-2xl border-2 border-dark shadow-arcade"
          />
        )}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-dark">{chase.title}</h1>
          <p className="text-gray-600 font-medium mt-2">{chase.description}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="rounded-xl border-2 border-dark bg-card-orange px-4 py-2 shadow-arcade-sm">
            <p className="text-sm text-gray-600">{t('chaseDetail.difficulty')}</p>
            <p className="font-bold text-dark capitalize">{chase.difficulty}</p>
          </div>
          <div className="rounded-xl border-2 border-dark bg-card-blue px-4 py-2 shadow-arcade-sm">
            <p className="text-sm text-gray-600">{t('chaseDetail.duration')}</p>
            <p className="font-bold text-dark">{t('chaseDetail.durationValue', { minutes: chase.estimatedDuration })}</p>
          </div>
          <div className="rounded-xl border-2 border-dark bg-card-yellow px-4 py-2 shadow-arcade-sm">
            <p className="text-sm text-gray-600">{t('chaseDetail.rating')}</p>
            <p className="font-bold text-dark">{chase.rating}/5 ⭐</p>
          </div>
          <div className="rounded-xl border-2 border-dark bg-card-green px-4 py-2 shadow-arcade-sm">
            <p className="text-sm text-gray-600">{t('chaseDetail.players')}</p>
            <p className="font-bold text-dark">{chase.participants}</p>
          </div>
        </div>

        {progress ? (
          <Card className="bg-card-orange shadow-arcade">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('chaseDetail.yourProgress')}</p>
                <p className="font-bold text-dark">
                  {t('chaseDetail.stepProgress', { current: progress.currentStep, total: progress.totalSteps })}
                </p>
              </div>
              <p className="text-2xl font-black text-dark">{t('chaseDetail.pointsValue', { points: progress.pointsEarned })}</p>
            </div>
          </Card>
        ) : (
          <Button onClick={handleStartChase} size="lg" isLoading={isStarting}>
            {t('chaseDetail.startChase')}
          </Button>
        )}
      </div>

      {/* Map Section */}
      <Card>
        <h2 className="text-2xl font-black tracking-tight text-dark mb-4">{t('chaseDetail.locationMap')}</h2>
        <div style={{ height: '400px' }}>
          <InteractiveMap
            center={[chase.location.latitude, chase.location.longitude] as [number, number]}
            markers={[
              {
                id: 'chase-start',
                position: [chase.location.latitude, chase.location.longitude] as [number, number],
                type: 'chase',
                label: chase.title,
                description: chase.description,
              },
              ...chase.steps.map((step) => ({
                id: step.id,
                position: [step.location.latitude, step.location.longitude] as [number, number],
                type: 'step' as const,
                label: step.title,
                description: step.description,
              })),
            ]}
            onMarkerClick={setSelectedStep}
            className="h-full"
          />
        </div>
      </Card>

      {/* Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black tracking-tight text-dark mb-4">{t('chaseDetail.steps')}</h2>
          <StepList
            steps={chase.steps}
            currentStepIndex={progress ? progress.currentStep - 1 : 0}
            onStepClick={setSelectedStep}
          />
        </div>

        {/* Step Details */}
        {selectedStep && (
          <Card className="bg-card-blue">
            <h3 className="text-xl font-extrabold text-dark mb-4">{t('chaseDetail.stepDetails')}</h3>
            {(() => {
              const step = chase.steps.find((s) => s.id === selectedStep);
              if (!step) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('chaseDetail.title')}</p>
                    <p className="font-semibold text-dark">{step.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">{t('chaseDetail.clue')}</p>
                    <p className="text-dark">💡 {step.clue}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">{t('chaseDetail.coordinates')}</p>
                    <p className="text-sm font-mono text-dark">
                      {step.location.latitude}, {step.location.longitude}
                    </p>
                  </div>

                  {step.arContent && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{t('chaseDetail.arExperience')}</p>
                      <ARViewer
                        modelUrl={step.arContent.data}
                        className="mb-2"
                      />
                      <Button onClick={handleCompleteStep} className="w-full">
                        {t('chaseDetail.interactAr')}
                      </Button>
                    </div>
                  )}

                  {step.reward && (
                    <div className="bg-card-yellow border-2 border-dark p-3 rounded-xl text-center">
                      <p className="font-bold text-dark">{t('chaseDetail.rewardPoints', { points: step.reward })}</p>
                    </div>
                  )}

                  {progress && progress.currentStep === step.order && (
                    <Button onClick={handleCompleteStep} className="w-full" variant="primary">
                      {t('chaseDetail.completeStep')}
                    </Button>
                  )}
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}
