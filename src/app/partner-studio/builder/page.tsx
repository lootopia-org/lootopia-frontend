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
  name: string;
  description: string;
  accent: string;
  objective: string;
  duration: string;
  location: string;
  locationCoords: { latitude: number; longitude: number };
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image: string;
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
    locationCoords: { latitude: 37.808, longitude: -122.417 },
    reward: 'Bon d’achat 20€',
    difficulty: 'easy',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        id: 'retail-1',
        title: 'Accueil en vitrine',
        description: 'Trouvez le marqueur près de l’entrée.',
        clue: 'Repérez le totem d’entrée et scannez le QR code.',
        reward: '50 pts',
        challenge: 'QR + validation lieu',
        location: { latitude: 37.808, longitude: -122.417 },
      },
      {
        id: 'retail-2',
        title: 'Produit mystère',
        description: 'Découvrez le produit caché.',
        clue: 'Trouvez l’étagère qui porte la couleur du thème.',
        reward: '75 pts',
        challenge: 'Indice visuel',
        location: { latitude: 37.803, longitude: -122.414 },
      },
      {
        id: 'retail-3',
        title: 'Caisse finale',
        description: 'Récupérez votre récompense.',
        clue: 'Entrez le mot révélé par les deux étapes précédentes.',
        reward: 'Récompense finale',
        challenge: 'Énigme finale',
        location: { latitude: 37.797, longitude: -122.409 },
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
    locationCoords: { latitude: 37.808, longitude: -122.417 },
    reward: 'Goodies premium',
    difficulty: 'medium',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        id: 'event-1',
        title: 'Entrée du salon',
        description: 'Commencez votre aventure.',
        clue: 'Retrouvez le logo géant sur le stand principal.',
        reward: '40 pts',
        challenge: 'Scan rapide',
        location: { latitude: 37.808, longitude: -122.417 },
      },
      {
        id: 'event-2',
        title: 'Mini quiz',
        description: 'Testez vos connaissances.',
        clue: 'Répondez à la question affichée sur l’écran d’accueil.',
        reward: '60 pts',
        challenge: 'QCM',
        location: { latitude: 37.803, longitude: -122.414 },
      },
      {
        id: 'event-3',
        title: 'Photo finale',
        description: 'Capturez le moment.',
        clue: 'Capturez l’espace photo pour débloquer la récompense.',
        reward: 'Badge événement',
        challenge: 'Validation média',
        location: { latitude: 37.797, longitude: -122.409 },
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
    locationCoords: { latitude: 37.808, longitude: -122.417 },
    reward: 'Badge collectif',
    difficulty: 'hard',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        id: 'team-1',
        title: 'Mission d’équipe',
        description: 'Travaillez ensemble.',
        clue: 'Chaque groupe récupère une moitié de l’indice.',
        reward: '50 pts',
        challenge: 'Collaboration',
        location: { latitude: 37.808, longitude: -122.417 },
      },
      {
        id: 'team-2',
        title: 'Décodage',
        description: 'Résolvez l’énigme.',
        clue: 'Assemblez les réponses pour former le code final.',
        reward: '80 pts',
        challenge: 'Énigme logique',
        location: { latitude: 37.803, longitude: -122.414 },
      },
      {
        id: 'team-3',
        title: 'Final collectif',
        description: 'Finissez ensemble.',
        clue: 'Validez la zone finale tous ensemble pour gagner.',
        reward: 'Récompense collective',
        challenge: 'Validation groupe',
        location: { latitude: 37.797, longitude: -122.409 },
      },
    ],
  },
  {
    id: 'museum',
    name: 'Musée mystérieux',
    description: 'Une aventure dans un musée avec des énigmes et des trésors cachés.',
    accent: 'from-yellow-600 to-orange-500',
    objective: 'Découvrir les œuvres et résoudre des mystères',
    duration: '90 min',
    location: 'Musée ou galerie d’art',
    locationCoords: { latitude: 37.7858, longitude: -122.401 },
    reward: 'Exposition privée',
    difficulty: 'hard',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        id: 'museum-1',
        title: 'Accueil du musée',
        description: 'Récupérez votre carte et votre guide.',
        clue: 'Cherchez le totem à l’entrée et scannez-le.',
        reward: '60 pts',
        challenge: 'QR + validation lieu',
        location: { latitude: 37.7858, longitude: -122.401 },
      },
      {
        id: 'museum-2',
        title: 'Salle des antiques',
        description: 'Explorez la salle des antiquités.',
        clue: 'Trouvez le vase grec avec l’inscription mystérieuse.',
        reward: '80 pts',
        challenge: 'Indice visuel',
        location: { latitude: 37.788, longitude: -122.403 },
      },
      {
        id: 'museum-3',
        title: 'Salle des tableaux',
        description: 'Admirez les tableaux et résolvez l’énigme.',
        clue: 'Le tableau avec le paysage italien contient le code secret.',
        reward: '100 pts',
        challenge: 'Énigme finale',
        location: { latitude: 37.79, longitude: -122.405 },
      },
    ],
  },
];

