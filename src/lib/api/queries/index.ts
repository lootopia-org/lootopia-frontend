'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { profileApi, huntApi } from '@/lib/api/hunts';
import { useAuthStore } from '@/lib/auth/session-store';
import type { CreateHuntPayload, Hunt, HuntStatus, HuntStep, LiveEvent, UpdateAdminProfilePayload, UpdateHuntPayload } from '@/types';

export const queryKeys = {
  me: ['auth', 'me'] as const,
  profile: ['profile'] as const,
  profiles: ['profiles'] as const,
  hunts: ['hunts'] as const,
  hunt: (id: string) => ['hunts', id] as const,
  joinedHunts: ['hunts', 'joined'] as const,
  huntParticipants: (id: string) => ['hunts', id, 'participants'] as const,
  huntAnalytics: (id: string) => ['hunts', id, 'analytics'] as const,
  webauthnCredentials: ['auth', 'webauthn', 'credentials'] as const,
};

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        const user = await authApi.me();
        setUser(user);
        return user;
      } catch {
        setUser(null);
        return null;
      } finally {
        setHydrated(true);
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      try {
        return await profileApi.get();
      } catch (err) {
        if (
          err instanceof ApiRequestError &&
          (err.status === 404 || err.status === 401)
        ) {
          return null;
        }
        throw err;
      }
    },
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useProfiles(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profiles,
    queryFn: () => profileApi.list(),
    enabled,
  });
}

export function useHunts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.hunts,
    queryFn: () => huntApi.list(),
    enabled,
    retry: false,
  });
}

export function useManagedHunts(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.hunts, 'managed'] as const,
    queryFn: () => huntApi.listManaged(),
    enabled,
    retry: false,
  });
}

export function useHunt(id: string) {
  return useQuery({
    queryKey: queryKeys.hunt(id),
    queryFn: () => huntApi.get(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useJoinedHunts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.joinedHunts,
    queryFn: async () => {
      try {
        return await huntApi.joined();
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          return [];
        }
        throw err;
      }
    },
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useCreateHunt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHuntPayload) => huntApi.create(payload),
    onSuccess: (hunt) => {
      qc.setQueryData(queryKeys.hunt(hunt.id), hunt);
      qc.invalidateQueries({ queryKey: queryKeys.hunts });
      qc.invalidateQueries({ queryKey: [...queryKeys.hunts, 'managed'] });
    },
  });
}

export function useUpdateHunt(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateHuntPayload) => huntApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.hunts });
      qc.invalidateQueries({ queryKey: [...queryKeys.hunts, 'managed'] });
      qc.invalidateQueries({ queryKey: queryKeys.hunt(id) });
    },
  });
}

export function useUpdateHuntStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: HuntStatus) => huntApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.hunts });
      qc.invalidateQueries({ queryKey: [...queryKeys.hunts, 'managed'] });
      qc.invalidateQueries({ queryKey: queryKeys.hunt(id) });
      qc.invalidateQueries({ queryKey: queryKeys.joinedHunts });
    },
  });
}

export function useSaveHuntEdit(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      metadata,
      steps,
      originalSteps,
    }: {
      metadata: UpdateHuntPayload;
      steps: HuntStep[];
      originalSteps: HuntStep[];
    }) => huntApi.saveEdit(id, metadata, steps, originalSteps),
    onSuccess: (hunt) => {
      qc.setQueryData(queryKeys.hunt(id), hunt);
      qc.invalidateQueries({ queryKey: queryKeys.hunts });
      qc.invalidateQueries({ queryKey: [...queryKeys.hunts, 'managed'] });
      qc.invalidateQueries({ queryKey: queryKeys.huntAnalytics(id) });
    },
  });
}

export function useHuntParticipants(huntId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.huntParticipants(huntId),
    queryFn: () => huntApi.participants(huntId),
    enabled: enabled && !!huntId,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
}

export function useHuntAnalytics(huntId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.huntAnalytics(huntId),
    queryFn: () => huntApi.analytics(huntId),
    enabled: enabled && !!huntId,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
}

export function useUpdateAdminProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateAdminProfilePayload;
    }) => profileApi.adminUpdate(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profiles });
      qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useDeleteHunt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => huntApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.hunts });
      qc.invalidateQueries({ queryKey: [...queryKeys.hunts, 'managed'] });
    },
  });
}

export function useWebauthnCredentials(enabled = true) {
  return useQuery({
    queryKey: queryKeys.webauthnCredentials,
    queryFn: async () => {
      try {
        return await authApi.listWebauthnCredentials();
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          return [];
        }
        throw err;
      }
    },
    enabled,
    retry: false,
  });
}

export function invalidateLiveQueries(
  qc: ReturnType<typeof useQueryClient>,
  event: LiveEvent
) {
  const topic = event.topic.split('.')[0];

  switch (topic) {
    case 'hunts':
      qc.invalidateQueries({ queryKey: queryKeys.hunts });
      qc.invalidateQueries({ queryKey: queryKeys.joinedHunts });
      if (
        event.payload &&
        typeof event.payload === 'object' &&
        'id' in event.payload &&
        typeof (event.payload as { id: string }).id === 'string'
      ) {
        qc.invalidateQueries({
          queryKey: queryKeys.hunt((event.payload as { id: string }).id),
        });
      }
      if (
        event.payload &&
        typeof event.payload === 'object' &&
        'huntId' in event.payload &&
        typeof (event.payload as { huntId: string }).huntId === 'string'
      ) {
        const huntId = (event.payload as { huntId: string }).huntId;
        qc.invalidateQueries({ queryKey: queryKeys.hunt(huntId) });
        qc.invalidateQueries({ queryKey: queryKeys.huntParticipants(huntId) });
        qc.invalidateQueries({ queryKey: queryKeys.huntAnalytics(huntId) });
      } else if (event.resourceId) {
        qc.invalidateQueries({ queryKey: queryKeys.huntParticipants(event.resourceId) });
        qc.invalidateQueries({ queryKey: queryKeys.huntAnalytics(event.resourceId) });
      }
      break;
    case 'profiles':
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.profiles });
      break;
    case 'hunt_steps':
      if (
        event.payload &&
        typeof event.payload === 'object' &&
        'huntId' in event.payload &&
        typeof (event.payload as { huntId: string }).huntId === 'string'
      ) {
        qc.invalidateQueries({
          queryKey: queryKeys.hunt((event.payload as { huntId: string }).huntId),
        });
        qc.invalidateQueries({
          queryKey: queryKeys.huntAnalytics((event.payload as { huntId: string }).huntId),
        });
      }
      qc.invalidateQueries({ queryKey: queryKeys.joinedHunts });
      break;
    default:
      break;
  }
}
