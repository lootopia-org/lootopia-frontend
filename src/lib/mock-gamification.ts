import { Leaderboard } from '@/types';
import { getMockUser } from './mock-auth';

const mockLeaderboard: Leaderboard[] = [
  {
    rank: 1,
    user: getMockUser('admin'),
    points: getMockUser('admin').profile.points,
    chases_completed: getMockUser('admin').profile.completedChases,
  },
  {
    rank: 2,
    user: getMockUser('player'),
    points: getMockUser('player').profile.points,
    chases_completed: getMockUser('player').profile.completedChases,
  },
  {
    rank: 3,
    user: {
      id: 'mock-rival-1',
      email: 'rival1@lootopia.local',
      username: 'Urban Explorer',
      role: 'player',
      profile: {
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80',
        bio: 'Demo rival profile.',
        points: 980,
        level: 7,
        completedChases: 11,
      },
    },
    points: 980,
    chases_completed: 11,
  },
  {
    rank: 4,
    user: {
      id: 'mock-rival-2',
      email: 'rival2@lootopia.local',
      username: 'Quest Runner',
      role: 'player',
      profile: {
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&h=256&q=80',
        bio: 'Demo rival profile.',
        points: 860,
        level: 6,
        completedChases: 9,
      },
    },
    points: 860,
    chases_completed: 9,
  },
];

const mockStats = {
  'mock-admin': {
    points: getMockUser('admin').profile.points,
    level: getMockUser('admin').profile.level,
    completedChases: getMockUser('admin').profile.completedChases,
    progressPercentage: 82,
  },
  'mock-player': {
    points: getMockUser('player').profile.points,
    level: getMockUser('player').profile.level,
    completedChases: getMockUser('player').profile.completedChases,
    progressPercentage: 37,
  },
} as const;

const mockAchievements = {
  'mock-admin': [
    { id: 'admin-1', title: 'Moderator of the Realm', unlocked: true },
    { id: 'admin-2', title: 'Master Navigator', unlocked: true },
  ],
  'mock-player': [
    { id: 'player-1', title: 'First Treasure', unlocked: true },
    { id: 'player-2', title: 'AR Rookie', unlocked: true },
  ],
} as const;

export const mockGamificationData = {
  getUserStats: (userId: string) => mockStats[userId as keyof typeof mockStats] ?? mockStats['mock-player'],

  getLeaderboard: (limit = 50) => mockLeaderboard.slice(0, limit),

  getUserRank: (userId: string) => {
    const entry = mockLeaderboard.find((leaderboardEntry) => leaderboardEntry.user.id === userId);
    return entry?.rank ?? 0;
  },

  getAchievements: (userId: string) => mockAchievements[userId as keyof typeof mockAchievements] ?? [],

  unlockAchievement: (_userId: string, achievementId: string) => ({
    id: achievementId,
    unlocked: true,
  }),
};