/**
 * NEXORA Secure API Client
 * Uses credentials: 'include' to transmit secure HttpOnly cookies.
 * Does NOT persist sensitive tokens in localStorage.
 */

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// In-memory token storage (ephemeral, not persisted in localStorage)
let inMemoryAccessToken: string | null = null;

export const setMemoryToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getMemoryToken = () => inMemoryAccessToken;

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach in-memory bearer token if present
  if (inMemoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Includes HttpOnly cookies
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (res.status === 204) {
      return {} as T;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.detail || `API request failed with status ${res.status}`;
      throw new ApiError(res.status, errorMsg, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, err.message || 'Network connection anomaly');
  }
}

