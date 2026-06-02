import { chaseService } from '@/lib/chase-service';
import { apiClient } from '@/lib/api-client';
import { Chase, UserProgress, ChaseStep } from '@/types';

// Mock axios
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = jest.mocked(apiClient);

describe('chaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_USE_MOCK_CHASES;
  });

  const mockChase: Chase = {
    id: '1',
    title: 'Test Chase',
    description: 'A test chase',
    difficulty: 'easy',
    estimatedDuration: 30,
    location: { latitude: 48.8566, longitude: 2.3522 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    status: 'active',
    participants: 5,
    rating: 4.5,
    steps: [],
  };

  const mockUserProgress: UserProgress = {
    userId: '1',
    chaseId: '1',
    currentStep: 0,
    totalSteps: 3,
    pointsEarned: 100,
    startedAt: '2024-01-01T00:00:00Z',
    stepProgress: [],
  };

  describe('getChases', () => {
    it('should call API and return chases', async () => {
      const mockData = { data: [mockChase], total: 1 };
      mockedApiClient.get.mockResolvedValue({ data: mockData });

      const result = await chaseService.getChases(1, 10);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/chases', { params: { page: 1, limit: 10 } });
      expect(result).toEqual(mockData);
    });
  });

  describe('getChase', () => {
    it('should call API and return chase', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockChase });

      const result = await chaseService.getChase('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/chases/1');
      expect(result).toEqual(mockChase);
    });
  });

  describe('searchChases', () => {
    it('should call search API', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [mockChase] });

      const result = await chaseService.searchChases('test');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/chases/search', { params: { q: 'test' } });
      expect(result).toEqual([mockChase]);
    });
  });

  describe('getUserChases', () => {
    it('should get user chases from API', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [mockChase] });

      const result = await chaseService.getUserChases('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/1/chases');
      expect(result).toEqual([mockChase]);
    });
  });

  describe('startChase', () => {
    it('should start a chase via API', async () => {
      mockedApiClient.post.mockResolvedValue({ data: mockUserProgress });

      const result = await chaseService.startChase('1');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/chases/1/start');
      expect(result).toEqual(mockUserProgress);
    });
  });

  describe('getCaseProgress', () => {
    it('should get chase progress', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockUserProgress });

      const result = await chaseService.getCaseProgress('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/chases/1/progress');
      expect(result).toEqual(mockUserProgress);
    });
  });

  describe('completeStep', () => {
    it('should complete a step', async () => {
      const mockStep: ChaseStep = {
        id: 'step1',
        order: 1,
        title: 'Step 1',
        description: 'First step',
        clue: 'Clue here',
        location: { latitude: 48.8566, longitude: 2.3522 },
        completed: true,
      };
      
      mockedApiClient.post.mockResolvedValue({ data: mockStep });

      const result = await chaseService.completeStep('1', 'step1');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/chases/1/steps/step1/complete');
      expect(result).toEqual(mockStep);
    });
  });

  describe('completeChase', () => {
    it('should complete a chase', async () => {
      mockedApiClient.post.mockResolvedValue({ data: { pointsEarned: 500 } });

      const result = await chaseService.completeChase('1');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/chases/1/complete');
      expect(result).toEqual({ pointsEarned: 500 });
    });
  });

  describe('getNearbyChases', () => {
    it('should get nearby chases', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [mockChase] });

      const result = await chaseService.getNearbyChases(48.8566, 2.3522, 10);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/chases/nearby', {
        params: { latitude: 48.8566, longitude: 2.3522, radius: 10 },
      });
      expect(result).toEqual([mockChase]);
    });
  });
});
