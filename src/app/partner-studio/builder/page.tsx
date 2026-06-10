'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { StatusBadge } from '@/components/StatusBadge';
import { InteractiveMap } from '@/components/InteractiveMap';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useNotificationStore } from '@/lib/notification-store';
import { chaseService } from '@/lib/chase-service';
import { ChaseStep } from '@/types';

type TemplateId = 'retail' | 'event' | 'team' | 'museum';

interface StepDraft {
  id: string;
  title: string;
  clue: string;
  reward: string;
  challenge: string;
  description: string;
  location: { latitude: number; longitude: number };
}

interface TemplateStepDraft {
  titleKey: string;
  descriptionKey: string;
  clueKey: string;
  rewardKey: string;
  challenge: string;
  location: { latitude: number; longitude: number };
}

interface StudioConfig {
  name: string;
  objective: string;
  duration: string;
  location: string;
  locationCoords: { latitude: number; longitude: number };
  language: 'FR' | 'EN';
  reward: string;
  launchMode: 'draft' | 'test' | 'live';
  difficulty: 'easy' | 'medium' | 'hard';
  image: string;
}

const templates: Array<{
  id: TemplateId;
  nameKey: string;
  descriptionKey: string;
  accent: string;
  objectiveKey: string;
  duration: string;
  locationKey: string;
  locationCoords: { latitude: number; longitude: number };
  rewardKey: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image: string;
  steps: TemplateStepDraft[];
}> = [
  {
    id: 'retail',
    nameKey: 'builder.templates.retail.name',
    descriptionKey: 'builder.templates.retail.description',
    accent: 'bg-card-orange',
    objectiveKey: 'builder.templates.retail.objective',
    duration: '35 min',
    locationKey: 'builder.templates.retail.location',
    locationCoords: { latitude: 37.808, longitude: -122.417 },
    rewardKey: 'builder.templates.retail.reward',
    difficulty: 'easy',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        titleKey: 'builder.templates.retail.step1.title',
        descriptionKey: 'builder.templates.retail.step1.description',
        clueKey: 'builder.templates.retail.step1.clue',
        rewardKey: 'builder.templates.retail.step1.reward',
        challenge: 'QR + validation lieu',
        location: { latitude: 37.808, longitude: -122.417 },
      },
      {
        titleKey: 'builder.templates.retail.step2.title',
        descriptionKey: 'builder.templates.retail.step2.description',
        clueKey: 'builder.templates.retail.step2.clue',
        rewardKey: 'builder.templates.retail.step2.reward',
        challenge: 'Indice visuel',
        location: { latitude: 37.803, longitude: -122.414 },
      },
      {
        titleKey: 'builder.templates.retail.step3.title',
        descriptionKey: 'builder.templates.retail.step3.description',
        clueKey: 'builder.templates.retail.step3.clue',
        rewardKey: 'builder.templates.retail.step3.reward',
        challenge: 'Énigme finale',
        location: { latitude: 37.797, longitude: -122.409 },
      },
    ],
  },
  {
    id: 'event',
    nameKey: 'builder.templates.event.name',
    descriptionKey: 'builder.templates.event.description',
    accent: 'bg-card-blue',
    objectiveKey: 'builder.templates.event.objective',
    duration: '20 min',
    locationKey: 'builder.templates.event.location',
    locationCoords: { latitude: 37.808, longitude: -122.417 },
    rewardKey: 'builder.templates.event.reward',
    difficulty: 'medium',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        titleKey: 'builder.templates.event.step1.title',
        descriptionKey: 'builder.templates.event.step1.description',
        clueKey: 'builder.templates.event.step1.clue',
        rewardKey: 'builder.templates.event.step1.reward',
        challenge: 'QR + validation lieu',
        location: { latitude: 37.808, longitude: -122.417 },
      },
      {
        titleKey: 'builder.templates.event.step2.title',
        descriptionKey: 'builder.templates.event.step2.description',
        clueKey: 'builder.templates.event.step2.clue',
        rewardKey: 'builder.templates.event.step2.reward',
        challenge: 'QCM',
        location: { latitude: 37.803, longitude: -122.414 },
      },
      {
        titleKey: 'builder.templates.event.step3.title',
        descriptionKey: 'builder.templates.event.step3.description',
        clueKey: 'builder.templates.event.step3.clue',
        rewardKey: 'builder.templates.event.step3.reward',
        challenge: 'Validation média',
        location: { latitude: 37.797, longitude: -122.409 },
      },
    ],
  },
  {
    id: 'team',
    nameKey: 'builder.templates.team.name',
    descriptionKey: 'builder.templates.team.description',
    accent: 'bg-card-green',
    objectiveKey: 'builder.templates.team.objective',
    duration: '55 min',
    locationKey: 'builder.templates.team.location',
    locationCoords: { latitude: 37.808, longitude: -122.417 },
    rewardKey: 'builder.templates.team.reward',
    difficulty: 'hard',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        titleKey: 'builder.templates.team.step1.title',
        descriptionKey: 'builder.templates.team.step1.description',
        clueKey: 'builder.templates.team.step1.clue',
        rewardKey: 'builder.templates.team.step1.reward',
        challenge: 'Collaboration',
        location: { latitude: 37.808, longitude: -122.417 },
      },
      {
        titleKey: 'builder.templates.team.step2.title',
        descriptionKey: 'builder.templates.team.step2.description',
        clueKey: 'builder.templates.team.step2.clue',
        rewardKey: 'builder.templates.team.step2.reward',
        challenge: 'Énigme libre',
        location: { latitude: 37.803, longitude: -122.414 },
      },
      {
        titleKey: 'builder.templates.team.step3.title',
        descriptionKey: 'builder.templates.team.step3.description',
        clueKey: 'builder.templates.team.step3.clue',
        rewardKey: 'builder.templates.team.step3.reward',
        challenge: 'Collaboration',
        location: { latitude: 37.797, longitude: -122.409 },
      },
    ],
  },
  {
    id: 'museum',
    nameKey: 'builder.templates.museum.name',
    descriptionKey: 'builder.templates.museum.description',
    accent: 'bg-card-yellow',
    objectiveKey: 'builder.templates.museum.objective',
    duration: '90 min',
    locationKey: 'builder.templates.museum.location',
    locationCoords: { latitude: 37.7858, longitude: -122.401 },
    rewardKey: 'builder.templates.museum.reward',
    difficulty: 'hard',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        titleKey: 'builder.templates.museum.step1.title',
        descriptionKey: 'builder.templates.museum.step1.description',
        clueKey: 'builder.templates.museum.step1.clue',
        rewardKey: 'builder.templates.museum.step1.reward',
        challenge: 'QR + validation lieu',
        location: { latitude: 37.7858, longitude: -122.401 },
      },
      {
        titleKey: 'builder.templates.museum.step2.title',
        descriptionKey: 'builder.templates.museum.step2.description',
        clueKey: 'builder.templates.museum.step2.clue',
        rewardKey: 'builder.templates.museum.step2.reward',
        challenge: 'Indice visuel',
        location: { latitude: 37.788, longitude: -122.403 },
      },
      {
        titleKey: 'builder.templates.museum.step3.title',
        descriptionKey: 'builder.templates.museum.step3.description',
        clueKey: 'builder.templates.museum.step3.clue',
        rewardKey: 'builder.templates.museum.step3.reward',
        challenge: 'Énigme finale',
        location: { latitude: 37.79, longitude: -122.405 },
      },
    ],
  },
];

