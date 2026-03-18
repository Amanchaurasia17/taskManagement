export const API_URL = 'http://localhost:3001';

export function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token')
  };
}

export function setTokens(access: string, refresh: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let { access, refresh } = getTokens();
  
  if (!access) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('No access token');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${access}`);

  let response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Try refreshing token
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.accessToken, data.refreshToken);
      headers.set('Authorization', `Bearer ${data.accessToken}`);
      response = await fetch(`${API_URL}${url}`, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}
