import { apiClient } from './api-client';
import {
  User,
  LoginResponse,
  WebauthnBeginResponse,
  WebauthnCompleteResponse,
} from '@/types';

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

// La vraie API /me peut renvoyer un utilisateur "à plat" (sans objet `profile`
// imbriqué) alors que l'UI lit `user.profile.*`. On garantit donc toujours un
// `profile` cohérent pour éviter les crashs côté profil / navbar.
const normalizeUser = (raw: any): User => {
  const profile = raw?.profile ?? {};
  return {
    ...raw,
    username: raw?.username ?? raw?.name ?? raw?.email?.split('@')[0] ?? 'Player',
    profile: {
      bio: profile.bio ?? raw?.bio,
      avatar: profile.avatar ?? raw?.avatar,
      completedChases: profile.completedChases ?? raw?.completedChases ?? 0,
      points: profile.points ?? raw?.points ?? 0,
      level: profile.level ?? raw?.level ?? 1,
    },
  } as User;
};

export const authService = {
  register: async (email: string, password: string): Promise<void> => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    const response = await apiClient.get('/auth/verify-email', {
      params: { token },
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  verifyTotp: async (token: string, code: string): Promise<WebauthnCompleteResponse> => {
    const response = await apiClient.post('/auth/mfa/totp', {
      token,
      code,
    });
    return response.data;
  },

  beginWebauthnLogin: async (email: string): Promise<WebauthnBeginResponse> => {
    const response = await apiClient.post('/auth/webauthn/login/begin', {
      email,
    });
    return response.data;
  },

  completeWebauthnLogin: async (
    handle: string,
    credential: unknown
  ): Promise<WebauthnCompleteResponse> => {
    const response = await apiClient.post('/auth/webauthn/login/complete', {
      handle,
      credential,
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<void> => {
    const response = await apiClient.post('/auth/resend-verification', {
      email,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get('/me');
    return normalizeUser(response.data);
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  // TOTP endpoints
  beginTotpEnroll: async (): Promise<TotpEnrollBeginResponse> => {
    const response = await apiClient.post('/auth/totp/enroll/begin');
    return response.data;
  },

  verifyTotpEnroll: async (code: string): Promise<void> => {
    const response = await apiClient.post('/auth/totp/enroll/verify', { code });
    return response.data;
  },

  disableTotp: async (code: string): Promise<void> => {
    const response = await apiClient.post('/auth/totp/disable', { code });
    return response.data;
  },

  // WebAuthn registration endpoints
  beginWebauthnRegister: async (): Promise<WebauthnBeginResponse> => {
    const response = await apiClient.post('/auth/webauthn/register/begin');
    return response.data;
  },

  completeWebauthnRegister: async (
    handle: string,
    credential: unknown
  ): Promise<void> => {
    const response = await apiClient.post('/auth/webauthn/register/complete', {
      handle,
      credential,
    });
    return response.data;
  },

  listWebauthnCredentials: async (): Promise<WebauthnCredential[]> => {
    const response = await apiClient.get('/auth/webauthn/credentials');
    return response.data;
  },
};
