"use client";

import { useState } from "react";
import {
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	Clock,
	CloudOff,
	LogOut,
	RefreshCw,
	Shield,
	Wifi,
	WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfflineSessionData } from "@/lib/offline-auth";
import { getOfflineTokenDaysRemaining } from "@/lib/offline-auth";

interface OfflineWorkerBannerProps {
	session: OfflineSessionData;
	isOnline: boolean;
	pendingCount?: number;
	lastSyncTime?: Date | null;
	onReconnect?: () => void;
	onLogout?: () => void;
}

export function OfflineWorkerBanner({
	session,
	isOnline,
	pendingCount = 0,
	lastSyncTime,
	onReconnect,
	onLogout,
}: OfflineWorkerBannerProps) {
	const [expanded, setExpanded] = useState(false);
	const daysRemaining = getOfflineTokenDaysRemaining(session);
	const isExpiringSoon = daysRemaining <= 5;

	const formatLastSync = (date: Date | null | undefined) => {
		if (!date) return "Never";
		const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
		if (seconds < 60) return "Just now";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	};

	return (
		<div className="border-b border-amber-500/20 bg-amber-500/5">
			{/* Compact bar */}
			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-1.5">
						{isOnline ? (
							<Wifi className="h-4 w-4 text-green-400" />
						) : (
							<WifiOff className="h-4 w-4 text-amber-400" />
						)}
						<span className="text-sm font-medium text-amber-400">
							Offline Worker Mode
						</span>
					</div>

					<span className="hidden sm:inline text-xs text-gray-500">|</span>

					<span className="hidden sm:inline text-xs text-gray-400">
						{session.workerProfile.fullName || session.workerProfile.email}
					</span>

					{pendingCount > 0 && (
						<>
							<span className="hidden sm:inline text-xs text-gray-500">|</span>
							<span className="text-xs text-amber-400 font-medium">
								{pendingCount} pending sync
							</span>
						</>
					)}

					{isExpiringSoon && (
						<>
							<span className="hidden sm:inline text-xs text-gray-500">|</span>
							<span className="text-xs text-red-400 font-medium flex items-center gap-1">
								<AlertTriangle className="h-3 w-3" />
								{daysRemaining}d left
							</span>
						</>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isOnline && onReconnect && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
							onClick={onReconnect}
						>
							<RefreshCw className="h-3.5 w-3.5 mr-1" />
							Sync & Reconnect
						</Button>
					)}
					<button
						onClick={() => setExpanded(!expanded)}
						className="text-gray-400 hover:text-white transition-colors p-1"
					>
						{expanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			{/* Expanded details */}
			{expanded && (
				<div className="px-4 pb-3 space-y-3 border-t border-amber-500/10">
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
						{/* Worker info */}
						<div className="space-y-1">
							<p className="text-xs text-gray-500 flex items-center gap-1">
								<Shield className="h-3 w-3" /> Worker
							</p>
							<p className="text-sm text-white font-medium truncate">
								{session.workerProfile.fullName || session.workerProfile.email}
							</p>
							<p className="text-xs text-gray-400 truncate">
								{session.workerProfile.role}
							</p>
						</div>

						{/* Business info */}
						<div className="space-y-1">
							<p className="text-xs text-gray-500 flex items-center gap-1">
								<CloudOff className="h-3 w-3" /> Business
							</p>
							<p className="text-sm text-white font-medium truncate">
								{session.businessInfo.name}
							</p>
							<p className="text-xs text-gray-400">
								{session.businessInfo.storeNames.length} store{session.businessInfo.storeNames.length !== 1 ? "s" : ""}
							</p>
						</div>

						{/* Session info */}
						<div className="space-y-1">
							<p className="text-xs text-gray-500 flex items-center gap-1">
								<Clock className="h-3 w-3" /> Session
							</p>
							<p className="text-sm text-white font-medium">
								{daysRemaining} days remaining
							</p>
							<p className="text-xs text-gray-400">
								Last sync: {formatLastSync(lastSyncTime)}
							</p>
						</div>

						{/* Pending sync */}
						<div className="space-y-1">
							<p className="text-xs text-gray-500 flex items-center gap-1">
								<RefreshCw className="h-3 w-3" /> Sync Status
							</p>
							<p className="text-sm font-medium">
								{pendingCount > 0 ? (
									<span className="text-amber-400">{pendingCount} queued</span>
								) : (
									<span className="text-green-400">All synced</span>
								)}
							</p>
							<p className="text-xs text-gray-400">
								{session.permissions.length} permissions active
							</p>
						</div>
					</div>

					{/* Allowed stores */}
					{session.businessInfo.storeNames.length > 0 && (
						<div className="pt-2 border-t border-white/5">
							<p className="text-xs text-gray-500 mb-1.5">Authorized Stores:</p>
							<div className="flex flex-wrap gap-1.5">
								{session.businessInfo.storeNames.map((name, i) => (
									<span
										key={session.businessInfo.storeIds[i]}
										className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
									>
										{name}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
						{onLogout && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
								onClick={onLogout}
							>
								<LogOut className="h-3.5 w-3.5 mr-1" />
								End Offline Session
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
