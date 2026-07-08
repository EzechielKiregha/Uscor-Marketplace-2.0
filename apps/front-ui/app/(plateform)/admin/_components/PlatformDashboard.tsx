"use client";

import {
	Building2,
	Coins,
	CreditCard,
	DollarSign,
	Package,
	ShoppingCart,
	Store,
	TrendingUp,
	UserCheck,
	Users,
	Wrench,
} from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";
import { Button } from "@/components/ui/button";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface PlatformDashboardProps {
	metrics: any;
	settings: any;
}

function formatCurrency(val: number) {
	if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
	if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
	return `$${val.toFixed(2)}`;
}

function formatNumber(val: number) {
	if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
	if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
	return val.toLocaleString();
}

const STAT_CARDS = [
	{ key: "totalUsers", label: "Total Users", icon: Users, color: "bg-primary/10 text-primary" },
	{ key: "totalBusinesses", label: "Businesses", icon: Building2, color: "bg-success/10 text-success" },
	{ key: "totalWorkers", label: "Workers", icon: Wrench, color: "bg-blue-500/10 text-blue-500" },
	{ key: "totalStores", label: "Stores", icon: Store, color: "bg-violet-500/10 text-violet-500" },
	{ key: "totalProducts", label: "Products", icon: Package, color: "bg-amber-500/10 text-amber-500" },
	{ key: "totalOrders", label: "Orders", icon: ShoppingCart, color: "bg-emerald-500/10 text-emerald-500" },
	{ key: "totalTransactions", label: "Transactions", icon: CreditCard, color: "bg-cyan-500/10 text-cyan-500" },
	{ key: "totalSales", label: "POS Sales", icon: DollarSign, color: "bg-rose-500/10 text-rose-500" },
];

const FINANCIAL_CARDS = [
	{ key: "totalRevenue", label: "Total Revenue", format: "currency" },
	{ key: "totalSalesRevenue", label: "POS Revenue", format: "currency" },
	{ key: "totalTokenVolume", label: "Token Volume", format: "currency" },
	{ key: "totalRechargeVolume", label: "Recharge Volume", format: "currency" },
	{ key: "averageTransactionValue", label: "Avg. Transaction", format: "currency" },
	{ key: "platformFeesCollected", label: "Fees Collected", format: "currency" },
];

const ACTIVE_TODAY_CARDS = [
	{ key: "activeUsersToday", label: "Users Today", icon: UserCheck },
	{ key: "activeBusinessesToday", label: "Businesses Today", icon: Building2 },
	{ key: "activeWorkersToday", label: "Workers Today", icon: Wrench },
];

