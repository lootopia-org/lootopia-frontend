'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/lib/notification-store';

type TemplateId = 'retail' | 'event' | 'team';

interface StepDraft {
  id: string;
  title: string;
  clue: string;
  reward: string;
  challenge: string;
}

interface StudioConfig {
  name: string;
  objective: string;
  duration: string;
  location: string;
  language: 'FR' | 'EN';
  reward: string;
  launchMode: 'draft' | 'test' | 'live';
}

const templates: Array<{
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
  objective: string;
  duration: string;
  location: string;
  reward: string;
  steps: StepDraft[];
}> = [
  {
    id: 'retail',
    name: 'Chasse boutique',
    description: 'Idéal pour attirer du trafic en magasin et faire découvrir une gamme.',
    accent: 'from-primary to-accent',
    objective: 'Booster le trafic magasin et la découverte produit',
    duration: '35 min',
    location: 'Point de vente / centre commercial',
    reward: 'Bon d’achat 20€',
    steps: [
      {
        id: 'retail-1',
        title: 'Accueil en vitrine',
        clue: 'Repérez le totem d’entrée et scannez le QR code.',
        reward: '50 pts',
        challenge: 'QR + validation lieu',
      },
      {
        id: 'retail-2',
        title: 'Produit mystère',
        clue: 'Trouvez l’étagère qui porte la couleur du thème.',
        reward: '75 pts',
        challenge: 'Indice visuel',
      },
      {
        id: 'retail-3',
        title: 'Caisse finale',
        clue: 'Entrez le mot révélé par les deux étapes précédentes.',
        reward: 'Récompense finale',
        challenge: 'Énigme finale',
      },
    ],
  },
  {
    id: 'event',
    name: 'Parcours événementiel',
    description: 'Parfait pour un salon, un lancement produit ou un pop-up.',
    accent: 'from-secondary to-sky-500',
    objective: 'Créer un parcours d’engagement rapide et mémorable',
    duration: '20 min',
    location: 'Salon / conférence / événement',
    reward: 'Goodies premium',
    steps: [
      {
        id: 'event-1',
        title: 'Entrée du salon',
        clue: 'Retrouvez le logo géant sur le stand principal.',
        reward: '40 pts',
        challenge: 'Scan rapide',
      },
      {
        id: 'event-2',
        title: 'Mini quiz',
        clue: 'Répondez à la question affichée sur l’écran d’accueil.',
        reward: '60 pts',
        challenge: 'QCM',
      },
      {
        id: 'event-3',
        title: 'Photo finale',
        clue: 'Capturez l’espace photo pour débloquer la récompense.',
        reward: 'Badge événement',
        challenge: 'Validation média',
      },
    ],
  },
  {
    id: 'team',
    name: 'Team building',
    description: 'Une expérience collaborative pour animer une équipe ou un réseau.',
    accent: 'from-slate-700 to-secondary',
    objective: 'Renforcer la cohésion et la participation collective',
    duration: '55 min',
    location: 'Entreprise / site partenaire',
    reward: 'Badge collectif',
    steps: [
      {
        id: 'team-1',
        title: 'Mission d’équipe',
        clue: 'Chaque groupe récupère une moitié de l’indice.',
        reward: '50 pts',
        challenge: 'Collaboration',
      },
      {
        id: 'team-2',
        title: 'Décodage',
        clue: 'Assemblez les réponses pour former le code final.',
        reward: '80 pts',
        challenge: 'Énigme logique',
      },
      {
        id: 'team-3',
        title: 'Final collectif',
        clue: 'Validez la zone finale tous ensemble pour gagner.',
        reward: 'Récompense collective',
        challenge: 'Validation groupe',
      },
    ],
  },
];

const participationSeries = [92, 85, 74, 61, 48];

const analyticsTiles = [
  { label: 'Démarrages', value: '1 284', detail: '+18% cette semaine' },
  { label: 'Complétion', value: '71%', detail: 'Temps moyen: 41 min' },
  { label: 'Abandon', value: '12%', detail: 'Principalement à l’étape 3' },
  { label: 'Usage mobile', value: '94%', detail: 'Vue joueur optimisée' },
];

const publicationChecks = [
  'Charte de marque verrouillée',
  'Contenus validés',
  'RGPD / consentement activé',
  'Journal d’audit actif',
];

const cloneSteps = (template: (typeof templates)[number]): StepDraft[] =>
  template.steps.map((step, index) => ({
    ...step,
    id: `${template.id}-${index + 1}`,
  }));

