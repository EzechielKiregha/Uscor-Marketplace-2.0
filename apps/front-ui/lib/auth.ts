import { jwtDecode } from "jwt-decode";
import { type OfflineSessionData } from "./offline-auth";

export interface JwtPayload {
  role: "client" | "business" | "worker" | "admin";
  id: string;
  email: string;
  isVerified: boolean;
}

// ─── Offline session stored in memory during an active offline session ───
let _activeOfflineSession: OfflineSessionData | null = null;

export function setActiveOfflineSession(session: OfflineSessionData | null) {
  _activeOfflineSession = session;
  if (session) {
    if (typeof window !== "undefined") {
      localStorage.setItem("uscor-offline-mode", "true");
      localStorage.setItem("uscor-offline-worker-id", session.workerProfile.id);
    }
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem("uscor-offline-mode");
      localStorage.removeItem("uscor-offline-worker-id");
    }
  }
}

export function getActiveOfflineSession(): OfflineSessionData | null {
  return _activeOfflineSession;
}

export const setAuthToken = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || undefined;
  }
  return undefined;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken") || undefined;
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
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  }
};

export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Invalid Role");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) throw new Error("Token refresh failed");
    const { accessToken } = await response.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
    }
    return accessToken;
  } catch (error) {
    logout();
    throw error;
  }
};

// ─── Offline Mode Helpers ────────────────────────────────────────

/**
 * Check if we're currently in offline mode (worker offline session active).
 */
export function isOfflineMode(): boolean {
  if (_activeOfflineSession) return true;
  if (typeof window !== "undefined") {
    return localStorage.getItem("uscor-offline-mode") === "true";
  }
  return false;
}

/**
 * Get the effective auth token — returns the offline token if in offline mode,
 * otherwise the standard access token.
 */
export function getEffectiveToken(): string | undefined {
  if (_activeOfflineSession) {
    return _activeOfflineSession.offlineToken;
  }
  return getAccessToken();
}

/**
 * Get the effective permission list.
 * In offline mode, returns the restricted offline permissions.
 * In online mode, returns null (meaning full permissions for the role).
 */
export function getEffectivePermissions(): string[] | null {
  if (_activeOfflineSession) {
    return _activeOfflineSession.permissions;
  }
  return null;
}
