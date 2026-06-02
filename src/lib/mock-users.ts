import { User } from '@/types';

const now = new Date();

const createDate = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'alice@lootopia.com',
    username: 'alice',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    createdAt: createDate(30),
    updatedAt: createDate(2),
    points: 4500,
    level: 5,
    profile: {
      bio: 'Admin and power user',
      completedChases: 15,
    },
    badges: [
      { id: 'badge-1', name: 'Première chasse', icon: '🎯', unlockedAt: createDate(28) },
      { id: 'badge-2', name: 'Explorateur', icon: '🗺️', unlockedAt: createDate(20) },
    ],
  },
  {
    id: 'user-2',
    email: 'bob@partner.com',
    username: 'bob',
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'partner',
    createdAt: createDate(25),
    updatedAt: createDate(5),
    points: 2000,
    level: 3,
    profile: {
      bio: 'Partner managing chases',
      completedChases: 5,
    },
    badges: [
      { id: 'badge-3', name: 'Créateur de chasse', icon: '✍️', unlockedAt: createDate(22) },
    ],
  },
  {
    id: 'user-3',
    email: 'charlie@example.com',
    username: 'charlie',
    name: 'Charlie Brown',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
    role: 'player',
    createdAt: createDate(15),
    updatedAt: createDate(1),
    points: 800,
    level: 2,
    profile: {
      bio: 'New user exploring',
      completedChases: 2,
    },
    badges: [],
  },
  {
    id: 'user-4',
    email: 'diana@example.com',
    username: 'diana',
    name: 'Diana Prince',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    role: 'player',
    createdAt: createDate(10),
    updatedAt: createDate(0),
    points: 1500,
    level: 3,
    profile: {
      bio: 'Adventure lover',
      completedChases: 8,
    },
    badges: [
      { id: 'badge-4', name: 'Première chasse', icon: '🎯', unlockedAt: createDate(9) },
    ],
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const findUserIndex = (userId: string) => mockUsers.findIndex((user) => user.id === userId);

export const mockUserData = {
  getUsers: () => clone(mockUsers),

  getUserById: (userId: string) => {
    const index = findUserIndex(userId);
    return index >= 0 ? clone(mockUsers[index]) : null;
  },

  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'points' | 'level' | 'badges'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      points: 0,
      level: 1,
      badges: [],
    };
    mockUsers.push(newUser);
    return clone(newUser);
  },

  updateUser: (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    const index = findUserIndex(userId);
    if (index < 0) {
      throw new Error('User not found');
    }
    mockUsers[index] = {
      ...mockUsers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return clone(mockUsers[index]);
  },

  deleteUser: (userId: string) => {
    const index = findUserIndex(userId);
    if (index < 0) {
      throw new Error('User not found');
    }
    const deleted = mockUsers.splice(index, 1)[0];
    return clone(deleted);
  },

  searchUsers: (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    return clone(mockUsers.filter((user) => {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    }));
  },
};
