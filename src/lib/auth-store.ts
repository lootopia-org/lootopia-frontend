import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/lib/auth-service';
import { tokenService, userService } from '@/lib/storage-service';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user: User) => {
    userService.setUser(user);
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  logout: () => {
    tokenService.removeToken();
    userService.removeUser();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: async () => {
    const token = tokenService.getToken();
    const user = userService.getUser();

    if (token && user) {
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    if (token) {
      try {
        const fetchedUser = await authService.me();
        userService.setUser(fetchedUser);
        set({
          user: fetchedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch {
        tokenService.removeToken();
        userService.removeUser();
      }
    } else {
      set({ isLoading: false });
    }

    set({ isLoading: false, isAuthenticated: false, user: null });
  },
}));
