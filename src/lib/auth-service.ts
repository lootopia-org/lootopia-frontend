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
    return response.data;
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
