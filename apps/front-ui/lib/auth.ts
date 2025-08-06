import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import {jwtDecode} from 'jwt-decode';

export const setAuthToken = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 }); // 1 day
  setCookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 }); // 7 days
};

export const getAccessToken = () => getCookie('accessToken')?.toString();
export const getRefreshToken = () => getCookie('refreshToken')?.toString();

export const getUserRole = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ role: string }>(token);
    return decoded.role;
  } catch {
    return null;
  }
};

export const logout = () => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch('/api/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error('Token refresh failed');
  const { accessToken } = await response.json();
  setCookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 });
  return accessToken;
};