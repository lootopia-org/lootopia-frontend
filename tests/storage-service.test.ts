import Cookies from 'js-cookie';
import { tokenService, userService } from '@/lib/storage-service';
import { User } from '@/types';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

const mockedCookies = jest.mocked(Cookies);

describe('tokenService', () => {
  const mockToken = 'test-auth-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setToken', () => {
    it('should set token in cookies with correct options', () => {
      tokenService.setToken(mockToken);

      expect(mockedCookies.set).toHaveBeenCalledWith('authToken', mockToken, {
        expires: 7,
        secure: true,
        sameSite: 'Strict',
      });
    });
  });

  describe('getToken', () => {
    it('should get token from cookies', () => {
      mockedCookies.get.mockReturnValue(mockToken);

      const result = tokenService.getToken();

      expect(mockedCookies.get).toHaveBeenCalledWith('authToken');
      expect(result).toEqual(mockToken);
    });

    it('should return null when no token', () => {
      mockedCookies.get.mockReturnValue(undefined);

      const result = tokenService.getToken();

      expect(result).toBeNull();
    });
  });

  describe('removeToken', () => {
    it('should remove token from cookies', () => {
      tokenService.removeToken();

      expect(mockedCookies.remove).toHaveBeenCalledWith('authToken');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockedCookies.get.mockReturnValue(mockToken);

      expect(tokenService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      mockedCookies.get.mockReturnValue(undefined);

      expect(tokenService.isAuthenticated()).toBe(false);
    });
  });
});

describe('userService', () => {
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
    localStorage.clear();
  });

  describe('setUser', () => {
    it('should save user to localStorage', () => {
      userService.setUser(mockUser);

      expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUser));
    });
  });

  describe('getUser', () => {
    it('should get user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = userService.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user', () => {
      const result = userService.getUser();

      expect(result).toBeNull();
    });
  });

  describe('removeUser', () => {
    it('should remove user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      userService.removeUser();

      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user in localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      userService.updateUser({ username: 'updateduser' });

      const result = userService.getUser();
      expect(result?.username).toEqual('updateduser');
    });

    it('should do nothing when no user exists', () => {
      userService.updateUser({ username: 'test' });
      // Just ensure it doesn't throw an error
      expect(true).toBe(true);
    });
  });
});
