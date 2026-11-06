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

  // Attach CSRF protection header for state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', inMemoryAccessToken ? inMemoryAccessToken.slice(-16) : 'nexora-csrf-guard');
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

// ==========================================
// Specialized API Services
// ==========================================

export const RegistryApi = {
  list: (params?: { status?: string; channel?: string; severity?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.channel) searchParams.set('channel', params.channel);
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<{
      advertisements: any[];
      total_count: number;
      status_counts: Record<string, number>;
    }>(`/registry${query}`);
  },
  getById: (id: string) => apiRequest<any>(`/registry/${id}`),
  updateStatus: (id: string, status: string, channel?: string) =>
    apiRequest<any>(`/registry/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, channel }),
    }),
};

export const RecallApi = {
  listAlerts: (status = 'ALL') =>
    apiRequest<{ alerts: any[]; total_count: number; counts: Record<string, number> }>(
      `/recall/alerts?status=${status}`
    ),
  getAlertById: (id: string) => apiRequest<any>(`/recall/alerts/${id}`),
  evaluateSweep: () => apiRequest<any>('/recall/evaluate', { method: 'POST' }),
  resolveAlert: (alertId: string, action: string, notes?: string) =>
    apiRequest<any>(`/recall/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),
  simulateSpecChange: () =>
    apiRequest<{ message: string; sweep_result: any }>('/recall/simulate-spec-change', {
      method: 'POST',
    }),
};

export const BrandMemoryApi = {
  query: (category = 'all', searchQuery = '') => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (searchQuery) params.set('search', searchQuery);
    return apiRequest<any[]>(`/reviews/brand-memory/query?${params.toString()}`);
  },
  promoteException: (entryId: string, notes?: string) =>
    apiRequest<any>(`/reviews/brand-memory/${entryId}/promote-exception`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
};

export const AnalyticsApi = {
  getOverview: () => apiRequest<any>('/analytics/overview'),
};

export const AuditApi = {
  listLogs: (action?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    params.set('limit', limit.toString());
    return apiRequest<{ logs: any[]; count: number }>(`/audit/logs?${params.toString()}`);
  },
};
