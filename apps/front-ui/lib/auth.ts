import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  role: 'client' | 'business' | 'worker';
  id: string;
  email: string;
  isVerified: boolean;
}

export const setAuthToken = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || undefined;
  }
  return undefined;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken') || undefined;
  }
  return undefined;
};

export const getUserRole = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
};

export const getUserId = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id;
  } catch {
    return null;
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
  }
};

export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');
    const { accessToken } = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
    }
    return accessToken;
  } catch (error) {
    logout();
    throw error;
  }
};