// User types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'partner' | 'player';
  points: number;
  level: number;
  createdAt: string;
  updatedAt: string;
  profile: {
    bio?: string;
    completedChases: number;
    avatar?: string;
  };
  badges?: Array<{
    id: string;
    name: string;
    icon?: string;
    unlockedAt: string;
  }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type MfaMethod = 'totp' | 'webauthn';

export interface LoginResponse {
  token: string;
  mfaRequired: boolean;
  mfaMethods: MfaMethod[];
}

export interface WebauthnBeginResponse {
  handle: string;
  publicKey: PublicKeyCredentialRequestOptions;
}

export interface WebauthnCompleteResponse {
  token: string;
}

// Hunt/Chase types
export interface Chase {
  id: string;
  title: string;
  description: string;
  image?: string;
  partner: Partner;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // minutes
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'draft' | 'archived';
  /** État de publication côté studio : seul 'live' (→ status 'active') est visible des joueurs. */
  launchMode?: 'draft' | 'test' | 'live';
  participants: number;
  rating: number;
  steps: ChaseStep[];
}

export interface ChaseStep {
  id: string;
  order: number;
  title: string;
  description: string;
  clue: string;
  location: {
    latitude: number;
    longitude: number;
  };
  arContent?: ARContent;
  reward?: number; // points
  completed: boolean;
}

export interface ARContent {
  id: string;
  type: 'model' | 'image' | 'marker';
  data: string; // URL or data
  scale?: number;
  rotation?: [number, number, number];
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo?: string;
  chases: Chase[];
}

// Gamification types
export interface UserProgress {
  userId: string;
  chaseId: string;
  currentStep: number;
  totalSteps: number;
  pointsEarned: number;
  startedAt: string;
  completedAt?: string;
  stepProgress: StepProgress[];
}

export interface StepProgress {
  stepId: string;
  completed: boolean;
  completedAt?: string;
  arInteraction?: boolean;
}

export interface Leaderboard {
  rank: number;
  user: User;
  points: number;
  chases_completed: number;
}

// Map types
export interface MapLocation {
  latitude: number;
  longitude: number;
  zoom?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
