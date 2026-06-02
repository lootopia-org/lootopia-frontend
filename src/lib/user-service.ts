import { apiClient } from './api-client';
import { User } from '@/types';
import { mockUserData } from './mock-users';

const USE_MOCK_USERS = process.env.NEXT_PUBLIC_USE_MOCK_CHASES === 'true';

const shouldUseMock = () => USE_MOCK_USERS;

export const userService = {
  getUsers: async (): Promise<User[]> => {
    if (shouldUseMock()) {
      return mockUserData.getUsers();
    }

    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch {
      return mockUserData.getUsers();
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    if (shouldUseMock()) {
      return mockUserData.getUserById(userId);
    }

    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch {
      return mockUserData.getUserById(userId);
    }
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'points' | 'level' | 'badges'>): Promise<User> => {
    if (shouldUseMock()) {
      return mockUserData.createUser(userData);
    }

    try {
      const response = await apiClient.post('/admin/users', userData);
      return response.data;
    } catch {
      return mockUserData.createUser(userData);
    }
  },

  updateUser: async (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => {
    if (shouldUseMock()) {
      return mockUserData.updateUser(userId, updates);
    }

    try {
      const response = await apiClient.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch {
      return mockUserData.updateUser(userId, updates);
    }
  },

  deleteUser: async (userId: string): Promise<User> => {
    if (shouldUseMock()) {
      return mockUserData.deleteUser(userId);
    }

    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch {
      return mockUserData.deleteUser(userId);
    }
  },

  searchUsers: async (query: string): Promise<User[]> => {
    if (shouldUseMock()) {
      return mockUserData.searchUsers(query);
    }

    try {
      const response = await apiClient.get('/admin/users/search', { params: { q: query } });
      return response.data;
    } catch {
      return mockUserData.searchUsers(query);
    }
  },
};
