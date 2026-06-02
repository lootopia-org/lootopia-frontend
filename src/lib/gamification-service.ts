import { apiClient } from './api-client';
import { Leaderboard } from '@/types';
import { mockGamificationData } from './mock-gamification';

const USE_MOCK_GAMIFICATION = process.env.NEXT_PUBLIC_USE_MOCK_GAMIFICATION === 'true';

export const gamificationService = {
  // Get user points and level
  getUserStats: async (userId: string) => {
    if (USE_MOCK_GAMIFICATION) {
      return mockGamificationData.getUserStats(userId);
    }

    try {
      const response = await apiClient.get(`/users/${userId}/stats`);
      return response.data;
    } catch {
      return mockGamificationData.getUserStats(userId);
    }
  },

  // Get leaderboard
  getLeaderboard: async (limit = 50): Promise<Leaderboard[]> => {
    if (USE_MOCK_GAMIFICATION) {
      return mockGamificationData.getLeaderboard(limit);
    }

    try {
      const response = await apiClient.get('/leaderboard', {
        params: { limit },
      });
      return response.data;
    } catch {
      return mockGamificationData.getLeaderboard(limit);
    }
  },

  // Get achievements
  getAchievements: async (userId: string) => {
    if (USE_MOCK_GAMIFICATION) {
      return mockGamificationData.getAchievements(userId);
    }

    try {
      const response = await apiClient.get(`/users/${userId}/achievements`);
      return response.data;
    } catch {
      return mockGamificationData.getAchievements(userId);
    }
  },

  // Unlock achievement
  unlockAchievement: async (userId: string, achievementId: string) => {
    if (USE_MOCK_GAMIFICATION) {
      return mockGamificationData.unlockAchievement(userId, achievementId);
    }

    try {
      const response = await apiClient.post(`/users/${userId}/achievements/${achievementId}/unlock`);
      return response.data;
    } catch {
      return mockGamificationData.unlockAchievement(userId, achievementId);
    }
  },

  // Get user rank
  getUserRank: async (userId: string): Promise<number> => {
    if (USE_MOCK_GAMIFICATION) {
      return mockGamificationData.getUserRank(userId);
    }

    try {
      const response = await apiClient.get(`/users/${userId}/rank`);
      return response.data.rank;
    } catch {
      return mockGamificationData.getUserRank(userId);
    }
  },
};
