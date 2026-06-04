import { User } from '@/types';

export type MockRole = 'admin' | 'partner' | 'player';

export const mockCredentials: Record<MockRole, { email: string; password: string }> = {
  admin: {
    email: 'admin@lootopia.local',
    password: 'Admin123!',
  },
  partner: {
    email: 'partner@lootopia.local',
    password: 'Partner123!',
  },
  player: {
    email: 'player@lootopia.local',
    password: 'Player123!',
  },
};

const mockUsers: Record<MockRole, User> = {
  admin: {
    id: 'mock-admin',
    email: mockCredentials.admin.email,
    username: 'Lootopia Admin',
    role: 'admin',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=256&h=256&q=80',
      bio: 'Admin test account with full access to the dashboard and moderation tools.',
      points: 9800,
      level: 42,
      completedChases: 128,
    },
  },
  partner: {
    id: 'mock-partner',
    email: mockCredentials.partner.email,
    username: 'Partner Studio',
    role: 'partner',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
      bio: 'Partner workspace demo account for creating and managing branded treasure hunts.',
      points: 4200,
      level: 18,
      completedChases: 36,
    },
  },
  player: {
    id: 'mock-player',
    email: mockCredentials.player.email,
    username: 'Treasure Player',
    role: 'player',
    profile: {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
      bio: 'Player test account for exploring chases and tracking progression.',
      points: 1240,
      level: 8,
      completedChases: 14,
    },
  },
};

export const isMockCredentials = (email: string, password: string) => {
  return (
    (email === mockCredentials.admin.email && password === mockCredentials.admin.password) ||
    (email === mockCredentials.partner.email && password === mockCredentials.partner.password) ||
    (email === mockCredentials.player.email && password === mockCredentials.player.password)
  );
};

export const getMockRoleFromCredentials = (email: string, password: string): MockRole | null => {
  if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
    return 'admin';
  }

  if (email === mockCredentials.partner.email && password === mockCredentials.partner.password) {
    return 'partner';
  }

  if (email === mockCredentials.player.email && password === mockCredentials.player.password) {
    return 'player';
  }

  return null;
};

export const getMockUser = (role: MockRole): User => mockUsers[role];

export const getMockAuthResponse = (role: MockRole) => ({
  token: `mock-${role}-token`,
  user: mockUsers[role],
});
