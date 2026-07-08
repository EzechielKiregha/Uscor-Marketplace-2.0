"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
    FEATURE_DEFINITIONS,
    type FeatureKey,
    getPlansArray
} from "@/config/subscription-plans";

// Feature keys to show in pricing cards
const CARD_FEATURES: FeatureKey[] = [
	"multiStore",
	"advancedAnalytics",
	"advancedReports",
	"b2bAccess",
	"bulkImport",
	"prioritySupport",
	"customBranding",
	"apiAccess",
];

interface AnimatedPriceProps {
	price: string;
}

const AnimatedPrice: React.FC<AnimatedPriceProps> = ({ price }) => {
	return (
		<motion.span
			className="inline-block"
			key={price}
			initial={{ opacity: 0, filter: "blur(8px)" }}
			animate={{ opacity: 1, filter: "blur(0px)" }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{price}
		</motion.span>
	);
};

const PricingSection = () => {
	const [isMonthly, setIsMonthly] = useState(true);
	const monthlyButtonRef = useRef<HTMLButtonElement>(null);
	const yearlyButtonRef = useRef<HTMLButtonElement>(null);
	const [activeButtonLeft, setActiveButtonLeft] = useState(0);
	const [activeButtonWidth, setActiveButtonWidth] = useState(0);
	const plans = getPlansArray();

	useEffect(() => {
		const updateButtonMetrics = () => {
			if (monthlyButtonRef.current && yearlyButtonRef.current) {
				if (isMonthly) {
					setActiveButtonLeft(monthlyButtonRef.current.offsetLeft);
					setActiveButtonWidth(monthlyButtonRef.current.offsetWidth);
				} else {
					setActiveButtonLeft(yearlyButtonRef.current.offsetLeft);
					setActiveButtonWidth(yearlyButtonRef.current.offsetWidth);
				}
			}
		};
		updateButtonMetrics();
		window.addEventListener("resize", updateButtonMetrics);
		return () => window.removeEventListener("resize", updateButtonMetrics);
	}, [isMonthly]);

	const getDisplayPrice = (price: number | "custom", yearly: boolean): string => {
		if (price === "custom") return "Custom";
		if (price === 0) return "Free";
		if (yearly) return `$${price * 10}`;
		return `$${price}`;
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring" as const,
				stiffness: 100,
				damping: 10,
			},
		},
	};

	return (
		<div className="w-full relative bg-card overflow-hidden">
			{/* Background Gradients */}
			<div
				className="absolute inset-0 z-0 opacity-60"
				style={{
					background:
						"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249, 115, 22, 0.15), transparent 70%)",
				}}
			/>

			<div className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
				<div className="max-w-7xl mx-auto w-full">
					{/* Header */}
					<div className="text-center">
						<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
							Affordable Plans for Your Business
						</h2>
						<p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
							Choose a plan that fits your marketplace needs. Start free and scale as you grow.
						</p>
					</div>

					{/* Pricing Toggle */}
					<div className="mt-8 sm:mt-10 flex justify-center px-4">
						<div
							className="relative flex items-center p-1 rounded-full border border-border hover:border-primary hover:bg-primary/5 cursor-pointer shadow-lg bg-card"
							style={{
								backdropFilter: "blur(10px)",
								WebkitBackdropFilter: "blur(10px)",
							}}
						>
							<button
								ref={monthlyButtonRef}
								onClick={() => setIsMonthly(true)}
								className={`relative z-10 py-2 px-4 sm:px-6 rounded-full text-sm font-medium transition-all duration-300 ${
									isMonthly
										? "text-white"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Monthly
							</button>

							<button
								ref={yearlyButtonRef}
								onClick={() => setIsMonthly(false)}
								className={`relative z-10 py-2 px-4 sm:px-6 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center ${
									!isMonthly
										? "text-white"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Yearly
								<span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
									2 free
								</span>
							</button>

							{activeButtonWidth > 0 && (
								<motion.div
									className="absolute inset-y-1 rounded-full shadow-md bg-orange-500"
									initial={false}
									animate={{ left: activeButtonLeft, width: activeButtonWidth }}
									transition={{ type: "spring", stiffness: 300, damping: 30 }}
								/>
							)}
						</div>
					</div>

					{/* Pricing Cards */}
					<motion.div
						className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 px-4"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{plans.map((plan) => {
							const PlanIcon = plan.icon;
							return (
								<motion.div
									key={plan.tier}
									className={`relative flex flex-col p-6 rounded-xl border transition-all duration-300 ${
										plan.highlight
											? "border-orange-500 bg-card shadow-lg shadow-orange-500/10"
											: "border-border bg-card"
									}`}
									style={{
										backdropFilter: "blur(10px)",
										WebkitBackdropFilter: "blur(10px)",
									}}
									variants={cardVariants}
									whileHover={{
										y: -8,
										boxShadow: plan.highlight
											? "0 25px 50px -12px rgba(249, 115, 22, 0.3)"
											: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
									}}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
								>
									{plan.highlight && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-semibold uppercase rounded-full shadow-md">
											Most Popular
										</div>
									)}

									{/* Plan Icon + Name */}
									<div className="flex items-center gap-3 mb-4">
										<div className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center ${plan.color}`}>
											<PlanIcon className="h-5 w-5" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-foreground">
												{plan.name}
											</h3>
											<p className="text-xs text-muted-foreground">{plan.description}</p>
										</div>
									</div>

									{/* Price */}
									<div className="mt-2 flex items-baseline">
										<span className="text-4xl font-extrabold text-foreground">
											<AnimatedPrice
												price={getDisplayPrice(plan.price, !isMonthly)}
											/>
										</span>
										{plan.price !== "custom" && plan.price > 0 && (
											<span className="ml-1 text-base font-medium text-muted-foreground">
												/{isMonthly ? "mo" : "yr"}
											</span>
										)}
									</div>

									{/* Limits */}
									<div className="mt-4 space-y-1.5 text-sm">
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
												{plan.limits.maxProducts === "unlimited"
													? "Unlimited"
													: typeof plan.limits.maxProducts === "number"
														? plan.limits.maxProducts.toLocaleString()
														: plan.limits.maxProducts}
											</span>{" "}
											products
										</p>
									</div>

									{/* Features */}
									<ul className="mt-5 space-y-2.5 flex-grow border-t border-border pt-4">
										{CARD_FEATURES.slice(0, 6).map((featureKey) => {
											const value = plan.featureMatrix[featureKey];
											const isEnabled = value === true || (typeof value === "string" && value !== "false");
											const def = FEATURE_DEFINITIONS[featureKey];
											if (!def) return null;

											return (
												<li key={featureKey} className="flex items-start gap-2 text-sm">
													{isEnabled ? (
														<Check className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
													) : (
														<X className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5" />
													)}
													<span className={isEnabled ? "text-foreground" : "text-muted-foreground/50"}>
														{def.label}
														{typeof value === "string" && value !== "true" && value !== "false" && isEnabled && (
															<span className="text-xs text-muted-foreground ml-1">({value})</span>
														)}
													</span>
												</li>
											);
										})}
									</ul>

									{/* CTA */}
									<div className="mt-6">
										<motion.button
											className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 relative flex items-center justify-center gap-2 ${
												plan.highlight
													? "bg-orange-500 text-white hover:bg-orange-600"
													: "bg-card text-orange-500 border-2 border-orange-500/30 hover:bg-orange-500 hover:text-white"
											}`}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											disabled
										>
											{plan.price === 0 ? "Current Plan" : plan.price === "custom" ? "Contact Us" : "Upgrade"}
											<StatusBadge
												text="Coming Soon"
												variant="coming-soon"
												className="static text-[8px] px-1.5 py-0"
											/>
										</motion.button>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default PricingSection;
