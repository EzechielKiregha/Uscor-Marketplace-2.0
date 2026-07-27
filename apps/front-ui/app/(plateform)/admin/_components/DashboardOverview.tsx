// app/admin/_components/DashboardOverview.tsx
"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    BarChart,
    BriefcaseBusiness,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    MapPin,
    ShieldCheck,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";
import { useState } from "react";

interface DashboardOverviewProps {
	metrics: any;
	settings: any;
}

export default function DashboardOverview({
	metrics,
	settings,
}: DashboardOverviewProps) {
	const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d");
	const { showToast } = useToast();

	const getChartData = (period: string) => {
		if (!metrics) return [];

		switch (period) {
			case "24h":
				return metrics.last24Hours || [];
			case "7d":
				return metrics.last7Days || [];
			case "30d":
				return metrics.last30Days || [];
			default:
				return [];
		}
	};

	const chartData = getChartData(timeframe);

	const handleExportData = () => {
		showToast(
			"info",
			"Coming Soon",
			"Data export functionality is under development.",
		);
	};

	return (
		<div className="space-y-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-card border hover:border-primary  rounded-lg p-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
							<Users className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Users</p>
							<p className="text-stat">
								{metrics?.totalUsers.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-card border hover:border-primary  rounded-lg p-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
							<Building2 className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Businesses</p>
							<p className="text-stat">
								{metrics?.totalBusinesses.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-card border hover:border-primary  rounded-lg p-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
							<ShoppingCart className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Products</p>
							<p className="text-stat">
								{metrics?.totalProducts.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-card border hover:border-primary  rounded-lg p-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
							<BriefcaseBusiness className="h-5 w-5" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Services</p>
							<p className="text-stat">
								{metrics?.totalServices.toLocaleString()}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Platform Health */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="md:col-span-2 bg-card border hover:border-primary  rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-lg font-bold">Platform Activity</h2>
							<p className="text-sm text-muted-foreground mt-1">
								Transactions and user activity over time
							</p>
						</div>

						<div className="flex gap-2">
							<Button
								variant={timeframe === "24h" ? "default" : "outline"}
								size="sm"
								onClick={() => setTimeframe("24h")}
							>
								24h
							</Button>
							<Button
								variant={timeframe === "7d" ? "default" : "outline"}
								size="sm"
								onClick={() => setTimeframe("7d")}
							>
								7d
							</Button>
							<Button
								variant={timeframe === "30d" ? "default" : "outline"}
								size="sm"
								onClick={() => setTimeframe("30d")}
							>
								30d
							</Button>
						</div>
					</div>

					<div className="p-4 h-64 relative">
						{/* Simple chart visualization */}
						<div className="w-full h-full flex items-end gap-1">
							{chartData.map((item: any, index: number) => (
								<div
									key={index}
									className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
									style={{
										height: `${Math.min((item.count / Math.max(...chartData.map((d: any) => d.count))) * 100, 100)}%`,
									}}
									title={`${item.date}: ${item.count} transactions`}
								></div>
							))}
						</div>

						{/* Chart labels */}
						<div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-muted-foreground">
							{chartData.map(
								(item: any, index: number) =>
									index % Math.max(1, Math.floor(chartData.length / 5)) ===
										0 && (
										<span key={index}>
											{timeframe === "24h"
												? `${new Date(item.date).getHours()}:00`
												: new Date(item.date).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})}
										</span>
									),
							)}
						</div>
					</div>

					<div className="p-4 bg-muted border-t border-border flex justify-between items-center">
						<div className="flex items-center gap-4">
							<div className="text-center">
								<p className="text-sm text-muted-foreground">
									Total Transactions
								</p>
								<p className="font-bold">
									{metrics?.totalTransactions.toLocaleString()}
								</p>
							</div>
							<div className="text-center">
								<p className="text-sm text-muted-foreground">
									Avg. Transaction Value
								</p>
								<p className="font-bold">
									${metrics?.averageTransactionValue.toFixed(2)}
								</p>
							</div>
							<div className="text-center">
								<p className="text-sm text-muted-foreground">Platform Fees</p>
								<p className="font-bold">
									${metrics?.platformFeesCollected.toFixed(2)}
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleExportData}
						>
							<BarChart className="h-4 w-4 mr-2" />
							Export Data
						</Button>
					</div>
				</div>

				<div className="bg-card border hover:border-primary  rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border">
						<h2 className="text-lg font-bold">System Health</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Current platform status and metrics
						</p>
					</div>

					<div className="p-4 space-y-4">
						<div className="text-center py-8">
							<ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								System health monitoring is not yet configured.
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Connect a monitoring service to display real-time metrics.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Platform Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="md:col-span-2 bg-card border hover:border-primary  rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border">
						<h2 className="text-lg font-bold">Business Verification Status</h2>
					</div>

					<div className="p-4">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
							<div className="text-center p-3 bg-muted rounded-lg">
								<div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2 text-success">
									<ShieldCheck className="h-6 w-6" />
								</div>
								<p className="font-bold text-xl">{metrics?.kycVerifiedCount}</p>
								<p className="text-sm text-muted-foreground">Verified</p>
							</div>

							<div className="text-center p-3 bg-muted rounded-lg">
								<div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2 text-warning">
									<Clock className="h-6 w-6" />
								</div>
								<p className="font-bold text-xl">{metrics?.kycPendingCount}</p>
								<p className="text-sm text-muted-foreground">Pending</p>
							</div>

							<div className="text-center p-3 bg-muted rounded-lg">
								<div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2 text-destructive">
									<AlertTriangle className="h-6 w-6" />
								</div>
								<p className="font-bold text-xl">{metrics?.kycRejectedCount}</p>
								<p className="text-sm text-muted-foreground">Rejected</p>
							</div>
						</div>

						<div className="h-48">
							{/* Map visualization would go here */}
							<div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
								<div className="text-center">
									<MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
									<p className="text-sm text-muted-foreground">
										Business Distribution Map
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-card border hover:border-primary  rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border">
						<h2 className="text-lg font-bold">Recent Disputes</h2>
					</div>

					<div className="p-4 text-center py-8">
						<AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">
							No disputes to display.
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Disputes will appear here when reported by users.
						</p>
					</div>
				</div>
			</div>

			{/* Platform Settings Summary */}
			<div className="bg-card border hover:border-primary  rounded-lg overflow-hidden">
				<div className="p-4 bg-muted border-b border-border">
					<h2 className="text-lg font-bold">Platform Configuration</h2>
				</div>

				<div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<h3 className="font-semibold mb-2 flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							Transaction Fees
						</h3>
						<p className="text-sm text-muted-foreground mb-1">
							Current Platform Fee:{" "}
							<span className="font-medium">
								{settings?.platformFeePercentage}%
							</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Minimum Transaction:{" "}
							<span className="font-medium">
								${settings?.minTransactionAmount}
							</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Maximum Transaction:{" "}
							<span className="font-medium">
								${settings?.maxTransactionAmount}
							</span>
						</p>
					</div>

					<div>
						<h3 className="font-semibold mb-2 flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							USCOR Token
						</h3>
						<p className="text-sm text-muted-foreground mb-1">
							Current Value:{" "}
							<span className="font-medium">
								1 uTn = ${settings?.tokenValue}
							</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Token Symbol:{" "}
							<span className="font-medium">{settings?.tokenSymbol}</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Token Name: <span className="font-medium">USCOR Token</span>
						</p>
					</div>

					<div>
						<h3 className="font-semibold mb-2 flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Platform Rules
						</h3>
						<p className="text-sm text-muted-foreground mb-1">
							KYC Required:{" "}
							<span className="font-medium">
								{settings?.kycRequired ? "Yes" : "No"}
							</span>
						</p>
						<p className="text-sm text-muted-foreground">
							B2B Enabled:{" "}
							<span className="font-medium">
								{settings?.b2bEnabled ? "Yes" : "No"}
							</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Marketplace:{" "}
							<span className="font-medium">
								{settings?.marketplaceEnabled ? "Active" : "Disabled"}
							</span>
						</p>
					</div>
				</div>

				<div className="p-4 bg-muted border-t border-border flex justify-end">
					<Button
						variant="outline"
						onClick={() => (window.location.href = "/admin/settings")}
					>
						Configure Platform Settings
					</Button>
				</div>
			</div>
		</div>
	);
}