export default function PlatformDashboard({ metrics, settings }: PlatformDashboardProps) {
	const [growthTab, setGrowthTab] = useState<"signups" | "gmv">("signups");

	if (!metrics) return null;

	// Prepare GMV chart data
	const gmvData = (metrics.gmv30d || []).map((d: any) => ({
		date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		gmv: d.amount,
	}));

	// Prepare signup chart data (merge user + business signups)
	const signupData = (metrics.userSignups30d || []).map((d: any, i: number) => ({
		date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		users: d.count,
		businesses: metrics.businessSignups30d?.[i]?.count || 0,
	}));

	// Business type distribution for pie chart
	const typeData = (metrics.businessTypeDistribution || [])
		.filter((d: any) => d.type && d.type !== "NA" && d.type !== "Unknown")
		.slice(0, 8);

	return (
		<div className="space-y-6">
			{/* ── Row 1: Core Stats Grid ────────────────────────────── */}
			<MotionStagger className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{STAT_CARDS.map((card) => (
					<MotionStaggerItem key={card.key}>
						<div className="bg-card border border-border rounded-lg p-4 card-hover">
							<div className="flex items-center gap-3">
								<div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}>
									<card.icon className="h-5 w-5" />
								</div>
								<div>
									<p className="text-stat-label">{card.label}</p>
									<p className="text-stat">{formatNumber(metrics[card.key] || 0)}</p>
								</div>
							</div>
						</div>
					</MotionStaggerItem>
				))}
			</MotionStagger>

			{/* ── Row 2: Financial Summary + Active Today ──────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Financial summary */}
				<div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border">
						<h2 className="text-section-title flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-primary" />
							Financial Overview
						</h2>
					</div>
					<div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
						{FINANCIAL_CARDS.map((card) => (
							<div key={card.key} className="text-center p-3 bg-muted/50 rounded-lg">
								<p className="text-stat-label mb-1">{card.label}</p>
								<p className="text-lg font-bold text-foreground">
									{formatCurrency(metrics[card.key] || 0)}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Active today */}
				<div className="bg-card border border-border rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border">
						<h2 className="text-section-title flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-primary" />
							Active Today
						</h2>
					</div>
					<div className="p-4 space-y-4">
						{ACTIVE_TODAY_CARDS.map((card) => (
							<div key={card.key} className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
										<card.icon className="h-4 w-4" />
									</div>
									<span className="text-sm text-muted-foreground">{card.label}</span>
								</div>
								<span className="text-lg font-bold">{metrics[card.key] || 0}</span>
							</div>
						))}
						<div className="pt-3 border-t border-border">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Token Value</span>
								<span className="font-medium">1 uTn = ${settings?.tokenValue || 0}</span>
							</div>
							<div className="flex items-center justify-between text-sm mt-1">
								<span className="text-muted-foreground">Platform Fee</span>
								<span className="font-medium">{settings?.platformFeePercentage || 0}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ── Row 3: Growth Charts ─────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border flex items-center justify-between">
						<h2 className="text-section-title">Growth Metrics (30 Days)</h2>
						<div className="flex gap-2">
							<Button
								variant={growthTab === "signups" ? "default" : "outline"}
								size="sm"
								onClick={() => setGrowthTab("signups")}
							>
								Signups
							</Button>
							<Button
								variant={growthTab === "gmv" ? "default" : "outline"}
								size="sm"
								onClick={() => setGrowthTab("gmv")}
							>
								GMV
							</Button>
						</div>
					</div>
					<div className="p-4 h-72">
						<ResponsiveContainer width="100%" height="100%">
							{growthTab === "signups" ? (
								<BarChart data={signupData}>
									<CartesianGrid strokeDasharray="3 3" opacity={0.1} />
									<XAxis
										dataKey="date"
										fontSize={11}
										tickLine={false}
										interval={Math.floor(signupData.length / 6)}
									/>
									<YAxis fontSize={11} tickLine={false} allowDecimals={false} />
									<Tooltip {...CHART_TOOLTIP_STYLE} />
									<Legend />
									<Bar dataKey="users" name="Users" fill={CHART_COLORS.primary} radius={[2, 2, 0, 0]} />
									<Bar dataKey="businesses" name="Businesses" fill={CHART_COLORS.secondary} radius={[2, 2, 0, 0]} />
								</BarChart>
							) : (
								<AreaChart data={gmvData}>
									<defs>
										<linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
											<stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" opacity={0.1} />
									<XAxis
										dataKey="date"
										fontSize={11}
										tickLine={false}
										interval={Math.floor(gmvData.length / 6)}
									/>
									<YAxis fontSize={11} tickLine={false} tickFormatter={(v: number) => formatCurrency(v)} />
									<Tooltip
										{...CHART_TOOLTIP_STYLE}
										formatter={(value: number) => [formatCurrency(value), "GMV"]}
									/>
									<Area
										type="monotone"
										dataKey="gmv"
										stroke={CHART_COLORS.primary}
										fill="url(#gmvGradient)"
										strokeWidth={2}
									/>
								</AreaChart>
							)}
						</ResponsiveContainer>
					</div>
				</div>

				{/* Business type distribution pie chart */}
				<div className="bg-card border border-border rounded-lg overflow-hidden">
					<div className="p-4 bg-muted border-b border-border">
						<h2 className="text-section-title">Business Types</h2>
					</div>
					<div className="p-4 h-72">
						{typeData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={typeData}
										cx="50%"
										cy="45%"
										innerRadius={50}
										outerRadius={80}
										dataKey="count"
										nameKey="type"
										paddingAngle={2}
									>
										{typeData.map((_: any, i: number) => (
											<Cell
												key={i}
												fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]}
											/>
										))}
									</Pie>
									<Tooltip {...CHART_TOOLTIP_STYLE} />
									<Legend
										iconSize={8}
										wrapperStyle={{ fontSize: "11px" }}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-muted-foreground text-sm">
								No business type data
							</div>
						)}
					</div>
				</div>
			</div>

			{/* ── Row 4: KYC + Token + Platform Config ─────────────── */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* KYC Status */}
				<div className="bg-card border border-border rounded-lg p-4">
					<h3 className="text-section-subtitle mb-4">KYC Verification</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Verified</span>
							<span className="text-sm font-bold text-success">{metrics.kycVerifiedCount}</span>
						</div>
						<div className="w-full bg-border rounded-full h-2">
							<div
								className="bg-success h-2 rounded-full transition-all"
								style={{
									width: `${((metrics.kycVerifiedCount || 0) / Math.max(metrics.totalBusinesses, 1)) * 100}%`,
								}}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Pending</span>
							<span className="text-sm font-bold text-warning">{metrics.kycPendingCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Rejected</span>
							<span className="text-sm font-bold text-destructive">{metrics.kycRejectedCount}</span>
						</div>
					</div>
				</div>

				{/* Token & Wallet Summary */}
				<div className="bg-card border border-border rounded-lg p-4">
					<h3 className="text-section-subtitle mb-4 flex items-center gap-2">
						<Coins className="h-4 w-4 text-primary" />
						Token & Wallet
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Token Volume</span>
							<span className="text-sm font-bold">{formatCurrency(metrics.totalTokenVolume || 0)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Recharge Volume</span>
							<span className="text-sm font-bold">{formatCurrency(metrics.totalRechargeVolume || 0)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Token Symbol</span>
							<span className="text-sm font-bold">{settings?.tokenSymbol || "uTn"}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Token Value</span>
							<span className="text-sm font-bold">${settings?.tokenValue || 0}</span>
						</div>
					</div>
				</div>

				{/* Disputes & Ads */}
				<div className="bg-card border border-border rounded-lg p-4">
					<h3 className="text-section-subtitle mb-4">Disputes & Ads</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Open Disputes</span>
							<span className="text-sm font-bold text-warning">{metrics.disputesOpenCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Resolved Disputes</span>
							<span className="text-sm font-bold text-success">{metrics.disputesResolvedCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Active Ads</span>
							<span className="text-sm font-bold">{metrics.adsActiveCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Ended Ads</span>
							<span className="text-sm font-bold text-muted-foreground">{metrics.adsPendingCount}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
