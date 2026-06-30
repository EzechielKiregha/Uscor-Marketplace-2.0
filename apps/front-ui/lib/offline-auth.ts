/**
 * Offline Auth Manager — encrypted credential caching for worker offline login.
 *
 * Uses Web Crypto API:
 *  - PBKDF2 to derive an encryption key from deviceId + workerId
 *  - AES-GCM to encrypt/decrypt the offline session data
 *
 * Data is stored in IndexedDB `offlineSession` store (v3).
 */

import { getDeviceId } from "./device-id";
import {
	getFromIndexedDB,
	initDB,
	removeFromIndexedDB,
	saveToIndexedDB,
} from "./indexed-db";

// ─── Permission Constants ────────────────────────────────────────

/** Permissions available to offline workers */
export const OFFLINE_PERMISSIONS = [
	"pos:create_sale",
	"pos:complete_sale",
	"pos:void_sale",
	"inventory:view",
	"inventory:update_stock",
	"sales:view",
	"receipts:generate",
	"customers:view",
	"customers:lookup",
	"returns:create",
	"shifts:start",
	"shifts:end",
	"shifts:view",
	"queue:manage",
] as const;

/** Features restricted while offline */
export const RESTRICTED_OFFLINE = [
	"wallet:*",
	"subscriptions:*",
	"admin:*",
	"payments:online",
	"kyc:*",
	"business:setup",
	"account:convert",
	"settings:system",
] as const;

export type OfflinePermission = (typeof OFFLINE_PERMISSIONS)[number];

// ─── Types ───────────────────────────────────────────────────────

export interface OfflineWorkerProfile {
	id: string;
	email: string;
	fullName?: string;
	avatar?: string;
	role: string;
}

export interface OfflineBusinessInfo {
	id: string;
	name: string;
	businessType?: string;
	storeIds: string[];
	storeNames: string[];
}

export interface OfflineSessionData {
	offlineToken: string;
	expiresAt: string; // ISO date string
	permissions: string[];
	workerProfile: OfflineWorkerProfile;
	businessInfo: OfflineBusinessInfo;
	cachedAt: string; // ISO date string
}

interface EncryptedSession {
	workerId: string;
	iv: string; // base64 encoded IV
	data: string; // base64 encoded ciphertext
	salt: string; // base64 encoded PBKDF2 salt
}

// ─── Crypto Helpers ──────────────────────────────────────────────

const STORE_NAME = "offlineSession";
const PBKDF2_ITERATIONS = 100_000;

function toBase64(buffer: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(str: string): ArrayBuffer {
	const binary = atob(str);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * Derive an AES-GCM key from deviceId + workerId using PBKDF2.
 */
async function deriveKey(
	deviceId: string,
	workerId: string,
	salt: ArrayBuffer,
): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(`${deviceId}:${workerId}`),
		"PBKDF2",
		false,
		["deriveKey"],
	);

	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
}

/**
 * Encrypt session data with AES-GCM.
 */
async function encryptData(
	data: string,
	deviceId: string,
	workerId: string,
): Promise<{ iv: string; encrypted: string; salt: string }> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveKey(deviceId, workerId, salt.buffer);

	const encoder = new TextEncoder();
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		encoder.encode(data),
	);

	return {
		iv: toBase64(iv.buffer),
		encrypted: toBase64(ciphertext),
		salt: toBase64(salt.buffer),
	};
}

/**
 * Decrypt session data with AES-GCM.
 */
async function decryptData(
	encrypted: string,
	iv: string,
	salt: string,
	deviceId: string,
	workerId: string,
): Promise<string> {
	const key = await deriveKey(deviceId, workerId, fromBase64(salt));
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: fromBase64(iv) },
		key,
		fromBase64(encrypted),
	);

	return new TextDecoder().decode(decrypted);
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Cache worker credentials encrypted in IndexedDB for offline login.
 * Called after a successful `requestOfflineAccess` mutation.
 */
export async function cacheWorkerCredentials(
	session: OfflineSessionData,
): Promise<void> {
	await initDB();
	const deviceId = getDeviceId();
	const workerId = session.workerProfile.id;

	const plaintext = JSON.stringify(session);
	const { iv, encrypted, salt } = await encryptData(plaintext, deviceId, workerId);

	const record: EncryptedSession = {
		workerId,
		iv,
		data: encrypted,
		salt,
	};

	await saveToIndexedDB(STORE_NAME, record);
}

/**
 * Retrieve and decrypt offline credentials for a worker.
 * Returns null if no cached session or decryption fails.
 */
export async function getOfflineCredentials(
	workerId: string,
): Promise<OfflineSessionData | null> {
	await initDB();
	const record = (await getFromIndexedDB(STORE_NAME, workerId)) as
		| EncryptedSession
		| undefined;

	if (!record) return null;

	try {
		const deviceId = getDeviceId();
		const plaintext = await decryptData(
			record.data,
			record.iv,
			record.salt,
			deviceId,
			workerId,
		);
		return JSON.parse(plaintext) as OfflineSessionData;
	} catch {
		// Decryption failed — wrong device or corrupted data
		return null;
	}
}

/**
 * Validate that an offline token hasn't expired.
 * Does NOT verify the JWT signature (that requires the server secret).
 * Only checks the stored expiry timestamp.
 */
export function validateOfflineToken(session: OfflineSessionData): boolean {
	const expiresAt = new Date(session.expiresAt).getTime();
	return Date.now() < expiresAt;
}

/**
 * Get remaining days until offline token expires.
 */
export function getOfflineTokenDaysRemaining(session: OfflineSessionData): number {
	const expiresAt = new Date(session.expiresAt).getTime();
	const remaining = expiresAt - Date.now();
	return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}

/**
 * Check if a permission is allowed in offline mode.
 */
export function hasOfflinePermission(
	permission: string,
	sessionPermissions: string[],
): boolean {
	return sessionPermissions.includes(permission);
}

/**
 * Check if a feature is restricted while offline.
 */
export function isRestrictedOffline(feature: string): boolean {
	return RESTRICTED_OFFLINE.some((restricted) => {
		if (restricted.endsWith(":*")) {
			return feature.startsWith(restricted.replace(":*", ":"));
		}
		return feature === restricted;
	});
}

/**
 * Clear cached offline credentials for a worker (logout).
 */
export async function clearOfflineCredentials(workerId: string): Promise<void> {
	await initDB();
	await removeFromIndexedDB(STORE_NAME, workerId);
}

/**
 * List all cached offline sessions (for showing available offline accounts).
 * Returns worker IDs only — actual data requires decryption.
 */
export async function listOfflineSessions(): Promise<string[]> {
	await initDB();
	const db = await initDB();
	const keys = await db.getAllKeys(STORE_NAME);
	return keys.map((k) => String(k));
}
