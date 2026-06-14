'use client';

import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  pendingToken: string | null;
  mfaMethods: string[];
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setPendingMfa: (token: string, methods: string[]) => void;
  clearPendingMfa: () => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  pendingToken: null,
  mfaMethods: [],
  isHydrated: false,
  setUser: (user) => set({ user }),
  setPendingMfa: (token, methods) =>
    set({ pendingToken: token, mfaMethods: methods }),
  clearPendingMfa: () => set({ pendingToken: null, mfaMethods: [] }),
  setHydrated: (value) => set({ isHydrated: value }),
  reset: () =>
    set({ user: null, pendingToken: null, mfaMethods: [], isHydrated: true }),
}));
