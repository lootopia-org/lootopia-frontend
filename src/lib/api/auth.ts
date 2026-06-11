import {
  apiRequest,
  clearAuthToken,
  setAuthToken,
} from '@/lib/api/client';
import type {
  AuthTokenResponse,
  LoginResponse,
  TotpEnrollBeginResponse,
  User,
  WebauthnBeginResponse,
  WebauthnCredential,
} from '@/types';

export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
  }) =>
    apiRequest<void>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    }),

  verifyEmail: (token: string) =>
    apiRequest<void>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      auth: false,
    }),

  resendVerification: (email: string) =>
    apiRequest<void>('/auth/resend-verification', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
      skipAuthRedirect: true,
    }),

  verifyTotp: (token: string, code: string) =>
    apiRequest<AuthTokenResponse>('/auth/mfa/totp', {
      method: 'POST',
      body: { token, code },
      auth: false,
      skipAuthRedirect: true,
    }),

  beginWebauthnLogin: (email: string) =>
    apiRequest<WebauthnBeginResponse>('/auth/webauthn/login/begin', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  completeWebauthnLogin: (handle: string, credential: unknown) =>
    apiRequest<AuthTokenResponse>('/auth/webauthn/login/complete', {
      method: 'POST',
      body: { handle, credential },
      auth: false,
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),

  me: () => apiRequest<User>('/auth/me', { skipAuthRedirect: true }),

  logout: () =>
    apiRequest<void>('/auth/logout', { method: 'POST' }).finally(clearAuthToken),

  totpEnrollBegin: () =>
    apiRequest<TotpEnrollBeginResponse>('/auth/totp/enroll/begin', {
      method: 'POST',
    }),

  totpEnrollVerify: (code: string) =>
    apiRequest<void>('/auth/totp/enroll/verify', {
      method: 'POST',
      body: { code },
    }),

  totpDisable: (code: string) =>
    apiRequest<void>('/auth/totp/disable', {
      method: 'POST',
      body: { code },
    }),

  webauthnRegisterBegin: () =>
    apiRequest<WebauthnBeginResponse>('/auth/webauthn/register/begin', {
      method: 'POST',
    }),

  webauthnRegisterComplete: (handle: string, credential: unknown) =>
    apiRequest<void>('/auth/webauthn/register/complete', {
      method: 'POST',
      body: { handle, credential },
    }),

  listWebauthnCredentials: () =>
    apiRequest<WebauthnCredential[]>('/auth/webauthn/credentials', {
      skipAuthRedirect: true,
    }),

  persistToken: setAuthToken,
};
