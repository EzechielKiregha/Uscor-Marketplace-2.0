"use client";

import {
	Check,
	Crown,
	Info,
	Sparkles,
	X,
} from "lucide-react";
import { useState } from "react";
import MotionPage from "@/components/MotionPage";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";
import { StatusBadge } from "@/components/StatusBadge";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
	FEATURE_DEFINITIONS,
	type FeatureKey,
	formatPlanPrice,
	getPlansArray,
	type SubscriptionPlan,
} from "@/config/subscription-plans";
import { useMe } from "@/lib/useMe";

// Feature keys to show in the comparison matrix
const MATRIX_FEATURES: FeatureKey[] = [
	"multiStore",
	"workerLimit",
	"productLimit",
	"advancedAnalytics",
	"advancedReports",
	"b2bAccess",
	"bulkImport",
	"prioritySupport",
	"customBranding",
	"apiAccess",
	"whiteLabel",
];

export default function SubscriptionPage() {
	const { user, loading } = useMe();
	const [showMatrix, setShowMatrix] = useState(false);
	const plans = getPlansArray();

	// Current plan — default to STARTER (architecture only, no real subscription query yet)
	const currentTier = "STARTER";

	if (loading) return <DashboardSkeleton statCount={4} showChart={false} showTable={false} />;

	return (
		<MotionPage className="space-y-8">
			{/* Header */}
			<div className="text-center max-w-2xl mx-auto">
				<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
					<Sparkles className="h-4 w-4" />
					Subscription Plans
				</div>
				<h1 className="text-page-title">Choose the right plan for your business</h1>
				<p className="text-muted-foreground mt-2">
					Start free and scale as you grow. Upgrade anytime to unlock more features.
				</p>
			</div>

			{/* Plan Cards */}
			<MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
				{plans.map((plan) => {
					const isCurrent = plan.tier === currentTier;
					const PlanIcon = plan.icon;

					return (
						<MotionStaggerItem key={plan.tier}>
							<div
								className={`relative bg-card rounded-xl overflow-hidden transition-all ${
									plan.highlight
										? "border-2 border-primary shadow-lg shadow-primary/10 scale-[1.02]"
										: "border border-border"
								}`}
							>
								{/* Highlight badge */}
								{plan.highlight && (
									<div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1">
										MOST POPULAR
									</div>
								)}

								{/* Current plan badge */}
								{isCurrent && !plan.highlight && (
									<div className="absolute top-0 left-0 right-0 bg-muted text-muted-foreground text-center text-xs font-bold py-1">
										CURRENT PLAN
									</div>
								)}

								<div className={`p-6 space-y-4 ${plan.highlight || isCurrent ? "pt-8" : ""}`}>
									{/* Icon + Name */}
									<div className="flex items-center gap-3">
										<div className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center ${plan.color}`}>
											<PlanIcon className="h-5 w-5" />
										</div>
										<div>
											<h3 className="font-bold text-lg">{plan.name}</h3>
											<p className="text-xs text-muted-foreground">{plan.description}</p>
										</div>
									</div>

									{/* Price */}
									<div className="pt-2">
										<span className="text-3xl font-bold">{formatPlanPrice(plan)}</span>
										{plan.price !== "custom" && plan.price > 0 && (
											<span className="text-muted-foreground text-sm">/{plan.billingPeriod}</span>
										)}
									</div>

									{/* Limits */}
									<div className="space-y-1.5 text-sm">
										<p className="text-muted-foreground">
											<span className="font-medium text-foreground">
												{plan.limits.maxStores === "unlimited" ? "Unlimited" : plan.limits.maxStores}
											</span>{" "}
											store{plan.limits.maxStores !== 1 ? "s" : ""}
										</p>
										<p className="text-muted-foreground">
											<span className="font-medium text-foreground">
												{plan.limits.maxWorkers === "unlimited" ? "Unlimited" : plan.limits.maxWorkers}
											</span>{" "}
											workers
										</p>
										<p className="text-muted-foreground">
											<span className="font-medium text-foreground">
												{plan.limits.maxProducts === "unlimited" ? "Unlimited" : plan.limits.maxProducts.toLocaleString()}
											</span>{" "}
											products
										</p>
									</div>

									{/* Features list */}
									<div className="space-y-2 pt-2 border-t border-border">
										{MATRIX_FEATURES.slice(0, 6).map((featureKey) => {
											const value = plan.featureMatrix[featureKey];
											const isEnabled = value === true || (typeof value === "string" && value !== "false");
											const def = FEATURE_DEFINITIONS[featureKey];
											if (!def) return null;

											return (
												<div key={featureKey} className="flex items-center gap-2 text-sm">
													{isEnabled ? (
														<Check className="h-4 w-4 text-success shrink-0" />
													) : (
														<X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
													)}
													<span className={isEnabled ? "text-foreground" : "text-muted-foreground/60"}>
														{def.label}
													</span>
													{typeof value === "string" && value !== "true" && value !== "false" && isEnabled && (
														<span className="text-xs text-muted-foreground ml-auto">({value})</span>
													)}
												</div>
											);
										})}
									</div>

									{/* CTA Button */}
									<div className="pt-2">
										{isCurrent ? (
											<Button variant="outline" className="w-full" disabled>
												Current Plan
											</Button>
										) : plan.price === "custom" ? (
											<Button variant="outline" className="w-full" disabled>
												<StatusBadge text="Contact Us" variant="planned" className="static" />
											</Button>
										) : (
											<Button
												variant={plan.highlight ? "default" : "outline"}
												className="w-full relative"
												disabled
											>
												Upgrade
												<StatusBadge text="Coming Soon" variant="coming-soon" className="static ml-2 text-[8px] px-1.5 py-0" />
											</Button>
										)}
									</div>
								</div>
							</div>
						</MotionStaggerItem>
					);
				})}
			</MotionStagger>

			{/* Toggle feature matrix */}
			<div className="text-center">
				<Button variant="ghost" onClick={() => setShowMatrix(!showMatrix)}>
					<Info className="h-4 w-4 mr-2" />
					{showMatrix ? "Hide" : "Show"} Full Feature Comparison
				</Button>
			</div>

			{/* Feature comparison matrix */}
			{showMatrix && (
				<div className="max-w-6xl mx-auto bg-card border border-border rounded-xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-muted border-b border-border">
									<th className="text-left p-4 font-medium text-muted-foreground min-w-[200px]">Feature</th>
									{plans.map((plan) => (
										<th
											key={plan.tier}
											className={`text-center p-4 font-bold min-w-[140px] ${
												plan.highlight ? "bg-primary/5" : ""
											}`}
										>
											<div className={plan.color}>{plan.name}</div>
											<div className="text-xs text-muted-foreground font-normal mt-0.5">
												{formatPlanPrice(plan)}
												{plan.price !== "custom" && plan.price > 0 ? `/${plan.billingPeriod}` : ""}
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{MATRIX_FEATURES.map((featureKey, idx) => {
									const def = FEATURE_DEFINITIONS[featureKey];
									if (!def) return null;

									return (
										<tr
											key={featureKey}
											className={`border-b border-border ${idx % 2 === 0 ? "" : "bg-muted/30"}`}
										>
											<td className="p-4">
												<div className="flex items-center gap-2">
													<def.icon className="h-4 w-4 text-muted-foreground" />
													<div>
														<p className="font-medium">{def.label}</p>
														<p className="text-xs text-muted-foreground">{def.description}</p>
													</div>
												</div>
											</td>
											{plans.map((plan) => {
												const value = plan.featureMatrix[featureKey];
												return (
													<td
														key={plan.tier}
														className={`text-center p-4 ${plan.highlight ? "bg-primary/5" : ""}`}
													>
														{value === true ? (
															<Check className="h-5 w-5 text-success mx-auto" />
														) : value === false ? (
															<X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
														) : (
															<span className="text-xs font-medium">{value}</span>
														)}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Roadmap notice */}
			<div className="max-w-2xl mx-auto text-center bg-muted/50 border border-border rounded-lg p-6">
				<Crown className="h-8 w-8 text-primary mx-auto mb-3" />
				<h3 className="text-section-title mb-2">Subscription Plans — Coming Soon</h3>
				<p className="text-sm text-muted-foreground">
					Subscription billing and plan management are currently in development.
					All businesses start on the free Starter plan with core features.
					Plan upgrades, payment integration, and feature gates will be available in a future release.
				</p>
				<div className="flex flex-wrap justify-center gap-2 mt-4">
					<span className="px-3 py-1 text-xs rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
						Coming Soon
					</span>
					<span className="px-3 py-1 text-xs rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
						Planned
					</span>
					<span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground border border-border">
						Roadmap Q3 2026
					</span>
				</div>
			</div>
		</MotionPage>
	);
}
