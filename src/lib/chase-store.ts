import { create } from 'zustand';
import { Chase, UserProgress } from '@/types';

interface ChaseStore {
  chases: Chase[];
  currentChase: Chase | null;
  userProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;

  setChases: (chases: Chase[]) => void;
  setCurrentChase: (chase: Chase | null) => void;
  setUserProgress: (progress: UserProgress | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChaseStore = create<ChaseStore>((set) => ({
  chases: [],
  currentChase: null,
  userProgress: null,
  isLoading: false,
  error: null,

  setChases: (chases) => set({ chases }),
  setCurrentChase: (chase) => set({ currentChase: chase }),
  setUserProgress: (progress) => set({ userProgress: progress }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
