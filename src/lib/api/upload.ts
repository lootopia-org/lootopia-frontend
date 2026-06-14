import { getAuthToken, ApiRequestError } from '@/lib/api/client';
import { getApiBaseUrl } from '@/lib/utils';
import type { ApiError } from '@/types';

export async function apiUploadFile(
  path: string,
  file: File,
  options?: { fieldName?: string; kind?: 'hunt' | 'step' | 'avatar' }
): Promise<{ url: string; key?: string }> {
  const formData = new FormData();
  formData.append(options?.fieldName ?? 'file', file);

  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const uploadPath =
    options?.kind === 'avatar'
      ? '/upload/avatar'
      : path.startsWith('/')
        ? path
        : `/${path}`;
  const query =
    options?.kind && options.kind !== 'avatar' ? `?kind=${options.kind}` : '';
  const url = `${getApiBaseUrl()}${uploadPath}${query}`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorBody: ApiError | null = null;
    try {
      errorBody = (await response.json()) as ApiError;
    } catch {
      // ignore
    }
    throw new ApiRequestError(
      errorBody?.message || `Upload failed (${response.status})`,
      response.status,
      errorBody?.code
    );
  }

  return (await response.json()) as { url: string; key?: string };
}
