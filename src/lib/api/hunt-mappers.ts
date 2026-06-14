import type {
  CreateHuntPayload,
  CreateHuntStepPayload,
  Hunt,
  HuntAnalytics,
  HuntParticipant,
  HuntStep,
  HuntStepType,
  UpdateHuntPayload,
  UpdateHuntStepPayload,
} from '@/types';

interface ApiHuntStep {
  id?: string;
  stepOrder: number;
  title: string;
  description: string;
  type: HuntStepType;
  awnser?: string | null;
  scanInAr?: boolean;
  latitude: string;
  longitude: string;
  points: number;
}

export type ApiHunt = Omit<Hunt, 'steps'> & {
  steps?: ApiHuntStep[];
  image?: string | null;
  rating?: number | null;
};

function toApiStep(
  step: Omit<HuntStep, 'id'> & { address?: string }
): Omit<ApiHuntStep, 'id'> {
  const { order, latitude, longitude, address: _address, points, answer, scanInAr, type, title, description } = step;
  return {
    stepOrder: order,
    title,
    description,
    type,
    latitude: String(latitude),
    longitude: String(longitude),
    points: Number(points),
    awnser: answer?.trim() || null,
    scanInAr: scanInAr ?? false,
  };
}

function toUpdateApiStep(step: UpdateHuntStepPayload) {
  const { order, answer, scanInAr, latitude, longitude, points, type, title, description } = step;
  return {
    ...(order !== undefined ? { stepOrder: order } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(type !== undefined ? { type } : {}),
    ...(latitude !== undefined ? { latitude: String(latitude) } : {}),
    ...(longitude !== undefined ? { longitude: String(longitude) } : {}),
    ...(points !== undefined ? { points: Number(points) } : {}),
    ...(answer !== undefined ? { awnser: answer?.trim() || null } : {}),
    ...(scanInAr !== undefined ? { scanInAr } : {}),
  };
}

function fromApiStep(step: ApiHuntStep): HuntStep {
  const { stepOrder, latitude, longitude, points, awnser, scanInAr, ...rest } = step;
  return {
    ...rest,
    order: stepOrder,
    latitude: String(latitude),
    longitude: String(longitude),
    points: Math.round(points ?? 0),
    answer: awnser ?? undefined,
    scanInAr: scanInAr ?? false,
  };
}

export function toCreateHuntPayload(payload: CreateHuntPayload) {
  return {
    ...payload,
    image: payload.image ?? null,
    steps: payload.steps.map(toApiStep),
  };
}

export function toUpdateHuntPayload(payload: UpdateHuntPayload) {
  const { title, description, image, difficulty, estimatedDuration, status } = payload;
  return {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(image !== undefined ? { image: image ?? null } : {}),
    ...(difficulty !== undefined ? { difficulty } : {}),
    ...(estimatedDuration !== undefined ? { estimatedDuration } : {}),
    ...(status !== undefined ? { status } : {}),
  };
}

export function toCreateStepPayload(payload: CreateHuntStepPayload) {
  const { huntId, order, answer, scanInAr, latitude, longitude, points, type, title, description } = payload;
  return {
    huntId,
    stepOrder: order,
    title,
    description,
    type,
    latitude: String(latitude),
    longitude: String(longitude),
    points: Number(points),
    awnser: answer?.trim() || null,
    scanInAr: scanInAr ?? false,
  };
}

export function toUpdateStepPayload(payload: UpdateHuntStepPayload) {
  return toUpdateApiStep(payload);
}

export function fromApiHunt(hunt: ApiHunt): Hunt {
  return {
    ...hunt,
    image: hunt.image ?? undefined,
    steps: (hunt.steps ?? []).map(fromApiStep),
  };
}

export function fromApiParticipant(participant: HuntParticipant): HuntParticipant {
  return participant;
}

export function fromApiAnalytics(analytics: {
  huntId: string;
  participantCount: number;
  completedHuntCount: number;
  steps: Array<{
    stepId: string;
    stepOrder?: number;
    order?: number;
    title: string;
    latitude?: string;
    longitude?: string;
    completionCount: number;
  }>;
  userLocations: Array<{ latitude: string; longitude: string }>;
}): HuntAnalytics {
  return {
    huntId: analytics.huntId,
    participantCount: analytics.participantCount,
    completedHuntCount: analytics.completedHuntCount,
    userLocations: analytics.userLocations,
    steps: analytics.steps.map((step) => ({
      stepId: step.stepId,
      order: step.order ?? step.stepOrder ?? 0,
      title: step.title,
      latitude: step.latitude,
      longitude: step.longitude,
      completionCount: step.completionCount,
    })),
  };
}