const participationSeries = [92, 85, 74, 61, 48];

const publicationChecks = [
  'Charte de marque verrouillée',
  'Contenus validés',
  'RGPD / consentement activé',
  'Journal d’audit actif',
];

const difficultyOptions: Array<{ value: StudioConfig['difficulty']; label: string; chip: string }> = [
  { value: 'easy', label: 'Facile', chip: 'bg-green-100 text-green-800 ring-green-600/20' },
  { value: 'medium', label: 'Moyenne', chip: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20' },
  { value: 'hard', label: 'Difficile', chip: 'bg-red-100 text-red-800 ring-red-600/20' },
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

const cloneSteps = (template: (typeof templates)[number]): StepDraft[] =>
  template.steps.map((step, index) => ({
    ...step,
    id: `${template.id}-${index + 1}`,
  }));

export default function PartnerStudioBuilderPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('retail');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [placementTarget, setPlacementTarget] = useState<'start' | 'step'>('start');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [config, setConfig] = useState<StudioConfig>({
    name: 'Chasse boutique printemps',
    objective: templates[0].objective,
    duration: templates[0].duration,
    location: templates[0].location,
    locationCoords: templates[0].locationCoords,
    language: 'FR',
    reward: templates[0].reward,
    launchMode: 'draft',
    difficulty: templates[0].difficulty,
    image: templates[0].image,
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
      locationCoords: selectedTemplate.locationCoords,
      reward: selectedTemplate.reward,
      difficulty: selectedTemplate.difficulty,
      image: selectedTemplate.image,
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
          title: 'Nouvelle étape',
          description: 'Ajoutez une description.',
          clue: 'Ajoutez un indice clair et simple.',
          reward: '50 pts',
          challenge: 'Énigme libre',
          location: { latitude: 37.808, longitude: -122.417 },
        },
      ];

      setSelectedStepIndex(nextSteps.length - 1);
      return nextSteps;
    });

    addNotification({ type: 'info', message: 'Nouvelle étape ajoutée au parcours.' });
  };

  const deleteStep = (indexToDelete: number) => {
    if (steps.length <= 1) {
      addNotification({ type: 'error', message: 'Vous devez conserver au moins une étape.' });
      return;
    }

    setSteps((currentSteps) => currentSteps.filter((_, index) => index !== indexToDelete));
    
    // Adjust selected index
    if (selectedStepIndex >= indexToDelete && selectedStepIndex > 0) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }

    addNotification({ type: 'info', message: 'Étape supprimée.' });
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
        addNotification({ type: 'error', message: 'Adresse introuvable.' });
        return;
      }

      setActiveCoords(parseFloat(results[0].lat), parseFloat(results[0].lon));
      addNotification({ type: 'success', message: 'Adresse localisée sur la carte.' });
    } catch {
      addNotification({ type: 'error', message: 'Géocodage indisponible pour le moment.' });
    }
  };

  const applyTemplate = (templateId: TemplateId) => {
    const nextTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
    setSelectedTemplateId(templateId);
    addNotification({ type: 'success', message: `Le modèle ${nextTemplate.name} a été chargé.` });
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
      addNotification({ type: 'success', message: 'Chasse enregistrée avec succès !' });
    } catch (error) {
      console.error('Error saving chase:', error);
      addNotification({ type: 'error', message: 'Erreur lors de l’enregistrement de la chasse.' });
    } finally {
      setIsSaving(false);
    }
  };

  const launchModes: Array<{ id: StudioConfig['launchMode']; label: string }> = [
    { id: 'draft', label: 'Brouillon' },
    { id: 'test', label: 'Test' },
    { id: 'live', label: 'En ligne' },
  ];

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)]">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient opacity-90" />
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 pt-8 pb-28 md:pt-12">
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
              <Button variant="outline" onClick={() => router.push('/chases')}>
                Voir la vue joueur
              </Button>
            </div>
          </div>

          <Card className="bg-slate-950 text-white shadow-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Statut</span>
                <StatusBadge status={config.launchMode} />
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

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="space-y-5 border border-white/70 bg-white/90">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Choisir un modèle</h2>
                  <p className="text-sm text-slate-500">Une base rapide à personnaliser selon le contexte partenaire.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">4 modèles prêts à l’emploi</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identité &amp; objectif</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Nom de la chasse"
                      value={config.name}
                      onChange={(event) => setConfig({ ...config, name: event.target.value })}
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
                    <div className="md:col-span-2">
                      <Input
                        label="Objectif"
                        value={config.objective}
                        onChange={(event) => setConfig({ ...config, objective: event.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logistique &amp; récompense</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Durée estimée (min)"
                      value={config.duration}
                      onChange={(event) => setConfig({ ...config, duration: event.target.value })}
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
                      <label className="block text-sm font-medium text-gray-700">Difficulté</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {difficultyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={config.difficulty === option.value}
                            onClick={() => setConfig({ ...config, difficulty: option.value })}
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset transition ${
                              config.difficulty === option.value
                                ? `${option.chip} ring-2`
                                : 'bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 border border-white/70 bg-white/90">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Carte de la chasse</h2>
                  <p className="text-sm text-slate-500">Cliquez un marqueur pour sélectionner une étape, ou la carte pour placer l’élément choisi.</p>
                </div>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('start')}
                    className={`rounded-md px-3 py-1.5 transition ${placementTarget === 'start' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
                  >
                    Départ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('step')}
                    className={`rounded-md px-3 py-1.5 transition ${placementTarget === 'step' ? 'bg-secondary text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
                  >
                    Étape {selectedStepIndex + 1}
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
                      label: `Départ — ${config.name}`,
                      description: config.objective,
                    },
                    ...steps.map((step, index) => ({
                      id: `step-${step.id}`,
                      position: [step.location.latitude, step.location.longitude] as [number, number],
                      type: 'step' as const,
                      label: `${index === selectedStepIndex ? '★ ' : ''}Étape ${index + 1}: ${step.title}`,
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
                      addNotification({ type: 'success', message: `Localisation de l’étape ${selectedStepIndex + 1} mise à jour !` });
                    } else {
                      setConfig((current) => ({ ...current, locationCoords: { latitude: lat, longitude: lng } }));
                      addNotification({ type: 'success', message: 'Point de départ mis à jour !' });
                    }
                  }}
                  className="h-full"
                />
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Saisie manuelle — {placementTarget === 'step' ? `Étape ${selectedStepIndex + 1}` : 'Point de départ'}
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
                    placeholder="Rechercher une adresse…"
                    className="min-w-[12rem] flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={geocodeAddress}>
                    Localiser
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Latitude</label>
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
                    <label className="block text-xs font-medium text-gray-600">Longitude</label>
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

            <Card className="space-y-5 border border-white/70 bg-white/90">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Étapes et énigmes</h2>
                  <p className="text-sm text-slate-500">Sélectionnez une étape et ajustez son contenu et sa localisation sur la carte.</p>
                </div>
                <Button variant="secondary" onClick={addStep}>Ajouter une étape</Button>
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
                      className={`group flex gap-2 rounded-2xl border p-3 transition ${
                        selectedStepIndex === index
                          ? 'border-secondary bg-secondary/5'
                          : 'border-slate-200 bg-white hover:border-secondary/30'
                      } ${dragIndex === index ? 'opacity-40' : ''}`}
                    >
                      <div className="flex cursor-grab flex-col items-center pt-1" title="Glisser pour réordonner">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            selectedStepIndex === index ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
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
                          title="Monter"
                          aria-label="Monter l’étape"
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderSteps(index, index + 1)}
                          disabled={index === steps.length - 1}
                          title="Descendre"
                          aria-label="Descendre l’étape"
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStep(index)}
                          title="Supprimer cette étape"
                          aria-label={`Supprimer l’étape ${index + 1}`}
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
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={currentStep.description}
                        onChange={(event) => updateStep('description', event.target.value)}
                        rows={2}
                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-primary focus:outline-none"
                      />
                    </div>
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
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {CHALLENGE_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={currentStep.challenge === option}
                            onClick={() => updateStep('challenge', option)}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                              currentStep.challenge === option
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 text-slate-600 hover:border-primary/40'
                            }`}
                          >
                            <ChallengeIcon type={option} className="h-4 w-4 shrink-0" />
                            <span className="truncate">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Localisation de l’étape : </span>
                      {currentStep.location.latitude.toFixed(4)}, {currentStep.location.longitude.toFixed(4)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPlacementTarget('step');
                        addNotification({ type: 'info', message: 'Cliquez sur la carte de la chasse pour positionner cette étape.' });
                      }}
                    >
                      Placer sur la carte
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-white/70 bg-white/90 lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Aperçu joueur</h2>
                  <p className="text-sm text-slate-500">La vue finale reste simple, guidée et compatible mobile.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Mobile first</span>
              </div>
              <div className="mt-5 rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl">
                <div className="mx-auto max-w-sm rounded-[1.8rem] bg-slate-900 p-4 ring-1 ring-white/10">
                  <motion.div
                    key={`${selectedStepIndex}-${currentStep.title}-${currentStep.clue}`}
                    initial={{ opacity: 0.35, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-[1.5rem] bg-gradient-to-br ${selectedTemplate.accent} p-5`}
                  >
                    <div className="text-xs uppercase tracking-[0.35em] text-white/75">Étape {selectedStepIndex + 1}</div>
                    <h3 className="mt-2 text-2xl font-bold">{currentStep.title}</h3>
                    <p className="mt-2 text-sm text-white/80">{currentStep.clue}</p>
                    <div className="mt-4 rounded-2xl bg-white/15 p-3 text-sm">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <ChallengeIcon type={currentStep.challenge} className="h-4 w-4" />
                        Défi
                      </div>
                      <div className="text-white/85">{currentStep.challenge}</div>
                    </div>
                  </motion.div>
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
                <p className="text-sm text-slate-500">Choisissez le mode dans la barre d’action en bas de l’écran, puis sauvegardez.</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><StatusBadge status="draft" /> Travail en cours, invisible des joueurs.</li>
                <li className="flex items-center gap-2"><StatusBadge status="test" /> Accessible à votre équipe pour validation.</li>
                <li className="flex items-center gap-2"><StatusBadge status="live" /> Publiée et jouable par tous.</li>
              </ul>
              <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Statut actuel</span>
                  <StatusBadge status={config.launchMode} />
                </div>
                <p className="mt-2 text-white">
                  La chasse {config.name} peut être lancée dans son périmètre défini sans sortir du cadre graphique Lootopia.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Barre d'action fixe : statut + mode + action primaire unique */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={config.launchMode} />
            <span className="text-sm text-slate-500">
              {isSaving ? 'Enregistrement…' : lastSaved ? `Enregistré à ${lastSaved}` : 'Non enregistré'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {launchModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setConfig((current) => ({ ...current, launchMode: mode.id }))}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    config.launchMode === mode.id ? 'bg-secondary text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => router.push('/partner-studio')}>
              Mes chasses
            </Button>
            <Button onClick={saveChase} isLoading={isSaving}>
              {config.launchMode === 'live' ? 'Publier' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}