export default function PartnerStudioPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('retail');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [config, setConfig] = useState<StudioConfig>({
    name: 'Chasse boutique printemps',
    objective: templates[0].objective,
    duration: templates[0].duration,
    location: templates[0].location,
    language: 'FR',
    reward: templates[0].reward,
    launchMode: 'draft',
  });
  const [steps, setSteps] = useState<StepDraft[]>(cloneSteps(templates[0]));

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
      objective: selectedTemplate.objective,
      duration: selectedTemplate.duration,
      location: selectedTemplate.location,
      reward: selectedTemplate.reward,
    }));
    setSelectedStepIndex(0);
  }, [selectedTemplate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)] px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Card className="w-full space-y-4 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Partner Studio</div>
            <h1 className="text-3xl font-bold text-dark">Chargement de l’espace partenaire</h1>
            <p className="text-gray-600">Vérification de l’accès et préparation du tableau de bord.</p>
          </Card>
        </div>
      </div>
    );
  }

  const currentStep = steps[selectedStepIndex] ?? steps[0];

  const updateStep = (field: keyof StepDraft, value: string) => {
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
          title: 'Nouvelle étape',
          clue: 'Ajoutez un indice clair et simple.',
          reward: '50 pts',
          challenge: 'Énigme libre',
        },
      ];

      setSelectedStepIndex(nextSteps.length - 1);
      return nextSteps;
    });

    addNotification({ type: 'info', message: 'Nouvelle étape ajoutée au parcours.' });
  };

  const applyTemplate = (templateId: TemplateId) => {
    const nextTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
    setSelectedTemplateId(templateId);
    addNotification({ type: 'success', message: `Le modèle ${nextTemplate.name} a été chargé.` });
  };

  const publishLabel =
    {
      draft: 'Brouillon',
      test: 'Test interne',
      live: 'Publication en ligne',
    }[config.launchMode] ?? 'Brouillon';

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)]">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient opacity-90" />
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 rounded-[2rem] bg-white/80 p-6 shadow-xl ring-1 ring-white/60 backdrop-blur md:grid-cols-[1.3fr_0.7fr] md:p-8"
        >
          <div className="space-y-5">
            <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Studio partenaire autonome
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-dark md:text-6xl">
                Concevez, paramétrez et pilotez vos chasses en autonomie.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600 md:text-xl">
                Un atelier guidé pour créer rapidement des parcours ludiques cohérents avec la marque, tout en gardant un suivi analytique clair et temps réel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => applyTemplate('retail')}>Démarrer avec un modèle</Button>
              <Button variant="secondary" onClick={() => setConfig((current) => ({ ...current, launchMode: 'test' }))}>
                Lancer un test
              </Button>
              <Button variant="outline" onClick={() => router.push('/chases')}>
                Voir la vue joueur
              </Button>
            </div>
          </div>

          <Card className="bg-slate-950 text-white shadow-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Statut</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">{publishLabel}</span>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">Template actif</div>
                <div className="mt-2 text-2xl font-bold">{selectedTemplate.name}</div>
                <p className="mt-2 text-sm text-slate-300">{selectedTemplate.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-slate-400">Public cible</div>
                  <div className="mt-1 font-semibold">{config.location}</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <div className="text-slate-400">Récompense</div>
                  <div className="mt-1 font-semibold">{config.reward}</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analyticsTiles.map((tile) => (
            <Card key={tile.label} className="border border-white/70 bg-white/90">
              <div className="text-sm font-medium text-slate-500">{tile.label}</div>
              <div className="mt-2 text-3xl font-black text-dark">{tile.value}</div>
              <div className="mt-1 text-sm text-slate-500">{tile.detail}</div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="space-y-5 border border-white/70 bg-white/90">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Choisir un modèle</h2>
                  <p className="text-sm text-slate-500">Une base rapide à personnaliser selon le contexte partenaire.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">3 modèles prêts à l’emploi</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedTemplate.id === template.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${template.accent}`} />
                    <div className="mt-4 text-lg font-bold text-dark">{template.name}</div>
                    <p className="mt-2 text-sm text-slate-500">{template.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{template.duration}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">{template.reward}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="space-y-5 border border-white/70 bg-white/90">
              <div>
                <h2 className="text-2xl font-bold text-dark">Paramétrage rapide</h2>
                <p className="text-sm text-slate-500">Gardez uniquement les réglages utiles: le reste reste cohérent avec la marque.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nom de la chasse"
                  value={config.name}
                  onChange={(event) => setConfig({ ...config, name: event.target.value })}
                />
                <Input
                  label="Durée estimée"
                  value={config.duration}
                  onChange={(event) => setConfig({ ...config, duration: event.target.value })}
                />
                <Input
                  label="Objectif"
                  value={config.objective}
                  onChange={(event) => setConfig({ ...config, objective: event.target.value })}
                />
                <Input
                  label="Zone / lieu"
                  value={config.location}
                  onChange={(event) => setConfig({ ...config, location: event.target.value })}
                />
                <Input
                  label="Récompense finale"
                  value={config.reward}
                  onChange={(event) => setConfig({ ...config, reward: event.target.value })}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Langue</label>
                  <select
                    value={config.language}
                    onChange={(event) => setConfig({ ...config, language: event.target.value as StudioConfig['language'] })}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  >
                    <option value="FR">Français</option>
                    <option value="EN">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Publication</label>
                  <select
                    value={config.launchMode}
                    onChange={(event) => setConfig({ ...config, launchMode: event.target.value as StudioConfig['launchMode'] })}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="test">Test interne</option>
                    <option value="live">Publication immédiate</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 border border-white/70 bg-white/90">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Étapes et énigmes</h2>
                  <p className="text-sm text-slate-500">Sélectionnez une étape et ajustez directement son contenu.</p>
                </div>
                <Button variant="secondary" onClick={addStep}>Ajouter une étape</Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.32fr_0.68fr]">
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setSelectedStepIndex(index)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selectedStepIndex === index
                          ? 'border-secondary bg-secondary/5'
                          : 'border-slate-200 bg-white hover:border-secondary/30'
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Étape {index + 1}</div>
                      <div className="mt-1 font-bold text-dark">{step.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{step.reward}</div>
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Titre"
                    value={currentStep.title}
                    onChange={(event) => updateStep('title', event.target.value)}
                  />
                  <Input
                    label="Récompense"
                    value={currentStep.reward}
                    onChange={(event) => updateStep('reward', event.target.value)}
                  />
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Énigme / indice</label>
                    <textarea
                      value={currentStep.clue}
                      onChange={(event) => updateStep('clue', event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Type de défi</label>
                    <select
                      value={currentStep.challenge}
                      onChange={(event) => updateStep('challenge', event.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    >
                      <option>QR + validation lieu</option>
                      <option>Indice visuel</option>
                      <option>Énigme finale</option>
                      <option>QCM</option>
                      <option>Validation média</option>
                      <option>Collaboration</option>
                      <option>Énigme libre</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-white/70 bg-white/90">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Aperçu joueur</h2>
                  <p className="text-sm text-slate-500">La vue finale reste simple, guidée et compatible mobile.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Mobile first</span>
              </div>
              <div className="mt-5 rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl">
                <div className="mx-auto max-w-sm rounded-[1.8rem] bg-slate-900 p-4 ring-1 ring-white/10">
                  <div className={`rounded-[1.5rem] bg-gradient-to-br ${selectedTemplate.accent} p-5`}>
                    <div className="text-xs uppercase tracking-[0.35em] text-white/75">Étape {selectedStepIndex + 1}</div>
                    <h3 className="mt-2 text-2xl font-bold">{currentStep.title}</h3>
                    <p className="mt-2 text-sm text-white/80">{currentStep.clue}</p>
                    <div className="mt-4 rounded-2xl bg-white/15 p-3 text-sm">
                      <div className="font-semibold">Défi</div>
                      <div className="text-white/85">{currentStep.challenge}</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 rounded-[1.4rem] bg-white p-4 text-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Récompense</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{currentStep.reward}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-primary to-accent" />
                    </div>
                    <div className="text-sm text-slate-500">Progression simulée: 72%</div>
                    <Button className="w-full">Valider l’étape</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 border border-white/70 bg-white/90">
              <div>
                <h2 className="text-2xl font-bold text-dark">Suivi analytique</h2>
                <p className="text-sm text-slate-500">Surveillez la participation, les points de friction et les abandons.</p>
              </div>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const participation = participationSeries[index] ?? 40;

                  return (
                    <div key={step.id} className="space-y-2 rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                        <span>{step.title}</span>
                        <span>{participation}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${participation}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {publicationChecks.map((check) => (
                  <div key={check} className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
                    {check}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4 border border-white/70 bg-white/90">
              <div>
                <h2 className="text-2xl font-bold text-dark">Publication et pilotage</h2>
                <p className="text-sm text-slate-500">Brouillon, test ou mise en ligne avec historique et cohérence de marque.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setConfig((current) => ({ ...current, launchMode: 'draft' }))}>
                  Enregistrer le brouillon
                </Button>
                <Button variant="secondary" onClick={() => setConfig((current) => ({ ...current, launchMode: 'test' }))}>
                  Préparer un test
                </Button>
                <Button onClick={() => setConfig((current) => ({ ...current, launchMode: 'live' }))}>
                  Publier maintenant
                </Button>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Dernière action</span>
                  <span>{publishLabel}</span>
                </div>
                <p className="mt-2 text-white">
                  La chasse {config.name} peut être lancée dans son périmètre défini sans sortir du cadre graphique Lootopia.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}