"use client";

import {
	ArrowUpRight,
	Coins,
	CreditCard,
	DollarSign,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";
import { Button } from "@/components/ui/button";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface TokenDashboardProps {
	metrics: any;
	settings: any;
}

function formatCurrency(val: number) {
	if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
	if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
	return `$${val.toFixed(2)}`;
}

export default function TokenDashboard({ metrics, settings }: TokenDashboardProps) {
	const [chartView, setChartView] = useState<"volume" | "gmv">("volume");

	if (!metrics) return null;

	const tokenValue = settings?.tokenValue || 0;
	const tokenSymbol = settings?.tokenSymbol || "uTn";
	const totalTokenVolume = metrics.totalTokenVolume || 0;
	const totalRechargeVolume = metrics.totalRechargeVolume || 0;
	const totalSalesRevenue = metrics.totalSalesRevenue || 0;
	const totalTransactions = metrics.totalTransactions || 0;
	const avgTxValue = metrics.averageTransactionValue || 0;
	const platformFees = metrics.platformFeesCollected || 0;

	// GMV chart data
	const gmvData = (metrics.gmv30d || []).map((d: any) => ({
		date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		gmv: d.amount,
	}));

	// Transaction volume chart data (from last30Days)
	const volumeData = (metrics.last30Days || []).map((d: any) => ({
		date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		transactions: d.count,
	}));

	const STAT_CARDS = [
		{
			label: "Token Volume",
			value: formatCurrency(totalTokenVolume),
			icon: Coins,
			color: "bg-primary/10 text-primary",
			description: `Total ${tokenSymbol} transacted`,
		},
		{
			label: "Recharge Volume",
			value: formatCurrency(totalRechargeVolume),
			icon: Wallet,
			color: "bg-success/10 text-success",
			description: "Wallet top-ups",
		},
		{
			label: "POS Revenue",
			value: formatCurrency(totalSalesRevenue),
			icon: DollarSign,
			color: "bg-blue-500/10 text-blue-500",
			description: "Point of sale revenue",
		},
		{
			label: "Transactions",
			value: totalTransactions.toLocaleString(),
			icon: CreditCard,
			color: "bg-violet-500/10 text-violet-500",
			description: "Completed transactions",
		},
		{
			label: "Avg Transaction",
			value: formatCurrency(avgTxValue),
			icon: TrendingUp,
			color: "bg-amber-500/10 text-amber-500",
			description: "Average transaction value",
		},
		{
			label: "Platform Fees",
			value: formatCurrency(platformFees),
			icon: ArrowUpRight,
			color: "bg-emerald-500/10 text-emerald-500",
			description: `${settings?.platformFeePercentage || 0}% fee rate`,
		},
	];

	return (
		<div className="space-y-6">
			{/* Token Config Banner */}
			<div className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
						<Coins className="h-6 w-6" />
					</div>
					<div>
						<h2 className="text-section-title">Token & Wallet Overview</h2>
						<p className="text-sm text-muted-foreground">
							Monitor token circulation, wallet recharges, and revenue streams
						</p>
					</div>
				</div>
				<div className="flex gap-4 text-sm">
					<div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
						<p className="text-stat-label">Symbol</p>
						<p className="font-bold text-primary">{tokenSymbol}</p>
					</div>
					<div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
						<p className="text-stat-label">Value</p>
						<p className="font-bold">${tokenValue}</p>
					</div>
					<div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
						<p className="text-stat-label">Fee Rate</p>
						<p className="font-bold">{settings?.platformFeePercentage || 0}%</p>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<MotionStagger className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{STAT_CARDS.map((card) => (
					<MotionStaggerItem key={card.label}>
						<div className="bg-card border border-border rounded-lg p-4 card-hover">
							<div className="flex items-center gap-3">
								<div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}>
									<card.icon className="h-5 w-5" />
								</div>
								<div>
									<p className="text-stat-label">{card.label}</p>
									<p className="text-stat">{card.value}</p>
									<p className="text-xs text-muted-foreground">{card.description}</p>
								</div>
							</div>
						</div>
					</MotionStaggerItem>
				))}
			</MotionStagger>

			{/* Charts */}
			<div className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="p-4 bg-muted border-b border-border flex items-center justify-between">
					<h2 className="text-section-title">30-Day Trends</h2>
					<div className="flex gap-2">
						<Button
							variant={chartView === "volume" ? "default" : "outline"}
							size="sm"
							onClick={() => setChartView("volume")}
						>
							Transactions
						</Button>
						<Button
							variant={chartView === "gmv" ? "default" : "outline"}
							size="sm"
							onClick={() => setChartView("gmv")}
						>
							GMV
						</Button>
					</div>
				</div>
				<div className="p-4 h-80">
					<ResponsiveContainer width="100%" height="100%">
						{chartView === "volume" ? (
							<BarChart data={volumeData}>
								<CartesianGrid strokeDasharray="3 3" opacity={0.1} />
								<XAxis
									dataKey="date"
									fontSize={11}
									tickLine={false}
									interval={Math.floor(volumeData.length / 6)}
								/>
								<YAxis fontSize={11} tickLine={false} allowDecimals={false} />
								<Tooltip {...CHART_TOOLTIP_STYLE} />
								<Bar
									dataKey="transactions"
									name="Transactions"
									fill={CHART_COLORS.primary}
									radius={[2, 2, 0, 0]}
								/>
							</BarChart>
						) : (
							<AreaChart data={gmvData}>
								<defs>
									<linearGradient id="tokenGmvGrad" x1="0" y1="0" x2="0" y2="1">
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
								<YAxis
									fontSize={11}
									tickLine={false}
									tickFormatter={(v: number) => formatCurrency(v)}
								/>
								<Tooltip
									{...CHART_TOOLTIP_STYLE}
									formatter={(value: number) => [formatCurrency(value), "GMV"]}
								/>
								<Area
									type="monotone"
									dataKey="gmv"
									stroke={CHART_COLORS.primary}
									fill="url(#tokenGmvGrad)"
									strokeWidth={2}
								/>
							</AreaChart>
						)}
					</ResponsiveContainer>
				</div>
			</div>

			{/* Breakdown */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<h3 className="text-section-subtitle mb-4 flex items-center gap-2">
						<Coins className="h-4 w-4 text-primary" />
						Token Breakdown
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Total Volume</span>
							<span className="text-sm font-bold">{formatCurrency(totalTokenVolume)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">In {tokenSymbol}</span>
							<span className="text-sm font-bold">
								{tokenValue > 0
									? `${(totalTokenVolume / tokenValue).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${tokenSymbol}`
									: "N/A"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Token Value</span>
							<span className="text-sm font-bold">${tokenValue}</span>
						</div>
					</div>
				</div>

				<div className="bg-card border border-border rounded-lg p-4">
					<h3 className="text-section-subtitle mb-4 flex items-center gap-2">
						<Wallet className="h-4 w-4 text-primary" />
						Wallet & Recharge
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Total Recharges</span>
							<span className="text-sm font-bold">{formatCurrency(totalRechargeVolume)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">POS Revenue</span>
							<span className="text-sm font-bold">{formatCurrency(totalSalesRevenue)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Platform Fees</span>
							<span className="text-sm font-bold">{formatCurrency(platformFees)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
