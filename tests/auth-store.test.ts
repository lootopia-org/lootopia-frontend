import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/lib/auth-store';
import { authService } from '@/lib/auth-service';
import { tokenService, userService } from '@/lib/storage-service';
import { User } from '@/types';

// Mock dependencies
jest.mock('@/lib/auth-service', () => ({
  authService: {
    me: jest.fn(),
  },
}));

jest.mock('@/lib/storage-service', () => ({
  tokenService: {
    getToken: jest.fn(),
    removeToken: jest.fn(),
  },
  userService: {
    getUser: jest.fn(),
    setUser: jest.fn(),
    removeUser: jest.fn(),
  },
}));

const mockedAuthService = jest.mocked(authService);
const mockedTokenService = jest.mocked(tokenService);
const mockedUserService = jest.mocked(userService);

describe('useAuthStore', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    profile: {
      points: 100,
      level: 5,
      completedChases: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state
    act(() => {
      useAuthStore.setState({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockedUserService.setUser).toHaveBeenCalledWith(mockUser);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should logout user', () => {
    // First set user
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(mockUser);
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockedTokenService.removeToken).toHaveBeenCalled();
    expect(mockedUserService.removeUser).toHaveBeenCalled();
  });

  describe('initializeAuth', () => {
    it('should initialize auth with stored token and user', async () => {
      mockedTokenService.getToken.mockReturnValue('token');
      mockedUserService.getUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch user from API when token exists but user not stored', async () => {
      mockedTokenService.getToken.mockReturnValue('token');
      mockedUserService.getUser.mockReturnValue(null);
      mockedAuthService.me.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(mockedAuthService.me).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(mockedUserService.setUser).toHaveBeenCalledWith(mockUser);
    });

    it('should clear auth when API fails to fetch user', async () => {
      mockedTokenService.getToken.mockReturnValue('token');
      mockedUserService.getUser.mockReturnValue(null);
      mockedAuthService.me.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(mockedTokenService.removeToken).toHaveBeenCalled();
      expect(mockedUserService.removeUser).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set not authenticated when no token', async () => {
      mockedTokenService.getToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
