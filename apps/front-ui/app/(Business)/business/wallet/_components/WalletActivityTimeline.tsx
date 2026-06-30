"use client";

import { useQuery } from "@apollo/client";
import {
	ArrowDown,
	ArrowUp,
	Clock,
	RefreshCw,
	Shield,
	TrendingUp,
} from "lucide-react";
import { GET_WALLET_AUDIT_LOGS, GET_WALLET_SECURITY_SUMMARY } from "@/graphql/wallet.gql";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
	REDEEM: { icon: ArrowDown, color: "text-success", label: "Token Redeemed" },
	RELEASE: { icon: ArrowUp, color: "text-warning", label: "Token Released" },
	RECHARGE: { icon: TrendingUp, color: "text-primary", label: "Account Recharge" },
	WITHDRAW: { icon: ArrowDown, color: "text-destructive", label: "Withdrawal" },
	CONVERT: { icon: RefreshCw, color: "text-primary", label: "Token Conversion" },
	TRANSFER: { icon: ArrowUp, color: "text-muted-foreground", label: "Transfer" },
	ADJUSTMENT: { icon: Shield, color: "text-warning", label: "Adjustment" },
};

export default function WalletActivityTimeline() {
	const { data: summaryData, loading: summaryLoading } = useQuery(
		GET_WALLET_SECURITY_SUMMARY,
	);

	const { data: auditData, loading: auditLoading } = useQuery(
		GET_WALLET_AUDIT_LOGS,
		{ variables: { limit: 10 } },
	);

	const summary = summaryData?.walletSecuritySummary;
	const logs = auditData?.walletAuditLogs?.items || [];

	if (summaryLoading || auditLoading) {
		return (
			<div className="bg-card border border-border rounded-lg p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-5 bg-muted rounded w-48" />
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-12 bg-muted rounded" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Security summary */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<div className="bg-card border border-border rounded-lg p-4 card-hover">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
						<Shield className="h-4 w-4" />
						Audit Logs
					</div>
					<p className="text-2xl font-bold">{summary?.totalAuditLogs || 0}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4 card-hover">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
						<Clock className="h-4 w-4" />
						Ledger Entries
					</div>
					<p className="text-2xl font-bold">{summary?.totalLedgerEntries || 0}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4 card-hover">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
						<Shield className="h-4 w-4 text-success" />
						Security Status
					</div>
					<p className="text-sm font-medium text-success">All transactions secured</p>
				</div>
			</div>

			{/* Timeline */}
			<div className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="p-4 bg-muted border-b border-border flex items-center gap-2">
					<Shield className="h-4 w-4 text-primary" />
					<h3 className="font-semibold">Wallet Activity Timeline</h3>
				</div>

				{logs.length === 0 ? (
					<div className="p-8 text-center">
						<Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
						<p className="text-muted-foreground">No wallet activity yet</p>
						<p className="text-sm text-muted-foreground mt-1">
							All wallet operations will be logged here for security.
						</p>
					</div>
				) : (
					<MotionStagger className="divide-y divide-border">
						{logs.map((log: any) => {
							const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.ADJUSTMENT;
							const Icon = config.icon;
							const change = log.balanceAfter - log.balanceBefore;

							return (
								<MotionStaggerItem key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-3">
										<div className={`w-9 h-9 rounded-full bg-muted flex items-center justify-center ${config.color}`}>
											<Icon className="h-4 w-4" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm">{config.label}</p>
											<p className="text-xs text-muted-foreground">
												{new Date(log.createdAt).toLocaleString()}
											</p>
										</div>
										<div className="text-right">
											<p className={`text-sm font-medium ${change >= 0 ? "text-success" : "text-destructive"}`}>
												{change >= 0 ? "+" : ""}{change.toFixed(2)}
											</p>
											<p className="text-xs text-muted-foreground">
												Bal: {log.balanceAfter.toFixed(2)}
											</p>
										</div>
									</div>
								</MotionStaggerItem>
							);
						})}
					</MotionStagger>
				)}
			</div>
		</div>
	);
}
