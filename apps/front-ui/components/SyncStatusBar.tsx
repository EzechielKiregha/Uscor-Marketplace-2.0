"use client";

import {
	AlertTriangle,
	CheckCircle2,
	CloudUpload,
	Loader2,
	RefreshCw,
	Wifi,
	WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncStatusBarProps {
	isOnline: boolean;
	pendingCount: number;
	syncStatus: "idle" | "syncing" | "error";
	lastSyncTime: Date | null;
	conflictCount?: number;
	onSyncNow?: () => void;
}

function formatRelativeTime(date: Date | null): string {
	if (!date) return "never";
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 10) return "just now";
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	return `${hours}h ago`;
}

export function SyncStatusBar({
	isOnline,
	pendingCount,
	syncStatus,
	lastSyncTime,
	conflictCount = 0,
	onSyncNow,
}: SyncStatusBarProps) {
	// Fully synced and online
	if (isOnline && pendingCount === 0 && conflictCount === 0 && syncStatus === "idle") {
		return (
			<div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
				<Wifi className="h-4 w-4" />
				<span>Connected</span>
				<CheckCircle2 className="h-3.5 w-3.5" />
				<span className="text-green-600/70 dark:text-green-500/70">All synced</span>
			</div>
		);
	}

	// Offline mode
	if (!isOnline) {
		return (
			<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						<div>
							<p className="font-medium text-amber-800 dark:text-amber-200">
								Offline Mode
							</p>
							<p className="text-sm text-amber-600 dark:text-amber-400">
								Sales continue working
								{pendingCount > 0 &&
									` · ${pendingCount} pending operation${pendingCount !== 1 ? "s" : ""}`}
								{lastSyncTime &&
									` · Last sync ${formatRelativeTime(lastSyncTime)}`}
							</p>
						</div>
					</div>
					{pendingCount > 0 && (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
							{pendingCount} pending
						</span>
					)}
				</div>
			</div>
		);
	}

	// Actively syncing
	if (syncStatus === "syncing") {
		return (
			<div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>
					Syncing {pendingCount} operation{pendingCount !== 1 ? "s" : ""}...
				</span>
			</div>
		);
	}

	// Sync error
	if (syncStatus === "error") {
		return (
			<div className="flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-700 dark:text-red-400">
				<div className="flex items-center gap-2">
					<AlertTriangle className="h-4 w-4" />
					<span>Sync failed · {pendingCount} pending</span>
				</div>
				{onSyncNow && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onSyncNow}
						className="h-7 text-red-700 dark:text-red-400 hover:text-red-800"
					>
						<RefreshCw className="h-3.5 w-3.5 mr-1" />
						Retry
					</Button>
				)}
			</div>
		);
	}

	// Online with pending operations
	if (pendingCount > 0 || conflictCount > 0) {
		return (
			<div className="flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-400">
				<div className="flex items-center gap-2">
					<CloudUpload className="h-4 w-4" />
					<span>
						{pendingCount > 0 &&
							`${pendingCount} pending`}
						{pendingCount > 0 && conflictCount > 0 && " · "}
						{conflictCount > 0 &&
							`${conflictCount} conflict${conflictCount !== 1 ? "s" : ""}`}
					</span>
				</div>
				{onSyncNow && pendingCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onSyncNow}
						className="h-7 text-orange-700 dark:text-orange-400"
					>
						<RefreshCw className="h-3.5 w-3.5 mr-1" />
						Sync now
					</Button>
				)}
			</div>
		);
	}

	return null;
}
