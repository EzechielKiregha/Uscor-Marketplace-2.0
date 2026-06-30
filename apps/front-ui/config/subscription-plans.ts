import {
	BarChart3,
	Building2,
	Crown,
	Handshake,
	Headphones,
	Key,
	type LucideIcon,
	Palette,
	Rocket,
	Shield,
	Store,
	Users,
	Zap,
} from "lucide-react";

// ─── Feature Gate Keys ─────────────────────────────────────────────────────

export type FeatureKey =
	| "multiStore"
	| "advancedAnalytics"
	| "advancedReports"
	| "b2bAccess"
	| "prioritySupport"
	| "customBranding"
	| "apiAccess"
	| "bulkImport"
	| "workerLimit"
	| "productLimit"
	| "whiteLabel";

// ─── Feature Definitions ───────────────────────────────────────────────────

export interface FeatureDefinition {
	key: FeatureKey;
	label: string;
	description: string;
	icon: LucideIcon;
	/** StatusBadge variant to display when gated */
	badgeVariant: "pro" | "coming-soon" | "planned" | "next";
}

export const FEATURE_DEFINITIONS: Record<FeatureKey, FeatureDefinition> = {
	multiStore: {
		key: "multiStore",
		label: "Multiple Stores",
		description: "Manage more than one store location",
		icon: Store,
		badgeVariant: "coming-soon",
	},
	advancedAnalytics: {
		key: "advancedAnalytics",
		label: "Advanced Analytics",
		description: "Detailed business intelligence and insights",
		icon: BarChart3,
		badgeVariant: "coming-soon",
	},
	advancedReports: {
		key: "advancedReports",
		label: "Advanced Reports",
		description: "Custom report builder and scheduled exports",
		icon: BarChart3,
		badgeVariant: "coming-soon",
	},
	b2bAccess: {
		key: "b2bAccess",
		label: "B2B Marketplace",
		description: "Access wholesale purchasing and vendor features",
		icon: Handshake,
		badgeVariant: "next",
	},
	prioritySupport: {
		key: "prioritySupport",
		label: "Priority Support",
		description: "Dedicated support with faster response times",
		icon: Headphones,
		badgeVariant: "planned",
	},
	customBranding: {
		key: "customBranding",
		label: "Custom Branding",
		description: "Custom logo, colors, and receipt branding",
		icon: Palette,
		badgeVariant: "pro",
	},
	apiAccess: {
		key: "apiAccess",
		label: "API Access",
		description: "Developer API keys for integration",
		icon: Key,
		badgeVariant: "planned",
	},
	bulkImport: {
		key: "bulkImport",
		label: "Bulk Import",
		description: "Import products and inventory from CSV/Excel",
		icon: Zap,
		badgeVariant: "coming-soon",
	},
	workerLimit: {
		key: "workerLimit",
		label: "Worker Accounts",
		description: "Number of worker accounts allowed",
		icon: Users,
		badgeVariant: "coming-soon",
	},
	productLimit: {
		key: "productLimit",
		label: "Product Listings",
		description: "Maximum number of product listings",
		icon: Building2,
		badgeVariant: "coming-soon",
	},
	whiteLabel: {
		key: "whiteLabel",
		label: "White Label",
		description: "Remove USCOR branding entirely",
		icon: Crown,
		badgeVariant: "pro",
	},
};

// ─── Plan Definitions ──────────────────────────────────────────────────────

export type PlanTier = "STARTER" | "GROWTH" | "PRO" | "ENTERPRISE";

export interface PlanLimit {
	maxStores: number | "unlimited";
	maxWorkers: number | "unlimited";
	maxProducts: number | "unlimited";
}

export interface SubscriptionPlan {
	tier: PlanTier;
	name: string;
	description: string;
	price: number | "custom";
	billingPeriod: "month";
	icon: LucideIcon;
	color: string;
	highlight: boolean;
	limits: PlanLimit;
	features: FeatureKey[];
	featureMatrix: Record<FeatureKey, boolean | string>;
}

