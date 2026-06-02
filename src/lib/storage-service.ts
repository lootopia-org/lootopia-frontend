import Cookies from 'js-cookie';
import { User } from '@/types';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const tokenService = {
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 days
      secure: true,
      sameSite: 'Strict',
    });
  },

  getToken: (): string | null => {
    return Cookies.get(TOKEN_KEY) || null;
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get(TOKEN_KEY);
  },
};

export const userService = {
  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  updateUser: (updates: Partial<User>) => {
    const user = userService.getUser();
    if (user) {
      const updatedUser = { ...user, ...updates };
      userService.setUser(updatedUser);
    }
  },
};