const participationSeries = [92, 85, 74, 61, 48];

const publicationCheckKeys = [
  'builder.checks.brand',
  'builder.checks.content',
  'builder.checks.gdpr',
  'builder.checks.audit',
];

const difficultyOptions: Array<{ value: StudioConfig['difficulty']; labelKey: string; chip: string }> = [
  { value: 'easy', labelKey: 'builder.difficulty.easy', chip: 'bg-card-green' },
  { value: 'medium', labelKey: 'builder.difficulty.medium', chip: 'bg-card-yellow' },
  { value: 'hard', labelKey: 'builder.difficulty.hard', chip: 'bg-card-orange' },
];

const CHALLENGE_OPTIONS = [
  'QR + validation lieu',
  'Indice visuel',
  'Énigme finale',
  'QCM',
  'Validation média',
  'Collaboration',
  'Énigme libre',
] as const;

/** Les valeurs de défi restent des identifiants internes (non traduits) ; seul l'affichage passe par i18n. */
const challengeLabelKeys: Record<string, string> = {
  'QR + validation lieu': 'builder.challenges.qrLocation',
  'Indice visuel': 'builder.challenges.visualClue',
  'Énigme finale': 'builder.challenges.finalRiddle',
  'QCM': 'builder.challenges.quiz',
  'Validation média': 'builder.challenges.media',
  'Collaboration': 'builder.challenges.collaboration',
  'Énigme libre': 'builder.challenges.freeRiddle',
};

