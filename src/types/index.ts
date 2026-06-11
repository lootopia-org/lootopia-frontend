export type UserRole = 'admin' | 'partner' | 'player';

export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  bio?: string;
  avatar?: string;
  points: number;
  level: number;
  completedHunts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type MfaMethod = 'totp' | 'webauthn';

export interface LoginResponse {
  token: string;
  mfaRequired: boolean;
  mfaMethods: MfaMethod[];
}

export interface AuthTokenResponse {
  token: string;
}

export interface WebauthnBeginResponse {
  handle: string;
  publicKey: PublicKeyCredentialRequestOptions | PublicKeyCredentialCreationOptions;
}

export interface TotpEnrollBeginResponse {
  secret: string;
  otpauthUri: string;
}

export interface WebauthnCredential {
  id: string;
  name?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export type HuntDifficulty = 'easy' | 'medium' | 'hard';
export type HuntStatus = 'active' | 'draft' | 'archived';
export type HuntStepType = 'checkpoint' | 'riddle' | 'qr_code' | 'clue' | 'ar';

export interface HuntStep {
  id?: string;
  order: number;
  title: string;
  description: string;
  type: HuntStepType;
  clue?: string;
  answer?: string;
  latitude: string;
  longitude: string;
  reward: number;
}

export interface Hunt {
  id: string;
  title: string;
  description: string;
  image?: string;
  partnerId: string;
  difficulty: HuntDifficulty;
  estimatedDuration: number;
  status: HuntStatus;
  steps: HuntStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHuntPayload {
  title: string;
  description: string;
  image?: string;
  partnerId: string;
  difficulty: HuntDifficulty;
  estimatedDuration: number;
  status?: HuntStatus;
  steps: Omit<HuntStep, 'id'>[];
}

export interface UpdateHuntPayload {
  title?: string;
  description?: string;
  image?: string;
  difficulty?: HuntDifficulty;
  estimatedDuration?: number;
  status?: HuntStatus;
  steps?: HuntStep[];
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface LiveEvent {
  topic: string;
  type: string;
  payload: unknown;
  timestamp?: string;
}
