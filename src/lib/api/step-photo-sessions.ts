import { apiRequest } from '@/lib/api/client';
import { normalizeImageReference } from '@/lib/image-utils';
export {
  getCaptureConfig,
  getCaptureConfigForSession,
  getMobileCaptureLinkTemplate,
  getWebBaseUrl,
  mobileCaptureDeepLink,
  mobileCaptureQrUrl,
  mobileCaptureUrl,
} from '@/lib/capture-config';

export type StepPhotoSession = {
  sessionId: string;
  stepKey: string;
  huntId?: string;
  photoUrl?: string;
  status: 'pending' | 'completed';
};

function normalizeStepPhotoSession(raw: Record<string, unknown>): StepPhotoSession {
  const photoUrl = normalizeImageReference(
    (raw.photoUrl ?? raw.photo_url) as string | undefined
  );
  return {
    sessionId: String(raw.sessionId ?? raw.session_id ?? ''),
    stepKey: String(raw.stepKey ?? raw.step_key ?? ''),
    huntId: (raw.huntId ?? raw.hunt_id) as string | undefined,
    photoUrl,
    status: (raw.status === 'completed' ? 'completed' : 'pending') as StepPhotoSession['status'],
  };
}

export const stepPhotoSessionApi = {
  create: async (stepKey: string, huntId?: string) => {
    const raw = await apiRequest<Record<string, unknown>>('/hunt/step-photo-sessions', {
      method: 'POST',
      body: { stepKey, huntId },
    });
    return normalizeStepPhotoSession(raw);
  },

  get: async (sessionId: string) => {
    const raw = await apiRequest<Record<string, unknown>>(
      `/hunt/step-photo-sessions/${sessionId}`
    );
    return normalizeStepPhotoSession(raw);
  },
};

export type StepPhotoCapturedPayload = {
  sessionId: string;
  stepKey: string;
  photoUrl: string;
  huntId?: string;
  partnerId?: string;
};

export function isStepPhotoCapturedEvent(
  event: unknown
): event is { eventType: string; payload: StepPhotoCapturedPayload } {
  if (!event || typeof event !== 'object') {
    return false;
  }
  const record = event as {
    eventType?: string;
    payload?: Record<string, unknown>;
  };
  const payload = record.payload;
  const photoUrl = payload?.photoUrl ?? payload?.photo_url;
  const sessionId = payload?.sessionId ?? payload?.session_id;
  return (
    record.eventType === 'hunt_steps.photo_captured' &&
    typeof sessionId === 'string' &&
    typeof photoUrl === 'string'
  );
}

export function parseStepPhotoCapturedPayload(
  payload: Record<string, unknown>
): StepPhotoCapturedPayload {
  return {
    sessionId: String(payload.sessionId ?? payload.session_id),
    stepKey: String(payload.stepKey ?? payload.step_key ?? ''),
    photoUrl: normalizeImageReference(String(payload.photoUrl ?? payload.photo_url)) ?? '',
    huntId: (payload.huntId ?? payload.hunt_id) as string | undefined,
    partnerId: (payload.partnerId ?? payload.partner_id) as string | undefined,
  };
}

export type CaptureConfig = {
  webBaseUrl: string;
  mobileCaptureLinkTemplate: string;
  useDirectExpoQr: boolean;
};

export type CaptureSessionConfig = CaptureConfig & {
  qrUrl: string;
  deepLink: string;
  webFallbackUrl: string;
};

export async function fetchCaptureConfig(sessionId?: string): Promise<CaptureSessionConfig | CaptureConfig> {
  const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  const response = await fetch(`/api/capture-config${query}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Could not load capture configuration');
  }
  return response.json() as Promise<CaptureSessionConfig | CaptureConfig>;
}
