import { apiClient } from './api-client';
import { Chase, ChaseStep, UserProgress } from '@/types';
import { mockChaseData } from './mock-chases';
import { userService } from './storage-service';

const USE_MOCK_CHASES = process.env.NEXT_PUBLIC_USE_MOCK_CHASES === 'true';

const shouldUseMock = () => USE_MOCK_CHASES;

export const chaseService = {
  // Get all chases
  getChases: async (page = 1, limit = 10): Promise<{ data: Chase[]; total: number }> => {
    if (shouldUseMock()) {
      const data = mockChaseData.getChases();
      return { data: data.slice((page - 1) * limit, page * limit), total: data.length };
    }

    try {
      const response = await apiClient.get('/chases', {
        params: { page, limit },
      });
      return response.data;
    } catch {
      const data = mockChaseData.getChases();
      return { data: data.slice((page - 1) * limit, page * limit), total: data.length };
    }
  },

  // Get a single chase
  getChase: async (chaseId: string): Promise<Chase> => {
    if (shouldUseMock()) {
      const chase = mockChaseData.getChaseById(chaseId);
      if (!chase) {
        throw new Error('Chase not found');
      }
      return chase;
    }

    try {
      const response = await apiClient.get(`/chases/${chaseId}`);
      return response.data;
    } catch {
      const chase = mockChaseData.getChaseById(chaseId);
      if (!chase) {
        throw new Error('Chase not found');
      }
      return chase;
    }
  },

  // Search chases
  searchChases: async (query: string): Promise<Chase[]> => {
    if (shouldUseMock()) {
      return mockChaseData.searchChases(query);
    }

    try {
      const response = await apiClient.get('/chases/search', {
        params: { q: query },
      });
      return response.data;
    } catch {
      return mockChaseData.searchChases(query);
    }
  },

  // Get user's active chases
  getUserChases: async (userId: string): Promise<Chase[]> => {
    if (shouldUseMock()) {
      return mockChaseData.getUserChases(userId);
    }

    try {
      const response = await apiClient.get(`/users/${userId}/chases`);
      return response.data;
    } catch {
      return mockChaseData.getUserChases(userId);
    }
  },

  // Start a chase
  startChase: async (chaseId: string): Promise<UserProgress> => {
    if (shouldUseMock()) {
      return mockChaseData.startChase(chaseId, userService.getUser()?.id || 'mock-player');
    }

    try {
      const response = await apiClient.post(`/chases/${chaseId}/start`);
      return response.data;
    } catch {
      return mockChaseData.startChase(chaseId, userService.getUser()?.id || 'mock-player');
    }
  },

  // Get chase progress
  getCaseProgress: async (chaseId: string): Promise<UserProgress | null> => {
    if (shouldUseMock()) {
      return mockChaseData.getProgress(chaseId);
    }

    try {
      const response = await apiClient.get(`/chases/${chaseId}/progress`);
      return response.data;
    } catch {
      return mockChaseData.getProgress(chaseId);
    }
  },

  // Complete a step
  completeStep: async (chaseId: string, stepId: string): Promise<ChaseStep> => {
    if (shouldUseMock()) {
      return mockChaseData.completeStep(chaseId, stepId);
    }

    try {
      const response = await apiClient.post(`/chases/${chaseId}/steps/${stepId}/complete`);
      return response.data;
    } catch {
      return mockChaseData.completeStep(chaseId, stepId);
    }
  },

  // Interact with AR
  interactAR: async (chaseId: string, stepId: string): Promise<any> => {
    if (shouldUseMock()) {
      return mockChaseData.interactAR(chaseId, stepId);
    }

    try {
      const response = await apiClient.post(`/chases/${chaseId}/steps/${stepId}/ar-interact`);
      return response.data;
    } catch {
      return mockChaseData.interactAR(chaseId, stepId);
    }
  },

  // Complete chase
  completeChase: async (chaseId: string): Promise<{ pointsEarned: number }> => {
    if (shouldUseMock()) {
      return mockChaseData.completeChase(chaseId);
    }

    try {
      const response = await apiClient.post(`/chases/${chaseId}/complete`);
      return response.data;
    } catch {
      return mockChaseData.completeChase(chaseId);
    }
  },

  // Get nearby chases
  getNearbyChases: async (
    latitude: number,
    longitude: number,
    radius = 10
  ): Promise<Chase[]> => {
    if (shouldUseMock()) {
      return mockChaseData.getNearbyChases();
    }

    try {
      const response = await apiClient.get('/chases/nearby', {
        params: { latitude, longitude, radius },
      });
      return response.data;
    } catch {
      return mockChaseData.getNearbyChases();
    }
  },
};
