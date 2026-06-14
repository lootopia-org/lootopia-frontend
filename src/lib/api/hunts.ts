import { apiRequest } from '@/lib/api/client';
import {
  fromApiAnalytics,
  fromApiHunt,
  fromApiParticipant,
  toCreateHuntPayload,
  toCreateStepPayload,
  toUpdateHuntPayload,
  toUpdateStepPayload,
  type ApiHunt,
} from '@/lib/api/hunt-mappers';
import type {
  CreateHuntPayload,
  CreateHuntStepPayload,
  Hunt,
  HuntAnalytics,
  HuntParticipant,
  HuntStep,
  HuntStatus,
  UpdateAdminProfilePayload,
  UpdateHuntPayload,
  UpdateHuntStepPayload,
} from '@/types';
import type { Profile } from '@/types';

interface ApiHuntStep {
  id: string;
  stepOrder: number;
  title: string;
  description: string;
  type: string;
  awnser?: string | null;
  latitude: string;
  longitude: string;
  points: number;
}

function mapApiStep(step: ApiHuntStep): HuntStep {
  return {
    id: step.id,
    order: step.stepOrder,
    title: step.title,
    description: step.description,
    type: step.type as HuntStep['type'],
    latitude: String(step.latitude),
    longitude: String(step.longitude),
    points: Math.round(step.points ?? 0),
    answer: step.awnser ?? undefined,
  };
}

export const profileApi = {
  get: () => apiRequest<Profile>('/profile', { skipAuthRedirect: true }),

  // POST /profile — crée le profil (l'API renvoie 409 s'il existe déjà).
  create: () => apiRequest<Profile>('/profile', { method: 'POST' }),

  update: (huntId: string) =>
    apiRequest<Profile>('/profile', {
      method: 'PATCH',
      body: { huntId },
    }),

  delete: () => apiRequest<void>('/profile', { method: 'DELETE' }),

  list: () => apiRequest<Profile[]>('/profile/list'),

  adminUpdate: (userId: string, payload: UpdateAdminProfilePayload) =>
    apiRequest<Profile>(`/profile/${userId}`, {
      method: 'PATCH',
      body: payload,
    }),
};

export const huntApi = {
  list: async () => {
    const hunts = await apiRequest<ApiHunt[]>('/hunt');
    return hunts.map(fromApiHunt);
  },

  listManaged: async () => {
    const hunts = await apiRequest<ApiHunt[]>('/hunt?all=true');
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

  updateStatus: async (id: string, status: HuntStatus) => {
    return huntApi.update(id, { status });
  },

  createStep: async (payload: CreateHuntStepPayload): Promise<HuntStep> => {
    const step = await apiRequest<ApiHuntStep>('/hunt/step', {
      method: 'POST',
      body: toCreateStepPayload(payload),
    });
    return mapApiStep(step);
  },

  updateStep: async (stepId: string, payload: UpdateHuntStepPayload): Promise<HuntStep> => {
    const step = await apiRequest<ApiHuntStep>(`/hunt/step/${stepId}`, {
      method: 'PATCH',
      body: toUpdateStepPayload(payload),
    });
    return mapApiStep(step);
  },

  deleteStep: (stepId: string) =>
    apiRequest<void>(`/hunt/step/${stepId}`, { method: 'DELETE' }),

  participants: async (huntId: string) => {
    const participants = await apiRequest<HuntParticipant[]>(`/hunt/${huntId}/participants`);
    return participants.map(fromApiParticipant);
  },

  analytics: async (huntId: string) => {
    const analytics = await apiRequest<HuntAnalytics>(`/hunt/${huntId}/analytics`);
    return fromApiAnalytics(analytics);
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

  completed: async () => {
    const hunts = await apiRequest<ApiHunt[]>('/hunt/completed', { skipAuthRedirect: true });
    return hunts.map(fromApiHunt);
  },

  completedStepIds: async (huntId: string) => {
    const response = await apiRequest<unknown>(`/hunt/step/completed/${huntId}`, {
      skipAuthRedirect: true,
    });
    if (!Array.isArray(response)) {
      return [];
    }
    return response
      .map((step) => {
        if (!step || typeof step !== 'object') {
          return undefined;
        }
        const stepId = (step as { id?: string }).id;
        return typeof stepId === 'string' && stepId.length > 0 ? stepId : undefined;
      })
      .filter((stepId): stepId is string => Boolean(stepId));
  },

  syncSteps: async (huntId: string, steps: HuntStep[]): Promise<Hunt> => {
    const body = {
      steps: steps.map((step, index) => ({
        ...(step.id ? { id: step.id } : {}),
        stepOrder: index + 1,
        title: step.title,
        description: step.description,
        type: step.type,
        latitude: String(step.latitude),
        longitude: String(step.longitude),
        points: Number(step.points),
        awnser: step.answer?.trim() || null,
        scanInAr: step.type === 'qr_code' ? Boolean(step.scanInAr) : false,
      })),
    };

    await apiRequest(`/hunt/${huntId}/steps/sync`, {
      method: 'PUT',
      body,
    });

    return huntApi.get(huntId);
  },

  saveEdit: async (
    huntId: string,
    metadata: UpdateHuntPayload,
    steps: HuntStep[],
    _originalSteps: HuntStep[]
  ): Promise<Hunt> => {
    await huntApi.update(huntId, metadata);
    return huntApi.syncSteps(huntId, steps);
  },
};
