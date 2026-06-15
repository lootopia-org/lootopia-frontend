import { getAuthToken, ApiRequestError, parseApiErrorMessage } from '@/lib/api/client';
import { getApiBaseUrl } from '@/lib/utils';

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
    const message = await parseApiErrorMessage(
      response,
      `Upload failed (${response.status})`
    );
    throw new ApiRequestError(message, response.status);
  }

  return (await response.json()) as { url: string; key?: string };
}
