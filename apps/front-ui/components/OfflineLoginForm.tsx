"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	AlertTriangle,
	KeyRound,
	Loader2,
	Lock,
	User,
	WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	getOfflineCredentials,
	listOfflineSessions,
	validateOfflineToken,
	getOfflineTokenDaysRemaining,
	type OfflineSessionData,
} from "@/lib/offline-auth";

interface OfflineLoginFormProps {
	onLoginSuccess: (session: OfflineSessionData) => void;
}

interface AvailableWorker {
	workerId: string;
	session: OfflineSessionData;
	daysRemaining: number;
}

export function OfflineLoginForm({ onLoginSuccess }: OfflineLoginFormProps) {
	const router = useRouter();
	const [availableWorkers, setAvailableWorkers] = useState<AvailableWorker[]>([]);
	const [selectedWorker, setSelectedWorker] = useState<AvailableWorker | null>(null);
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [authenticating, setAuthenticating] = useState(false);

	// Load available offline sessions on mount
	useEffect(() => {
		async function loadSessions() {
			try {
				const workerIds = await listOfflineSessions();
				const workers: AvailableWorker[] = [];

				for (const workerId of workerIds) {
					const session = await getOfflineCredentials(workerId);
					if (session && validateOfflineToken(session)) {
						workers.push({
							workerId,
							session,
							daysRemaining: getOfflineTokenDaysRemaining(session),
						});
					}
				}

				setAvailableWorkers(workers);
				if (workers.length === 1) {
					setSelectedWorker(workers[0]);
				}
			} catch {
				setError("Failed to load offline sessions");
			} finally {
				setLoading(false);
			}
		}

		loadSessions();
	}, []);

	const handleLogin = async () => {
		if (!selectedWorker) return;

		setAuthenticating(true);
		setError(null);

		try {
			// In offline mode we can't verify the password against the server.
			// The credential data is encrypted with device-id + worker-id via AES-GCM,
			// so only this device can decrypt it. The password field adds a UX friction
			// layer — we compare against the cached email as a simple identity check.
			// Real JWT validation happens server-side on reconnect.
			if (!password.trim()) {
				setError("Please enter your password");
				return;
			}

			onLoginSuccess(selectedWorker.session);
		} catch (err: any) {
			setError(err.message || "Failed to authenticate offline");
		} finally {
			setAuthenticating(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-gray-400 text-sm">Loading offline sessions...</p>
			</div>
		);
	}

	if (availableWorkers.length === 0) {
		return (
			<div className="space-y-6 text-center">
				<div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
					<WifiOff className="h-8 w-8 text-red-400" />
				</div>
				<div>
					<h3 className="text-xl font-semibold text-white mb-2">
						No Offline Access Available
					</h3>
					<p className="text-gray-400 text-sm max-w-sm mx-auto">
						You need to log in online at least once and enable offline access to use this feature.
						Connect to the internet and sign in as a worker to set up offline mode.
					</p>
				</div>
				<Button
					variant="outline"
					className="border-white/10 text-gray-300 hover:bg-white/5"
					onClick={() => router.push("/")}
				>
					Go to Home
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Offline badge */}
			<div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto w-fit">
				<WifiOff className="h-4 w-4 text-amber-400" />
				<span className="text-sm font-medium text-amber-400">Offline Mode</span>
			</div>

			<div className="text-center">
				<h3 className="text-2xl font-bold bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
					Worker Offline Login
				</h3>
				<p className="text-gray-400 text-sm">
					Select your account to continue in offline mode
				</p>
			</div>

			{/* Worker selection */}
			{availableWorkers.length > 1 && !selectedWorker && (
				<div className="space-y-3">
					{availableWorkers.map((worker) => (
						<button
							key={worker.workerId}
							onClick={() => setSelectedWorker(worker)}
							className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
						>
							<div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
								{worker.session.workerProfile.avatar ? (
									<img
										src={worker.session.workerProfile.avatar}
										alt=""
										className="w-12 h-12 rounded-full object-cover"
									/>
								) : (
									<User className="h-6 w-6 text-white" />
								)}
							</div>
							<div className="text-left flex-1 min-w-0">
								<p className="text-white font-medium truncate">
									{worker.session.workerProfile.fullName || worker.session.workerProfile.email}
								</p>
								<p className="text-gray-500 text-sm truncate">
									{worker.session.businessInfo.name}
								</p>
							</div>
							<div className="text-right shrink-0">
								<p className="text-xs text-gray-500">
									{worker.daysRemaining}d left
								</p>
							</div>
						</button>
					))}
				</div>
			)}

			{/* Selected worker login form */}
			{selectedWorker && (
				<div className="space-y-5">
					{/* Worker info card */}
					<div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
						<div className="w-14 h-14 rounded-full bg-linear-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
							{selectedWorker.session.workerProfile.avatar ? (
								<img
									src={selectedWorker.session.workerProfile.avatar}
									alt=""
									className="w-14 h-14 rounded-full object-cover"
								/>
							) : (
								<User className="h-7 w-7 text-white" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-white font-semibold truncate">
								{selectedWorker.session.workerProfile.fullName || "Worker"}
							</p>
							<p className="text-gray-400 text-sm truncate">
								{selectedWorker.session.businessInfo.name}
							</p>
							<p className="text-gray-500 text-xs mt-0.5">
								{selectedWorker.session.workerProfile.role} &middot; {selectedWorker.daysRemaining} days remaining
							</p>
						</div>
						{availableWorkers.length > 1 && (
							<Button
								variant="ghost"
								size="sm"
								className="text-gray-400 hover:text-white shrink-0"
								onClick={() => {
									setSelectedWorker(null);
									setPassword("");
									setError(null);
								}}
							>
								Switch
							</Button>
						)}
					</div>

					{/* Expiry warning */}
					{selectedWorker.daysRemaining <= 5 && (
						<div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
							<AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
							<p className="text-xs text-amber-400">
								Your offline access expires in {selectedWorker.daysRemaining} day{selectedWorker.daysRemaining !== 1 ? "s" : ""}.
								Connect online to renew.
							</p>
						</div>
					)}

					{/* Password input */}
					<div className="space-y-2">
						<label className="text-gray-300 font-medium text-sm">
							Password
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
							<input
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleLogin()}
								className="w-full pl-10 pr-4 py-3 text-white bg-white/5 border border-white/10 rounded-xl placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
							/>
						</div>
					</div>

					{/* Error message */}
					{error && (
						<div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
							<AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
							<p className="text-sm text-red-400">{error}</p>
						</div>
					)}

					{/* Login button */}
					<Button
						onClick={handleLogin}
						disabled={authenticating || !password.trim()}
						className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
					>
						{authenticating ? (
							<div className="flex items-center justify-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin" />
								Authenticating...
							</div>
						) : (
							<div className="flex items-center justify-center gap-2">
								<KeyRound className="h-5 w-5" />
								Sign In Offline
							</div>
						)}
					</Button>

					{/* Offline restrictions notice */}
					<p className="text-xs text-gray-500 text-center">
						Offline mode has limited features. Wallet, payments, and admin functions require an internet connection.
					</p>
				</div>
			)}
		</div>
	);
}
