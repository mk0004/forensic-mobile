import { RAILWAY_API_BASE_URL } from '@/constants/railway-api';
import { getToken, removeToken } from '@/lib/auth-storage';

// Registered by the auth context so a 401 anywhere can flip the app back to the
// login screen instead of leaving the user stuck on an "Unauthenticated" error.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public body?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getApiErrorMessage(status: number, errorText: string) {
  let errorMessage = `Server returned ${status}`;

  try {
    const errorJson = JSON.parse(errorText);
    if (Array.isArray(errorJson.detail)) {
      return errorJson.detail
        .map((item: any) => item?.msg || item?.message || JSON.stringify(item))
        .join('\n');
    }
    // Register/login validation envelope: { msg, status, data: { field: [messages] } }.
    if (errorJson.data && typeof errorJson.data === 'object' && !Array.isArray(errorJson.data)) {
      const fieldMessages = Object.values(errorJson.data as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value): value is string => typeof value === 'string');
      if (fieldMessages.length > 0) {
        return errorJson.msg ? `${errorJson.msg}\n${fieldMessages.join('\n')}` : fieldMessages.join('\n');
      }
    }
    return errorJson.error || errorJson.message || errorJson.msg || errorJson.detail || errorMessage;
  } catch {
    return errorText || errorMessage;
  }
}

interface AuthFetchOptions {
  method?: string;
  json?: unknown;
  formData?: FormData;
  auth?: boolean;
}

export async function authFetch<T>(path: string, opts?: AuthFetchOptions): Promise<T> {
  const url = RAILWAY_API_BASE_URL + path;

  const method = opts?.method ?? 'GET';
  const auth = opts?.auth ?? true;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  let body: BodyInit | undefined;
  if (opts?.json !== undefined) {
    // JSON body: set Content-Type explicitly.
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  } else if (opts?.formData !== undefined) {
    // Multipart: never set Content-Type, RN sets the boundary automatically.
    body = opts.formData;
  }

  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { method, headers, body });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401) {
      await removeToken();
      onUnauthorized?.();
    }
    throw new ApiError(getApiErrorMessage(res.status, text), res.status, text);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
