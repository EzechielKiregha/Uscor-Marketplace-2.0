"use client";

import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { REQUEST_OFFLINE_ACCESS } from "@/graphql/auth.gql";
import { getDeviceId } from "@/lib/device-id";
import {
	cacheWorkerCredentials,
	clearOfflineCredentials,
	getOfflineCredentials,
	getOfflineTokenDaysRemaining,
	type OfflineSessionData,
	validateOfflineToken,
} from "@/lib/offline-auth";

interface UseOfflineAuthReturn {
	/** Whether we're currently in offline mode */
	isOffline: boolean;
	/** Whether the worker has an active offline session */
	isOfflineAuthenticated: boolean;
	/** The current offline session data (decrypted) */
	offlineSession: OfflineSessionData | null;
	/** Days remaining on the offline token */
	daysRemaining: number;
	/** Loading state */
	loading: boolean;
	/** Error message */
	error: string | null;
	/** Request offline access from the server (must be online + authenticated) */
	requestOfflineAccess: (deviceName?: string) => Promise<boolean>;
	/** Log in using cached offline credentials */
	loginOffline: (workerId: string) => Promise<boolean>;
	/** Clear offline session (logout) */
	logoutOffline: () => Promise<void>;
	/** Refresh offline session status from IndexedDB */
	refreshStatus: () => Promise<void>;
}

export function useOfflineAuth(workerId?: string): UseOfflineAuthReturn {
	const [isOffline, setIsOffline] = useState(false);
	const [offlineSession, setOfflineSession] = useState<OfflineSessionData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [requestOfflineAccessMutation] = useMutation(REQUEST_OFFLINE_ACCESS);

	// Track online/offline status
	useEffect(() => {
		const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
		updateOnlineStatus();

		window.addEventListener("online", updateOnlineStatus);
		window.addEventListener("offline", updateOnlineStatus);
		return () => {
			window.removeEventListener("online", updateOnlineStatus);
			window.removeEventListener("offline", updateOnlineStatus);
		};
	}, []);

	// Load cached session on mount
	const refreshStatus = useCallback(async () => {
		if (!workerId) return;
		try {
			const session = await getOfflineCredentials(workerId);
			if (session && validateOfflineToken(session)) {
				setOfflineSession(session);
			} else {
				setOfflineSession(null);
				if (session) {
					// Token expired — clean up
					await clearOfflineCredentials(workerId);
				}
			}
		} catch {
			setOfflineSession(null);
		}
	}, [workerId]);

	useEffect(() => {
		refreshStatus();
	}, [refreshStatus]);

	// Request offline access from server (online + authenticated)
	const requestOfflineAccess = useCallback(
		async (deviceName?: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const deviceId = getDeviceId();
				const { data } = await requestOfflineAccessMutation({
					variables: {
						input: { deviceId, deviceName },
					},
				});

				if (!data?.requestOfflineAccess) {
					throw new Error("Failed to get offline access");
				}

				const payload = data.requestOfflineAccess;
				const sessionData: OfflineSessionData = {
					offlineToken: payload.offlineToken,
					expiresAt: payload.expiresAt,
					permissions: payload.permissions,
					workerProfile: payload.workerProfile,
					businessInfo: payload.businessInfo,
					cachedAt: new Date().toISOString(),
				};

				await cacheWorkerCredentials(sessionData);
				setOfflineSession(sessionData);
				return true;
			} catch (err: any) {
				setError(err.message || "Failed to request offline access");
				return false;
			} finally {
				setLoading(false);
			}
		},
		[requestOfflineAccessMutation],
	);

	// Log in using cached offline credentials
	const loginOffline = useCallback(
		async (targetWorkerId: string): Promise<boolean> => {
			setLoading(true);
			setError(null);
			try {
				const session = await getOfflineCredentials(targetWorkerId);
				if (!session) {
					setError("No offline credentials found. Please log in online first to enable offline mode.");
					return false;
				}

				if (!validateOfflineToken(session)) {
					setError("Offline session expired. Please connect to the internet and log in to renew.");
					await clearOfflineCredentials(targetWorkerId);
					return false;
				}

				setOfflineSession(session);
				return true;
			} catch (err: any) {
				setError(err.message || "Failed to authenticate offline");
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Logout — clear offline session
	const logoutOffline = useCallback(async () => {
		if (offlineSession) {
			await clearOfflineCredentials(offlineSession.workerProfile.id);
		}
		setOfflineSession(null);
		setError(null);
	}, [offlineSession]);

	const isOfflineAuthenticated = !!offlineSession && validateOfflineToken(offlineSession);
	const daysRemaining = offlineSession ? getOfflineTokenDaysRemaining(offlineSession) : 0;

	return {
		isOffline,
		isOfflineAuthenticated,
		offlineSession,
		daysRemaining,
		loading,
		error,
		requestOfflineAccess,
		loginOffline,
		logoutOffline,
		refreshStatus,
	};
}
