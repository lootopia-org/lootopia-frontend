import type {
  CreateHuntPayload,
  Hunt,
  HuntStep,
  HuntStepType,
  UpdateHuntPayload,
} from '@/types';

interface ApiHuntStep {
  id?: string;
  stepOrder: number;
  title: string;
  description: string;
  type: HuntStepType;
  address?: string;
  clue?: string;
  answer?: string;
  latitude: string;
  longitude: string;
  reward: number;
}

export type ApiHunt = Omit<Hunt, 'steps'> & { steps: ApiHuntStep[] };

function toApiStep(step: Omit<HuntStep, 'id'>): Omit<ApiHuntStep, 'id'> {
  const { order, latitude, longitude, ...rest } = step;
  return {
    ...rest,
    stepOrder: order,
    latitude: String(latitude),
    longitude: String(longitude),
  };
}

function fromApiStep(step: ApiHuntStep): HuntStep {
  const { stepOrder, latitude, longitude, reward, ...rest } = step;
  return {
    ...rest,
    order: stepOrder,
    latitude: String(latitude),
    longitude: String(longitude),
    reward: reward ?? 0,
  };
}

export function toCreateHuntPayload(payload: CreateHuntPayload) {
  return {
    ...payload,
    steps: payload.steps.map(toApiStep),
  };
}

export function toUpdateHuntPayload(payload: UpdateHuntPayload) {
  return {
    ...payload,
    steps: payload.steps?.map((step) => toApiStep(step)),
  };
}

export function fromApiHunt(hunt: ApiHunt): Hunt {
  return {
    ...hunt,
    steps: hunt.steps.map(fromApiStep),
  };
}
