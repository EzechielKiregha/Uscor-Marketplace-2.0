const DEVICE_ID_KEY = "uscor-device-id";

/**
 * Get or create a persistent device identifier.
 * Used to tag offline sales for conflict resolution.
 */
export function getDeviceId(): string {
	if (typeof window === "undefined") return "server";

	let deviceId = localStorage.getItem(DEVICE_ID_KEY);
	if (!deviceId) {
		deviceId = `device-${crypto.randomUUID()}`;
		localStorage.setItem(DEVICE_ID_KEY, deviceId);
	}
	return deviceId;
}
