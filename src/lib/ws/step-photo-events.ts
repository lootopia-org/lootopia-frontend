type StepPhotoListener = (payload: import('@/lib/api/step-photo-sessions').StepPhotoCapturedPayload) => void;

const listeners = new Set<StepPhotoListener>();

export function subscribeStepPhotoCaptured(listener: StepPhotoListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitStepPhotoCaptured(
  payload: import('@/lib/api/step-photo-sessions').StepPhotoCapturedPayload
): void {
  listeners.forEach((listener) => listener(payload));
}