export const SUBSCRIPTION_PLANS: Record<PlanTier, SubscriptionPlan> = {
	STARTER: {
		tier: "STARTER",
		name: "Starter",
		description: "Perfect for small businesses getting started",
		price: 0,
		billingPeriod: "month",
		icon: Zap,
		color: "text-muted-foreground",
		highlight: false,
		limits: {
			maxStores: 1,
			maxWorkers: 2,
			maxProducts: 50,
		},
		features: [],
		featureMatrix: {
			multiStore: false,
			advancedAnalytics: false,
			advancedReports: false,
			b2bAccess: false,
			prioritySupport: false,
			customBranding: false,
			apiAccess: false,
			bulkImport: false,
			workerLimit: "2 workers",
			productLimit: "50 products",
			whiteLabel: false,
		},
	},
	GROWTH: {
		tier: "GROWTH",
		name: "Growth",
		description: "For growing businesses that need more",
		price: 29,
		billingPeriod: "month",
		icon: Rocket,
		color: "text-blue-500",
		highlight: false,
		limits: {
			maxStores: 3,
			maxWorkers: 10,
			maxProducts: 500,
		},
		features: ["multiStore", "advancedAnalytics", "bulkImport"],
		featureMatrix: {
			multiStore: "Up to 3",
			advancedAnalytics: true,
			advancedReports: false,
			b2bAccess: false,
			prioritySupport: false,
			customBranding: false,
			apiAccess: false,
			bulkImport: true,
			workerLimit: "10 workers",
			productLimit: "500 products",
			whiteLabel: false,
		},
	},
	PRO: {
		tier: "PRO",
		name: "Pro",
		description: "Advanced features for established businesses",
		price: 79,
		billingPeriod: "month",
		icon: Crown,
		color: "text-primary",
		highlight: true,
		limits: {
			maxStores: 10,
			maxWorkers: 50,
			maxProducts: 5000,
		},
		features: [
			"multiStore",
			"advancedAnalytics",
			"advancedReports",
			"b2bAccess",
			"prioritySupport",
			"customBranding",
			"bulkImport",
		],
		featureMatrix: {
			multiStore: "Up to 10",
			advancedAnalytics: true,
			advancedReports: true,
			b2bAccess: true,
			prioritySupport: true,
			customBranding: true,
			apiAccess: false,
			bulkImport: true,
			workerLimit: "50 workers",
			productLimit: "5,000 products",
			whiteLabel: false,
		},
	},
	ENTERPRISE: {
		tier: "ENTERPRISE",
		name: "Enterprise",
		description: "Unlimited scale with dedicated support",
		price: "custom",
		billingPeriod: "month",
		icon: Shield,
		color: "text-violet-500",
		highlight: false,
		limits: {
			maxStores: "unlimited",
			maxWorkers: "unlimited",
			maxProducts: "unlimited",
		},
		features: [
			"multiStore",
			"advancedAnalytics",
			"advancedReports",
			"b2bAccess",
			"prioritySupport",
			"customBranding",
			"apiAccess",
			"bulkImport",
			"whiteLabel",
		],
		featureMatrix: {
			multiStore: "Unlimited",
			advancedAnalytics: true,
			advancedReports: true,
			b2bAccess: true,
			prioritySupport: "Dedicated account manager",
			customBranding: true,
			apiAccess: true,
			bulkImport: true,
			workerLimit: "Unlimited",
			productLimit: "Unlimited",
			whiteLabel: true,
		},
	},
};

// ─── Helper Functions ──────────────────────────────────────────────────────

/** Get all plans as an ordered array */
export function getPlansArray(): SubscriptionPlan[] {
	return [
		SUBSCRIPTION_PLANS.STARTER,
		SUBSCRIPTION_PLANS.GROWTH,
		SUBSCRIPTION_PLANS.PRO,
		SUBSCRIPTION_PLANS.ENTERPRISE,
	];
}

/** Check if a specific feature is available in a plan */
export function isPlanFeatureEnabled(tier: PlanTier, feature: FeatureKey): boolean {
	return SUBSCRIPTION_PLANS[tier].features.includes(feature);
}

/** Get the badge variant for a gated feature */
export function getFeatureBadgeVariant(feature: FeatureKey) {
	return FEATURE_DEFINITIONS[feature]?.badgeVariant || "planned";
}

/** Get the minimum plan tier required for a feature */
export function getMinimumPlanForFeature(feature: FeatureKey): PlanTier {
	const tiers: PlanTier[] = ["STARTER", "GROWTH", "PRO", "ENTERPRISE"];
	for (const tier of tiers) {
		if (SUBSCRIPTION_PLANS[tier].features.includes(feature)) {
			return tier;
		}
	}
	return "ENTERPRISE";
}

/** Format plan price for display */
export function formatPlanPrice(plan: SubscriptionPlan): string {
	if (plan.price === "custom") return "Custom";
	if (plan.price === 0) return "Free";
	return `$${plan.price}`;
}
