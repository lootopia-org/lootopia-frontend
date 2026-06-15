import Cookies from 'js-cookie';
import { getApiBaseUrl } from '@/lib/utils';
import type { ApiError } from '@/types';

const TOKEN_KEY = 'authToken';
const SESSION_KEY = 'session';

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

function cookieOptions() {
  return {
    expires: 7,
    sameSite: 'lax' as const,
    secure:
      typeof window !== 'undefined' && window.location.protocol === 'https:',
  };
}

export function getAuthToken(): string | undefined {
  return Cookies.get(SESSION_KEY) || Cookies.get(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  const options = cookieOptions();
  Cookies.set(SESSION_KEY, token, options);
  Cookies.set(TOKEN_KEY, token, options);
}

export function clearAuthToken(): void {
  Cookies.remove(SESSION_KEY);
  Cookies.remove(TOKEN_KEY);
}

export async function parseApiErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const text = await response.text();
  if (!text) return fallback;

  try {
    const body = JSON.parse(text) as ApiError;
    return body.message || text;
  } catch {
    return text;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  noAuth?: boolean;
  skipAuthRedirect?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    auth = true,
    noAuth = false,
    skipAuthRedirect = false,
    headers,
    ...rest
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth && !noAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const fallback =
      response.status === 401 ? 'Unauthorized' : `Request failed (${response.status})`;
    const message = await parseApiErrorMessage(response, fallback);

    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '';
    const isAuthAttempt = pathname.startsWith('/auth');

    if (
      response.status === 401 &&
      auth &&
      !skipAuthRedirect &&
      !isAuthAttempt &&
      typeof window !== 'undefined'
    ) {
      clearAuthToken();
      unauthorizedHandler?.();
    }

    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
