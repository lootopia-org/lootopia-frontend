import { authService, TotpEnrollBeginResponse } from '@/lib/auth-service';
import { apiClient } from '@/lib/api-client';
import { User, LoginResponse, WebauthnBeginResponse, WebauthnCompleteResponse } from '@/types';

// Mock axios
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApiClient = jest.mocked(apiClient);

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call register endpoint', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      mockedApiClient.post.mockResolvedValue({ data: undefined });
      
      await authService.register(email, password);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', { email, password });
    });
  });

  describe('verifyEmail', () => {
    it('should call verify email endpoint', async () => {
      const token = 'test-token-123';
      mockedApiClient.get.mockResolvedValue({ data: undefined });
      
      await authService.verifyEmail(token);
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/verify-email', { params: { token } });
    });
  });

  describe('login', () => {
    it('should call login endpoint and return response', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse: LoginResponse = {
        token: 'test-token',
        mfaRequired: false,
        mfaMethods: [],
      };
      
      mockedApiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await authService.login(email, password);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyTotp', () => {
    it('should call verify totp endpoint', async () => {
      const token = 'test-token';
      const code = '123456';
      const mockResponse: WebauthnCompleteResponse = { token: 'elevated-token' };
      
      mockedApiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await authService.verifyTotp(token, code);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/mfa/totp', { token, code });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('WebAuthn login', () => {
    it('should call begin webauthn login', async () => {
      const email = 'test@example.com';
      const mockResponse: WebauthnBeginResponse = {
        handle: 'test-handle',
        publicKey: {} as any,
      };
      
      mockedApiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await authService.beginWebauthnLogin(email);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/webauthn/login/begin', { email });
      expect(result).toEqual(mockResponse);
    });

    it('should call complete webauthn login', async () => {
      const handle = 'test-handle';
      const credential = {};
      const mockResponse: WebauthnCompleteResponse = { token: 'webauthn-token' };
      
      mockedApiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await authService.completeWebauthnLogin(handle, credential);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/webauthn/login/complete', { handle, credential });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resendVerification', () => {
    it('should call resend verification endpoint', async () => {
      const email = 'test@example.com';
      
      await authService.resendVerification(email);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/resend-verification', { email });
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      await authService.logout();
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('me', () => {
    it('should call me endpoint and return user', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        profile: { points: 0, level: 1, completedChases: 0 },
      };
      
      mockedApiClient.get.mockResolvedValue({ data: mockUser });
      
      const result = await authService.me();
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should call update profile endpoint', async () => {
      const userId = '1';
      const data = { username: 'newname' };
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        username: 'newname',
        profile: { points: 0, level: 1, completedChases: 0 },
      };
      
      mockedApiClient.put.mockResolvedValue({ data: mockUser });
      
      const result = await authService.updateProfile(userId, data);
      
      expect(mockedApiClient.put).toHaveBeenCalledWith(`/users/${userId}`, data);
      expect(result).toEqual(mockUser);
    });
  });

  describe('TOTP enrollment', () => {
    it('should call begin totp enroll', async () => {
      const mockResponse: TotpEnrollBeginResponse = {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUri: 'otpauth://totp/Test:test?secret=JBSWY3DPEHPK3PXP',
      };
      
      mockedApiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await authService.beginTotpEnroll();
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/totp/enroll/begin');
      expect(result).toEqual(mockResponse);
    });

    it('should call verify totp enroll', async () => {
      const code = '123456';
      
      await authService.verifyTotpEnroll(code);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/totp/enroll/verify', { code });
    });

    it('should call disable totp', async () => {
      const code = '123456';
      
      await authService.disableTotp(code);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/totp/disable', { code });
    });
  });

  describe('WebAuthn registration', () => {
    it('should call begin webauthn register', async () => {
      const mockResponse: WebauthnBeginResponse = {
        handle: 'register-handle',
        publicKey: {} as any,
      };
      
      mockedApiClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await authService.beginWebauthnRegister();
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/webauthn/register/begin');
      expect(result).toEqual(mockResponse);
    });

    it('should call complete webauthn register', async () => {
      const handle = 'register-handle';
      const credential = {};
      
      await authService.completeWebauthnRegister(handle, credential);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/webauthn/register/complete', { handle, credential });
    });

    it('should call list webauthn credentials', async () => {
      const mockCredentials = [
        { id: '1', createdAt: '2024-01-01T00:00:00Z' },
      ];
      
      mockedApiClient.get.mockResolvedValue({ data: mockCredentials });
      
      const result = await authService.listWebauthnCredentials();
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/webauthn/credentials');
      expect(result).toEqual(mockCredentials);
    });
  });
});
