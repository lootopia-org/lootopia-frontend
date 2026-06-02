import { gamificationService } from '@/lib/gamification-service';
import { apiClient } from '@/lib/api-client';
import { Leaderboard } from '@/types';

// Mock axios
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = jest.mocked(apiClient);

describe('gamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_USE_MOCK_GAMIFICATION;
  });

  describe('getUserStats', () => {
    it('should get user stats from API', async () => {
      const mockStats = { points: 1000, level: 5 };
      mockedApiClient.get.mockResolvedValue({ data: mockStats });

      const result = await gamificationService.getUserStats('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/1/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getLeaderboard', () => {
    it('should get leaderboard from API', async () => {
      const mockLeaderboard: Leaderboard[] = [
        { rank: 1, user: { id: '1', username: 'user1', email: 'user1@test.com', profile: { points: 5000, level: 10, completedChases: 20 } }, points: 5000, chases_completed: 20 },
      ];
      mockedApiClient.get.mockResolvedValue({ data: mockLeaderboard });

      const result = await gamificationService.getLeaderboard(50);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/leaderboard', { params: { limit: 50 } });
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('getAchievements', () => {
    it('should get user achievements', async () => {
      const mockAchievements = [
        { id: '1', name: 'First Chase', unlocked: true },
      ];
      mockedApiClient.get.mockResolvedValue({ data: mockAchievements });

      const result = await gamificationService.getAchievements('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/1/achievements');
      expect(result).toEqual(mockAchievements);
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock achievement', async () => {
      const mockResult = { success: true };
      mockedApiClient.post.mockResolvedValue({ data: mockResult });

      const result = await gamificationService.unlockAchievement('1', 'ach1');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/users/1/achievements/ach1/unlock');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserRank', () => {
    it('should get user rank', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { rank: 10 } });

      const result = await gamificationService.getUserRank('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/1/rank');
      expect(result).toEqual(10);
    });
  });
});
