import { Chase, ChaseStep, UserProgress, User } from '@/types';

const now = new Date();

const createDate = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const baseSteps = [
  {
    id: 'step-1',
    order: 1,
    title: 'Old Harbor Puzzle',
    description: 'Find the marker near the harbor entrance.',
    clue: 'Look for the bronze compass facing the water.',
    location: { latitude: 37.808, longitude: -122.417 },
    reward: 50,
    completed: false,
  },
  {
    id: 'step-2',
    order: 2,
    title: 'Market Square Cipher',
    description: 'Decode the mural in the center of the square.',
    clue: 'The answer is hidden where the colors meet.',
    location: { latitude: 37.803, longitude: -122.414 },
    arContent: {
      id: 'ar-1',
      type: 'model' as const,
      data: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      scale: 1,
    },
    reward: 75,
    completed: false,
  },
  {
    id: 'step-3',
    order: 3,
    title: 'Hidden Vault Finale',
    description: 'Unlock the vault with the final code.',
    clue: 'Combine the harbor and mural clues to reveal the code.',
    location: { latitude: 37.797, longitude: -122.409 },
    reward: 125,
    completed: false,
  },
] satisfies ChaseStep[];

const mockPartner: User & { id: string; logo: string; description: string; chases: Chase[] } = {
  id: 'partner-1',
  name: 'Golden Gate Adventures',
  username: 'goldengate',
  email: 'hello@goldengateadventures.local',
  description: 'Mock partner for demo treasure hunts.',
  logo: '',
  chases: [],
  role: 'partner',
  avatar: '',
  createdAt: createDate(30),
  updatedAt: createDate(2),
  points: 0,
  level: 1,
  badges: [],
  profile: {
    bio: '',
    completedChases: 0,
  },
};

const mockChases: Chase[] = [
  {
    id: 'mock-chase-golden-bay',
    title: 'Golden Bay Treasure Run',
    description: 'A beginner-friendly urban treasure hunt through San Francisco landmarks.',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    difficulty: 'easy',
    estimatedDuration: 45,
    location: { latitude: 37.8044, longitude: -122.2712 },
    createdAt: createDate(12),
    updatedAt: createDate(2),
    status: 'active',
    participants: 128,
    rating: 4.8,
    partner: mockPartner,
    steps: JSON.parse(JSON.stringify(baseSteps)),
  },
  {
    id: 'mock-chase-midnight-museum',
    title: 'Midnight Museum Mystery',
    description: 'A harder chase inside the city museum district with augmented reality clues.',
    image: 'https://images.unsplash.com/photo-1587815834030-620367845e63?auto=format&fit=crop&w=1200&q=80',
    difficulty: 'hard',
    estimatedDuration: 90,
    location: { latitude: 37.7858, longitude: -122.401 },
    createdAt: createDate(20),
    updatedAt: createDate(4),
    status: 'active',
    participants: 76,
    rating: 4.9,
    partner: { 
      id: 'partner-2', 
      name: 'Museum Quest Co.', 
      email: 'contact@museumquest.local',
      description: '',
      logo: '',
      chases: [],
    },
    steps: JSON.parse(JSON.stringify(baseSteps)).map((step: ChaseStep, index: number) => ({
      ...step,
      id: `museum-step-${index + 1}`,
      title: `${step.title} ${index + 1}`,
      completed: false,
    })),
  },
];

const mockProgressStore = new Map<string, UserProgress>();

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const findChaseIndex = (chaseId: string) => mockChases.findIndex((chase) => chase.id === chaseId);

const getMockChaseById = (chaseId: string) => {
  const index = findChaseIndex(chaseId);
  return index >= 0 ? mockChases[index] : null;
};

const updateProgressForChase = (chaseId: string, updater: (progress: UserProgress) => UserProgress) => {
  const current = mockProgressStore.get(chaseId);
  if (!current) {
    return null;
  }

  const next = updater(clone(current));
  mockProgressStore.set(chaseId, next);
  return next;
};

