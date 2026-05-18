const API_BASE = '/api';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  
  if (res.status === 204) {
    return undefined as T;
  }
  
  return res.json();
}
