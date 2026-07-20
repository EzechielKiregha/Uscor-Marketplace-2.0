"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Feature = {
	title: string;
	description: string;
	imageSrc: string;
	imageAlt: string;
	href?: string;
};

const features: Feature[] = [
	{
		title: "B2B Marketplace & E‑commerce",
		description:
			"Sell to businesses and consumers in one place. Custom catalogs, negotiated pricing, purchase orders, secure escrow, and global tax/currency support.",
		imageSrc: "/nav/businessHandshake.jpg",
		imageAlt: "Marketplace and e‑commerce showcase",
		href: "/uscor-features",
	},
	{
		title: "Multi‑Store Management",
		description:
			"Run multiple stores from a single dashboard. Shared inventory, localized catalogs and pricing, role-based access, and unified reporting.",
		imageSrc: "/nav/multi-stores.jpg",
		imageAlt: "Multi‑store management dashboard",
		href: "/uscor-features",
	},
	{
		title: "Intelligent POS",
		description:
			"Fast in‑store checkout synced with your online catalog. Real‑time inventory, offline mode, multi‑payment support, and AI-powered sales insights.",
		imageSrc: "/nav/pos.jpg",
		imageAlt: "Point of sale experience",
		href: "/uscor-features",
	},
	{
		title: "Freelance Marketplace",
		description:
			"Hire vetted professionals or sell services with milestones, contracts, escrow, and instant payouts powered by Uscor.",
		imageSrc: "/nav/freelance.jpg",
		imageAlt: "Freelance marketplace and gigs",
		href: "/uscor-features",
	},
	{
		title: "Security & Fraud Prevention",
		description:
			"End‑to‑end encryption, device checks, rate limiting, and anomaly detection to keep accounts and transactions safe.",
		imageSrc: "/nav/security.jpg",
		imageAlt: "Secure technology background",
		href: "/uscor-features",
	},
	{
		title: "KYC & Compliance",
		description:
			"Verify identities to unlock higher limits and trust badges, with automated checks to meet regional regulations.",
		imageSrc: "/nav/kyc.png",
		imageAlt: "Compliance and verification",
		href: "/uscor-features",
	},
];

export default function FeaturesSection() {
	return (
		<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/30">
			<div className="max-w-7xl mx-auto">
				{/* Section header */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-800/50 mb-4">
						Platform Features
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
						Built for Modern Commerce
					</h2>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
						From B2B sales to multi-location operations and in‑store
						checkout — grow every channel with one platform.
					</p>
				</div>

				{/* Features list */}
				<div className="space-y-20">
					{features.map((feature, idx) => {
						const imageOnRight = idx % 2 === 0;

						return (
							<article
								key={feature.title}
								className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center"
							>
								{/* Text block */}
								<div
									className={
										imageOnRight ? "order-2 md:order-1" : "order-2 md:order-2"
									}
								>
									<h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
										{feature.title}
									</h3>
									<p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
									{feature.href && (
										<div className="mt-6">
											<Link
												href={feature.href}
												className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors group"
											>
												Learn more
												<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
											</Link>
										</div>
									)}
								</div>

								{/* Image block */}
								<div
									className={
										imageOnRight ? "order-1 md:order-2" : "order-1 md:order-1"
									}
								>
									<div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
										<Image
											src={feature.imageSrc}
											alt={feature.imageAlt}
											width={1200}
											height={800}
											className="h-64 sm:h-72 md:h-80 w-full object-cover"
											priority={idx === 0}
										/>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
