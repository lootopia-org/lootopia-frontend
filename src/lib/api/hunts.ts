import { apiRequest } from '@/lib/api/client';
import {
  fromApiHunt,
  toCreateHuntPayload,
  toUpdateHuntPayload,
  type ApiHunt,
} from '@/lib/api/hunt-mappers';
import type { CreateHuntPayload, Hunt, UpdateHuntPayload } from '@/types';
import type { Profile } from '@/types';

export const profileApi = {
  get: () => apiRequest<Profile>('/profile', { skipAuthRedirect: true }),

  update: (huntId: string) =>
    apiRequest<Profile>('/profile', {
      method: 'PATCH',
      body: { huntId },
    }),

  delete: () => apiRequest<void>('/profile', { method: 'DELETE' }),

  list: () => apiRequest<Profile[]>('/profile/list'),
};

export const huntApi = {
  list: async () => {
    const hunts = await apiRequest<ApiHunt[]>('/hunt');
    return hunts.map(fromApiHunt);
  },

  get: async (id: string) => {
    const hunt = await apiRequest<ApiHunt>(`/hunt/${id}`);
    return fromApiHunt(hunt);
  },

  create: async (payload: CreateHuntPayload) => {
    const hunt = await apiRequest<ApiHunt>('/hunt', {
      method: 'POST',
      body: toCreateHuntPayload(payload),
    });
    return fromApiHunt(hunt);
  },

  update: async (id: string, payload: UpdateHuntPayload) => {
    const hunt = await apiRequest<ApiHunt>(`/hunt/${id}`, {
      method: 'PATCH',
      body: toUpdateHuntPayload(payload),
    });
    return fromApiHunt(hunt);
  },

  delete: (id: string) => apiRequest<void>(`/hunt/${id}`, { method: 'DELETE' }),

  join: (huntId: string) =>
    apiRequest<void>('/hunt/join', { method: 'POST', body: { huntId } }),

  leave: (huntId: string) =>
    apiRequest<void>('/hunt/leave', { method: 'POST', body: { huntId } }),

  joined: async () => {
    const hunts = await apiRequest<ApiHunt[]>('/hunt/joined', { skipAuthRedirect: true });
    return hunts.map(fromApiHunt);
  },
};
