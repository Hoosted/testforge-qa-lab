import type { ApiErrorResponse } from '@testforge/shared-types';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001/api/v1';

export class ApiClientError extends Error {
  statusCode: number;

  details: string | string[] | undefined;

  constructor(message: string, statusCode: number, details?: string | string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorPayload = (await safeJsonParse<ApiErrorResponse>(response)) ?? null;
    const message = buildErrorMessage(errorPayload, response.status);

    throw new ApiClientError(message, response.status, errorPayload?.message);
  }

  return (await safeJsonParse<TResponse>(response)) as TResponse;
}

async function safeJsonParse<T>(response: Response) {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return null;
  }

  return (await response.json()) as T;
}

function buildErrorMessage(errorPayload: ApiErrorResponse | null, statusCode: number) {
  if (errorPayload?.message) {
    return Array.isArray(errorPayload.message)
      ? errorPayload.message.join(', ')
      : errorPayload.message;
  }

  return statusCode >= 500
    ? 'The server could not process the request.'
    : 'The request could not be completed.';
}