export const mockChaseData = {
  getChases: () => clone(mockChases),

  getChaseById: (chaseId: string) => {
    const chase = getMockChaseById(chaseId);
    return chase ? clone(chase) : null;
  },

  searchChases: (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    return clone(mockChases.filter((chase) => {
      const haystack = `${chase.title} ${chase.description} ${chase.partner.name}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    }));
  },

  getUserChases: (userId: string) => {
    if (userId === 'mock-admin') {
      return clone(mockChases);
    }

    return clone(mockChases.filter((chase) => chase.status === 'active'));
  },

  startChase: (chaseId: string, userId = 'mock-player') => {
    const chase = getMockChaseById(chaseId);
    if (!chase) {
      throw new Error('Chase not found');
    }

    const progress: UserProgress = {
      userId,
      chaseId,
      currentStep: 1,
      totalSteps: chase.steps.length,
      pointsEarned: 0,
      startedAt: new Date().toISOString(),
      stepProgress: chase.steps.map((step) => ({
        stepId: step.id,
        completed: false,
      })),
    };

    mockProgressStore.set(chaseId, progress);
    return clone(progress);
  },

  getProgress: (chaseId: string) => {
    const progress = mockProgressStore.get(chaseId);
    return progress ? clone(progress) : null;
  },

  completeStep: (chaseId: string, stepId: string) => {
    const chase = getMockChaseById(chaseId);
    if (!chase) {
      throw new Error('Chase not found');
    }

    const stepIndex = chase.steps.findIndex((step) => step.id === stepId);
    if (stepIndex < 0) {
      throw new Error('Step not found');
    }

    const completedStep = chase.steps[stepIndex];
    completedStep.completed = true;

    const gainedPoints = completedStep.reward ?? 10;

    const progress = updateProgressForChase(chaseId, (current) => {
      const stepProgress = current.stepProgress.map((stepProgressItem) =>
        stepProgressItem.stepId === stepId
          ? { ...stepProgressItem, completed: true, completedAt: new Date().toISOString(), arInteraction: completedStep.arContent ? true : stepProgressItem.arInteraction }
          : stepProgressItem
      );

      const completedCount = stepProgress.filter((stepProgressItem) => stepProgressItem.completed).length;

      return {
        ...current,
        currentStep: Math.min(completedCount + 1, current.totalSteps),
        pointsEarned: current.pointsEarned + gainedPoints,
        stepProgress,
        completedAt: completedCount === current.totalSteps ? new Date().toISOString() : current.completedAt,
      };
    });

    return {
      ...clone(completedStep),
      completed: true,
      ...(progress ? {} : {}),
    };
  },

  interactAR: (chaseId: string, stepId: string) => {
    const progress = updateProgressForChase(chaseId, (current) => ({
      ...current,
      stepProgress: current.stepProgress.map((stepProgressItem) =>
        stepProgressItem.stepId === stepId
          ? { ...stepProgressItem, arInteraction: true }
          : stepProgressItem
      ),
    }));

    return {
      success: true,
      progress: progress ? clone(progress) : null,
    };
  },

  completeChase: (chaseId: string) => {
    const progress = updateProgressForChase(chaseId, (current) => ({
      ...current,
      completedAt: new Date().toISOString(),
    }));

    return {
      pointsEarned: progress?.pointsEarned ?? 0,
    };
  },

  getNearbyChases: () => clone(mockChases),

  // Admin/Partner features
  createChase: (chaseData: Omit<Chase, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'rating'>) => {
    const newChase: Chase = {
      ...chaseData,
      id: `chase-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: 0,
      rating: 0,
    };
    mockChases.push(newChase);
    return clone(newChase);
  },

  updateChase: (chaseId: string, updates: Partial<Omit<Chase, 'id' | 'createdAt'>>) => {
    const index = findChaseIndex(chaseId);
    if (index < 0) {
      throw new Error('Chase not found');
    }
    mockChases[index] = {
      ...mockChases[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return clone(mockChases[index]);
  },

  deleteChase: (chaseId: string) => {
    const index = findChaseIndex(chaseId);
    if (index < 0) {
      throw new Error('Chase not found');
    }
    const deleted = mockChases.splice(index, 1)[0];
    return clone(deleted);
  },
};