/** Icône SVG inline par type de défi (même approche que src/app/page.tsx, aucune dépendance d'icônes). */
function ChallengeIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  const svg = { className, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 2 } as const;
  switch (type) {
    case 'QR + validation lieu':
      return (<svg {...svg}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM15 15h2v2h-2zM19 15h1M15 19h2M19 19h1" /></svg>);
    case 'Indice visuel':
      return (<svg {...svg}><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12C3.8 7.9 7.5 5 12 5s8.2 2.9 9.5 7c-1.3 4.1-5 7-9.5 7s-8.2-2.9-9.5-7z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'QCM':
      return (<svg {...svg}><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>);
    case 'Validation média':
      return (<svg {...svg}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><circle cx="12" cy="13" r="3.2" /></svg>);
    case 'Collaboration':
      return (<svg {...svg}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h4v-2a3 3 0 00-5.3-1.9M7 20H3v-2a3 3 0 015.3-1.9M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
    case 'Énigme finale':
    case 'Énigme libre':
    default:
      return (<svg {...svg}><path strokeLinecap="round" strokeLinejoin="round" d="M8.2 9a3.5 3.5 0 116.8 1.2c-.5 1.2-1.8 1.8-2.5 2.8-.3.4-.5.9-.5 1.5M12 17h.01" /></svg>);
  }
}

export default function PartnerStudioBuilderPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();
  const { addNotification } = useNotificationStore();

  const cloneSteps = (template: (typeof templates)[number]): StepDraft[] =>
    template.steps.map((step, index) => ({
      id: `${template.id}-${index + 1}`,
      title: t(step.titleKey),
      description: t(step.descriptionKey),
      clue: t(step.clueKey),
      reward: t(step.rewardKey),
      challenge: step.challenge,
      location: step.location,
    }));

  const challengeLabel = (value: string) =>
    challengeLabelKeys[value] ? t(challengeLabelKeys[value]) : value;

  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('retail');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [placementTarget, setPlacementTarget] = useState<'start' | 'step'>('start');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [config, setConfig] = useState<StudioConfig>(() => ({
    name: t('builder.defaults.huntName'),
    objective: t(templates[0].objectiveKey),
    duration: templates[0].duration,
    location: t(templates[0].locationKey),
    locationCoords: templates[0].locationCoords,
    language: 'FR',
    reward: t(templates[0].rewardKey),
    launchMode: 'draft',
    difficulty: templates[0].difficulty,
    image: templates[0].image,
  }));
  const [steps, setSteps] = useState<StepDraft[]>(() => cloneSteps(templates[0]));

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId]
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'partner') {
      router.replace('/chases');
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  useEffect(() => {
    const nextSteps = cloneSteps(selectedTemplate);
    setSteps(nextSteps);
    setConfig((current) => ({
      ...current,
      objective: t(selectedTemplate.objectiveKey),
      duration: selectedTemplate.duration,
      location: t(selectedTemplate.locationKey),
      locationCoords: selectedTemplate.locationCoords,
      reward: t(selectedTemplate.rewardKey),
      difficulty: selectedTemplate.difficulty,
      image: selectedTemplate.image,
    }));
    setSelectedStepIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Card className="w-full space-y-4 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-primary">{t('builder.loading.kicker')}</div>
            <h1 className="text-3xl font-black text-dark">{t('builder.loading.title')}</h1>
            <p className="font-medium text-gray-600">{t('builder.loading.subtitle')}</p>
          </Card>
        </div>
      </div>
    );
  }

  const currentStep = steps[selectedStepIndex] ?? steps[0];

  const updateStep = (field: keyof StepDraft, value: string | any) => {
    setSteps((currentSteps) =>
      currentSteps.map((step, index) => (index === selectedStepIndex ? { ...step, [field]: value } : step))
    );
  };

  const addStep = () => {
    setSteps((currentSteps) => {
      const nextSteps = [
        ...currentSteps,
        {
          id: `custom-${Date.now()}`,
          title: t('builder.steps.newTitle'),
          description: t('builder.steps.newDescription'),
          clue: t('builder.steps.newClue'),
          reward: '50 pts',
          challenge: 'Énigme libre',
          location: { latitude: 37.808, longitude: -122.417 },
        },
      ];

      setSelectedStepIndex(nextSteps.length - 1);
      return nextSteps;
    });

    addNotification({ type: 'info', message: t('builder.notifications.stepAdded') });
  };

  const deleteStep = (indexToDelete: number) => {
    if (steps.length <= 1) {
      addNotification({ type: 'error', message: t('builder.notifications.keepOneStep') });
      return;
    }

    setSteps((currentSteps) => currentSteps.filter((_, index) => index !== indexToDelete));

    // Adjust selected index
    if (selectedStepIndex >= indexToDelete && selectedStepIndex > 0) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }

    addNotification({ type: 'info', message: t('builder.notifications.stepDeleted') });
  };

  const reorderSteps = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= steps.length || to >= steps.length) {
      return;
    }

    setSteps((currentSteps) => {
      const next = [...currentSteps];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

    setSelectedStepIndex((current) => {
      if (current === from) return to;
      if (from < current && to >= current) return current - 1;
      if (from > current && to <= current) return current + 1;
      return current;
    });
  };

  const activeCoords = placementTarget === 'step' ? currentStep.location : config.locationCoords;

  const setActiveCoords = (latitude: number, longitude: number) => {
    if (placementTarget === 'step') {
      updateStep('location', { latitude, longitude });
    } else {
      setConfig((current) => ({ ...current, locationCoords: { latitude, longitude } }));
    }
  };

  const geocodeAddress = async () => {
    const query = addressQuery.trim();
    if (!query) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: 'application/json' } }
      );
      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        addNotification({ type: 'error', message: t('builder.notifications.addressNotFound') });
        return;
      }

      setActiveCoords(parseFloat(results[0].lat), parseFloat(results[0].lon));
      addNotification({ type: 'success', message: t('builder.notifications.addressLocated') });
    } catch {
      addNotification({ type: 'error', message: t('builder.notifications.geocodingUnavailable') });
    }
  };

  const applyTemplate = (templateId: TemplateId) => {
    const nextTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
    setSelectedTemplateId(templateId);
    addNotification({
      type: 'success',
      message: t('builder.notifications.templateLoaded', { name: t(nextTemplate.nameKey) }),
    });
  };

  const parseReward = (rewardStr: string): number => {
    const match = rewardStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 50;
  };

  const saveChase = async () => {
    setIsSaving(true);
    try {
      const chaseSteps: ChaseStep[] = steps.map((step, index) => ({
        id: step.id,
        order: index + 1,
        title: step.title,
        description: step.description,
        clue: step.clue,
        location: step.location,
        reward: parseReward(step.reward),
        completed: false,
      }));

      const chaseData = {
        title: config.name,
        description: config.objective,
        image: config.image,
        difficulty: config.difficulty,
        estimatedDuration: parseInt(config.duration),
        location: config.locationCoords,
        status: config.launchMode === 'live' ? 'active' : 'draft',
        launchMode: config.launchMode,
        partner: {
          id: user?.id || 'partner-1',
          name: user?.name || 'Partner',
          email: user?.email || 'partner@lootopia.com',
          description: '',
          logo: '',
          chases: [],
        },
        steps: chaseSteps,
      };

      await chaseService.createChase(chaseData as any);
      setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      addNotification({ type: 'success', message: t('builder.notifications.huntSaved') });
    } catch (error) {
      console.error('Error saving chase:', error);
      addNotification({ type: 'error', message: t('builder.notifications.saveError') });
    } finally {
      setIsSaving(false);
    }
  };

  const launchModes: Array<{ id: StudioConfig['launchMode']; labelKey: string }> = [
    { id: 'draft', labelKey: 'builder.actions.draft' },
    { id: 'test', labelKey: 'builder.actions.test' },
    { id: 'live', labelKey: 'builder.actions.live' },
  ];

  return (
    <div className="relative overflow-hidden bg-cream">
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 pt-8 pb-28 md:pt-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 rounded-2xl border-2 border-dark bg-white p-6 shadow-arcade md:grid-cols-[1.3fr_0.7fr] md:p-8"
        >
          <div className="space-y-5">
            <div className="inline-flex rounded-full border-2 border-dark bg-card-yellow px-3 py-1 text-xs font-bold text-dark">
              {t('builder.hero.badge')}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-dark md:text-6xl">
                {t('builder.hero.title')}
              </h1>
              <p className="max-w-2xl text-lg font-medium text-gray-600 md:text-xl">
                {t('builder.hero.subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => applyTemplate('retail')}>{t('builder.hero.startWithTemplate')}</Button>
              <Button variant="outline" onClick={() => router.push('/chases')}>
                {t('builder.hero.playerView')}
              </Button>
            </div>
          </div>

          <Card className="!bg-dark text-white shadow-arcade">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t('builder.hero.status')}</span>
                <StatusBadge status={config.launchMode} />
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('builder.hero.activeTemplate')}</div>
                <div className="mt-2 text-2xl font-bold">{t(selectedTemplate.nameKey)}</div>
                <p className="mt-2 text-sm text-slate-300">{t(selectedTemplate.descriptionKey)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-slate-400">{t('builder.hero.targetAudience')}</div>
                  <div className="mt-1 font-semibold">{config.location}</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-slate-400">{t('builder.hero.reward')}</div>
                  <div className="mt-1 font-semibold">{config.reward}</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="space-y-5 shadow-arcade">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-dark">{t('builder.templates.title')}</h2>
                  <p className="text-sm text-slate-500">{t('builder.templates.subtitle')}</p>
                </div>
                <span className="rounded-full border-2 border-dark bg-card-yellow px-3 py-1 text-xs font-bold text-dark">{t('builder.templates.readyBadge')}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      selectedTemplate.id === template.id
                        ? `border-dark shadow-arcade-sm ${template.accent}`
                        : 'border-gray-200 bg-white hover:border-dark'
                    }`}
                  >
                    <div className={`h-2 w-16 rounded-full border border-dark ${selectedTemplate.id === template.id ? 'bg-dark' : template.accent}`} />
                    <div className="mt-4 text-lg font-bold text-dark">{t(template.nameKey)}</div>
                    <p className="mt-2 text-sm text-slate-500">{t(template.descriptionKey)}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-dark">
                      <span className="rounded-full border-2 border-dark bg-white px-2 py-1">{template.duration}</span>
                      <span className="rounded-full border-2 border-dark bg-white px-2 py-1">{t(template.rewardKey)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="space-y-5 shadow-arcade">
              <div>
                <h2 className="text-2xl font-extrabold text-dark">{t('builder.config.title')}</h2>
                <p className="text-sm text-slate-500">{t('builder.config.subtitle')}</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('builder.config.identitySection')}</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={t('builder.config.huntName')}
                      value={config.name}
                      onChange={(event) => setConfig({ ...config, name: event.target.value })}
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t('builder.config.language')}</label>
                      <select
                        value={config.language}
                        onChange={(event) => setConfig({ ...config, language: event.target.value as StudioConfig['language'] })}
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                      >
                        <option value="FR">Français</option>
                        <option value="EN">English</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label={t('builder.config.objective')}
                        value={config.objective}
                        onChange={(event) => setConfig({ ...config, objective: event.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('builder.config.logisticsSection')}</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={t('builder.config.duration')}
                      value={config.duration}
                      onChange={(event) => setConfig({ ...config, duration: event.target.value })}
                    />
                    <Input
                      label={t('builder.config.area')}
                      value={config.location}
                      onChange={(event) => setConfig({ ...config, location: event.target.value })}
                    />
                    <Input
                      label={t('builder.config.finalReward')}
                      value={config.reward}
                      onChange={(event) => setConfig({ ...config, reward: event.target.value })}
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t('builder.config.difficulty')}</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {difficultyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={config.difficulty === option.value}
                            onClick={() => setConfig({ ...config, difficulty: option.value })}
                            className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
                              config.difficulty === option.value
                                ? `${option.chip} border-dark text-dark shadow-arcade-sm`
                                : 'border-gray-300 bg-white text-gray-600 hover:border-dark'
                            }`}
                          >
                            {t(option.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 shadow-arcade">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-dark">{t('builder.map.title')}</h2>
                  <p className="text-sm text-slate-500">{t('builder.map.subtitle')}</p>
                </div>
                <div className="flex rounded-xl border-2 border-dark bg-white p-1 text-sm font-bold shadow-arcade-sm">
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('start')}
                    className={`rounded-lg px-3 py-1.5 transition ${placementTarget === 'start' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-cream'}`}
                  >
                    {t('builder.map.start')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('step')}
                    className={`rounded-lg px-3 py-1.5 transition ${placementTarget === 'step' ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-cream'}`}
                  >
                    {t('builder.map.stepNumber', { number: selectedStepIndex + 1 })}
                  </button>
                </div>
              </div>
              <div style={{ height: '350px' }}>
                <InteractiveMap
                  center={
                    (placementTarget === 'step'
                      ? [currentStep.location.latitude, currentStep.location.longitude]
                      : [config.locationCoords.latitude, config.locationCoords.longitude]) as [number, number]
                  }
                  zoom={14}
                  markers={[
                    {
                      id: 'chase-location',
                      position: [config.locationCoords.latitude, config.locationCoords.longitude] as [number, number],
                      type: 'chase' as const,
                      label: t('builder.map.startMarker', { name: config.name }),
                      description: config.objective,
                    },
                    ...steps.map((step, index) => ({
                      id: `step-${step.id}`,
                      position: [step.location.latitude, step.location.longitude] as [number, number],
                      type: 'step' as const,
                      label: `${index === selectedStepIndex ? '★ ' : ''}${t('builder.map.stepMarker', { number: index + 1, title: step.title })}`,
                      description: step.description,
                    })),
                  ]}
                  editable={true}
                  onMarkerClick={(markerId) => {
                    if (markerId === 'chase-location') {
                      setPlacementTarget('start');
                      return;
                    }
                    const idx = steps.findIndex((step) => `step-${step.id}` === markerId);
                    if (idx >= 0) {
                      setSelectedStepIndex(idx);
                      setPlacementTarget('step');
                    }
                  }}
                  onMapClick={(lat, lng) => {
                    if (placementTarget === 'step') {
                      updateStep('location', { latitude: lat, longitude: lng });
                      addNotification({ type: 'success', message: t('builder.notifications.stepLocationUpdated', { number: selectedStepIndex + 1 }) });
                    } else {
                      setConfig((current) => ({ ...current, locationCoords: { latitude: lat, longitude: lng } }));
                      addNotification({ type: 'success', message: t('builder.notifications.startPointUpdated') });
                    }
                  }}
                  className="h-full"
                />
              </div>
              <div className="space-y-3 rounded-2xl border-2 border-dark bg-cream p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-dark">
                  {t('builder.map.manualEntry')} — {placementTarget === 'step' ? t('builder.map.stepNumber', { number: selectedStepIndex + 1 }) : t('builder.map.startPoint')}
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={addressQuery}
                    onChange={(event) => setAddressQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        geocodeAddress();
                      }
                    }}
                    placeholder={t('builder.map.searchPlaceholder')}
                    className="min-w-[12rem] flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={geocodeAddress}>
                    {t('builder.map.locate')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">{t('builder.map.latitude')}</label>
                    <input
                      type="number"
                      step="any"
                      value={activeCoords.latitude}
                      onChange={(event) => {
                        const value = parseFloat(event.target.value);
                        if (!Number.isNaN(value)) {
                          setActiveCoords(value, activeCoords.longitude);
                        }
                      }}
                      className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">{t('builder.map.longitude')}</label>
                    <input
                      type="number"
                      step="any"
                      value={activeCoords.longitude}
                      onChange={(event) => {
                        const value = parseFloat(event.target.value);
                        if (!Number.isNaN(value)) {
                          setActiveCoords(activeCoords.latitude, value);
                        }
                      }}
                      className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 shadow-arcade">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-dark">{t('builder.steps.title')}</h2>
                  <p className="text-sm text-slate-500">{t('builder.steps.subtitle')}</p>
                </div>
                <Button variant="secondary" onClick={addStep}>{t('builder.steps.add')}</Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (dragIndex !== null) {
                          reorderSteps(dragIndex, index);
                        }
                        setDragIndex(null);
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      className={`group flex gap-2 rounded-2xl border-2 p-3 transition ${
                        selectedStepIndex === index
                          ? 'border-dark bg-card-blue shadow-arcade-sm'
                          : 'border-gray-200 bg-white hover:border-dark'
                      } ${dragIndex === index ? 'opacity-40' : ''}`}
                    >
                      <div className="flex cursor-grab flex-col items-center pt-1" title={t('builder.steps.dragToReorder')}>
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-dark text-xs font-bold ${
                            selectedStepIndex === index ? 'bg-dark text-warning' : 'bg-white text-dark'
                          }`}
                        >
                          {index + 1}
                        </span>
                        {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                      </div>

                      <button onClick={() => setSelectedStepIndex(index)} className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 font-bold text-dark">
                          <ChallengeIcon type={step.challenge} className="h-4 w-4 shrink-0 text-secondary" />
                          <span className="truncate">{step.title}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-500">{step.reward}</div>
                      </button>

                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => reorderSteps(index, index - 1)}
                          disabled={index === 0}
                          title={t('builder.steps.moveUp')}
                          aria-label={t('builder.steps.moveUpAria')}
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderSteps(index, index + 1)}
                          disabled={index === steps.length - 1}
                          title={t('builder.steps.moveDown')}
                          aria-label={t('builder.steps.moveDownAria')}
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStep(index)}
                          title={t('builder.steps.deleteTitle')}
                          aria-label={t('builder.steps.deleteAria', { number: index + 1 })}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={t('builder.steps.titleLabel')}
                      value={currentStep.title}
                      onChange={(event) => updateStep('title', event.target.value)}
                    />
                    <Input
                      label={t('builder.steps.rewardLabel')}
                      value={currentStep.reward}
                      onChange={(event) => updateStep('reward', event.target.value)}
                    />
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t('builder.steps.descriptionLabel')}</label>
                      <textarea
                        value={currentStep.description}
                        onChange={(event) => updateStep('description', event.target.value)}
                        rows={2}
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t('builder.steps.clueLabel')}</label>
                      <textarea
                        value={currentStep.clue}
                        onChange={(event) => updateStep('clue', event.target.value)}
                        rows={4}
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t('builder.steps.challengeType')}</label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {CHALLENGE_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={currentStep.challenge === option}
                            onClick={() => updateStep('challenge', option)}
                            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition ${
                              currentStep.challenge === option
                                ? 'border-dark bg-card-orange text-dark shadow-arcade-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-dark'
                            }`}
                          >
                            <ChallengeIcon type={option} className="h-4 w-4 shrink-0" />
                            <span className="truncate">{challengeLabel(option)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dark bg-cream p-4">
                    <div className="text-sm font-medium text-gray-600">
                      <span className="font-bold text-dark">{t('builder.steps.stepLocation')} </span>
                      {currentStep.location.latitude.toFixed(4)}, {currentStep.location.longitude.toFixed(4)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPlacementTarget('step');
                        addNotification({ type: 'info', message: t('builder.notifications.clickToPlace') });
                      }}
                    >
                      {t('builder.steps.placeOnMap')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-arcade lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-dark">{t('builder.preview.title')}</h2>
                  <p className="text-sm text-slate-500">{t('builder.preview.subtitle')}</p>
                </div>
                <span className="rounded-full border-2 border-dark bg-card-blue px-3 py-1 text-xs font-bold text-dark">{t('builder.preview.mobileFirst')}</span>
              </div>
              <div className="mt-5 rounded-[2rem] bg-dark p-4 text-white shadow-arcade">
                <div className="mx-auto max-w-sm rounded-[1.8rem] bg-dark p-4 ring-1 ring-white/10">
                  <motion.div
                    key={`${selectedStepIndex}-${currentStep.title}-${currentStep.clue}`}
                    initial={{ opacity: 0.35, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-[1.5rem] border-2 border-dark ${selectedTemplate.accent} p-5 text-dark`}
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.35em] text-gray-600">{t('builder.map.stepNumber', { number: selectedStepIndex + 1 })}</div>
                    <h3 className="mt-2 text-2xl font-black text-dark">{currentStep.title}</h3>
                    <p className="mt-2 text-sm font-medium text-gray-600">{currentStep.clue}</p>
                    <div className="mt-4 rounded-2xl border-2 border-dark bg-white p-3 text-sm">
                      <div className="flex items-center gap-1.5 font-bold text-dark">
                        <ChallengeIcon type={currentStep.challenge} className="h-4 w-4" />
                        {t('builder.preview.challenge')}
                      </div>
                      <div className="font-medium text-gray-600">{challengeLabel(currentStep.challenge)}</div>
                    </div>
                  </motion.div>
                  <div className="mt-4 space-y-3 rounded-[1.4rem] border-2 border-dark bg-white p-4 text-dark">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">{t('builder.preview.reward')}</span>
                      <span className="rounded-full border-2 border-dark bg-card-green px-2 py-1 text-xs font-bold text-dark">{currentStep.reward}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 w-[72%] rounded-full bg-primary" />
                    </div>
                    <div className="text-sm font-medium text-gray-600">{t('builder.preview.simulatedProgress')}</div>
                    <Button className="w-full">{t('builder.preview.validateStep')}</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 shadow-arcade">
              <div>
                <h2 className="text-2xl font-extrabold text-dark">{t('builder.analytics.title')}</h2>
                <p className="text-sm text-slate-500">{t('builder.analytics.subtitle')}</p>
              </div>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const participation = participationSeries[index] ?? 40;

                  return (
                    <div key={step.id} className="space-y-2 rounded-2xl border-2 border-dark bg-cream p-3">
                      <div className="flex items-center justify-between text-sm font-bold text-dark">
                        <span>{step.title}</span>
                        <span>{participation}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${participation}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {publicationCheckKeys.map((checkKey) => (
                  <div key={checkKey} className="flex items-center gap-2 rounded-2xl border-2 border-dark bg-card-green px-3 py-3 text-sm font-bold text-dark">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-dark text-xs text-warning">✓</span>
                    {t(checkKey)}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4 shadow-arcade">
              <div>
                <h2 className="text-2xl font-extrabold text-dark">{t('builder.publish.title')}</h2>
                <p className="text-sm text-slate-500">{t('builder.publish.subtitle')}</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><StatusBadge status="draft" /> {t('builder.publish.draftDesc')}</li>
                <li className="flex items-center gap-2"><StatusBadge status="test" /> {t('builder.publish.testDesc')}</li>
                <li className="flex items-center gap-2"><StatusBadge status="live" /> {t('builder.publish.liveDesc')}</li>
              </ul>
              <div className="rounded-2xl border-2 border-dark bg-dark p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{t('builder.publish.currentStatus')}</span>
                  <StatusBadge status={config.launchMode} />
                </div>
                <p className="mt-2 text-white">
                  {t('builder.publish.summary', { name: config.name })}
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Barre d'action fixe : statut + mode + action primaire unique */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t-[3px] border-dark">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={config.launchMode} />
            <span className="text-sm font-medium text-gray-600">
              {isSaving ? t('builder.actions.saving') : lastSaved ? t('builder.actions.savedAt', { time: lastSaved }) : t('builder.actions.notSaved')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border-2 border-dark bg-white p-1">
              {launchModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setConfig((current) => ({ ...current, launchMode: mode.id }))}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                    config.launchMode === mode.id ? 'bg-dark text-warning' : 'text-gray-600 hover:bg-cream'
                  }`}
                >
                  {t(mode.labelKey)}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => router.push('/partner-studio')}>
              {t('builder.actions.myHunts')}
            </Button>
            <Button onClick={saveChase} isLoading={isSaving}>
              {config.launchMode === 'live' ? t('builder.actions.publish') : t('builder.actions.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
