import { apiClient } from './api-client';
import {
  User,
  LoginResponse,
  WebauthnBeginResponse,
  WebauthnCompleteResponse,
} from '@/types';

export const authService = {
  register: async (email: string, password: string): Promise<void> => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
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
};
