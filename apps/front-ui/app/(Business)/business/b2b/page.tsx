"use client";

import { useQuery } from "@apollo/client";
import {
	Handshake,
	Package,
	ShoppingCart,
	Store,
	Tag,
} from "lucide-react";
import { useState } from "react";
import MotionPage from "@/components/MotionPage";
import { StatusBadge } from "@/components/StatusBadge";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { getMinimumPlanForFeature } from "@/config/subscription-plans";
import { GET_PRODUCTS_BY_BUSINESS_ID } from "@/graphql/product.gql";
import { useMe } from "@/lib/useMe";
import PurchaseRequests from "./_components/PurchaseRequests";
import VendorProfile from "./_components/VendorProfile";
import WholesalePricing from "./_components/WholesalePricing";

const TABS = [
	{ key: "orders", label: "Purchase Orders", icon: ShoppingCart },
	{ key: "pricing", label: "Wholesale Pricing", icon: Tag },
	{ key: "vendors", label: "Vendor Directory", icon: Store },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function B2BPage() {
	const { user, loading: authLoading } = useMe();
	const [activeTab, setActiveTab] = useState<TabKey>("orders");

	const { data: productsData } = useQuery(GET_PRODUCTS_BY_BUSINESS_ID, {
		skip: !user,
	});

	const products = productsData?.fetchedBusinessProducts || [];

	if (authLoading) return <DashboardSkeleton statCount={3} showChart={false} showTable />;

	if (!user) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Please log in to access B2B features.</p>
			</div>
		);
	}

	return (
		<MotionPage className="space-y-6">
			{/* Header */}
			<div className="relative">
				<h1 className="text-page-title flex items-center gap-2">
					<Handshake className="h-6 w-6 text-primary" />
					B2B Hub
				</h1>
				<p className="text-muted-foreground mt-1">
					Manage wholesale pricing, purchase orders, and vendor relationships
				</p>
				<StatusBadge
					text={`${getMinimumPlanForFeature("b2bAccess")} Plan`}
					variant="next"
				/>
			</div>

			{/* B2B status banner */}
			{!user.isB2BEnabled && (
				<div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm">
					<p className="font-medium text-warning">B2B Not Enabled</p>
					<p className="text-muted-foreground mt-1">
						Your business must be KYC-verified and B2B-enabled by a platform admin to use wholesale features.
						You can still browse the vendor directory.
					</p>
				</div>
			)}

			{/* Tabs */}
			<div className="flex rounded-lg border border-border overflow-hidden w-fit">
				{TABS.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
							activeTab === tab.key
								? "bg-primary text-primary-foreground"
								: "hover:bg-muted text-muted-foreground"
						}`}
					>
						<tab.icon className="h-4 w-4" />
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab content */}
			{activeTab === "orders" && <PurchaseRequests businessId={user.id} />}
			{activeTab === "pricing" && <WholesalePricing products={products} />}
			{activeTab === "vendors" && <VendorProfile />}
		</MotionPage>
	);
}
