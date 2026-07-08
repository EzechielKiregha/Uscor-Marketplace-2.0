"use client";

import { useQuery } from "@apollo/client";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import MotionPage from "@/components/MotionPage";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { useMe } from "@/lib/useMe";
import { useInventory } from "../_hooks/use-inventory";
import { useOpenCreateStoreModal } from "../_hooks/use-open-create-store-modal";
import InventorySummary from "./_components/InventorySummary";
import PurchaseOrders from "./_components/PurchaseOrders";
import StockManagement from "./_components/StockManagement";
import TransferOrders from "./_components/TransferOrders";

export default function InventoryManagementPage() {
	const { user, role, loading: authLoading } = useMe();
	const { isOpen, setIsOpen } = useOpenCreateStoreModal();
	const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"stock" | "purchase" | "transfer">(
		"stock",
	);

	const {
		data: storesData,
		loading: storesLoading,
		error: storesError,
	} = useQuery(GET_STORES);

	const {
		getInventory,
		getPurchaseOrders,
		getTransferOrders,
		inventoryLoading,
		purchaseOrdersLoading,
		transferOrdersLoading,
	} = useInventory(selectedStoreId || "", user?.id || "");

	// Auto-select first store if none selected
	useEffect(() => {
		if (
			storesData?.stores &&
			storesData.stores.length > 0 &&
			!selectedStoreId
		) {
			setSelectedStoreId(storesData.stores[0].id);
		}
	}, [storesData, selectedStoreId]);

	if (authLoading || storesLoading) return <TableSkeleton />;
	if (storesError)
		return <div>Error loading stores: {storesError.message}</div>;
	if (!storesData?.stores || storesData.stores.length === 0) {
		return (
			<EmptyState
				icon={emptyStateIcons.stores}
				title="No Stores Found"
				description="You need to create at least one store before you can manage inventory"
				action={{
					label: "Create Your First Store",
					onClick: () =>
						setIsOpen({
							openCreateStoreModal: true,
							initialStoreData: null,
						}),
				}}
			/>
		);
	}

	return (
		<MotionPage className="space-y-6">
			{/* Store Selector */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-page-title">Inventory Management</h1>
					<p className="text-muted-foreground">
						Manage stock levels, purchase orders, and transfers
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
					<select
						title="selected store ID"
						value={selectedStoreId || ""}
						onChange={(e) => setSelectedStoreId(e.target.value)}
						className="w-full sm:w-64 p-2 border border-border hover:border-primary hover:bg-primary/5 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
					>
						{storesData.stores.map((store: any) => (
							<option key={store.id} value={store.id}>
								{store.name} {store.address ? `• ${store.address}` : ""}
							</option>
						))}
					</select>

					<div className="flex gap-1">
						<Button
							variant={activeTab === "stock" ? "default" : "outline"}
							onClick={() => setActiveTab("stock")}
						>
							Stock
						</Button>
						<Button
							variant={activeTab === "purchase" ? "default" : "outline"}
							onClick={() => setActiveTab("purchase")}
						>
							Purchase Orders
						</Button>
						<Button
							variant={activeTab === "transfer" ? "default" : "outline"}
							onClick={() => setActiveTab("transfer")}
						>
							Transfer Orders
						</Button>
					</div>

					<Button variant="default" size="sm">
						<Plus className="h-4 w-4 mr-2" />
						{activeTab === "stock" && "Adjust Stock"}
						{activeTab === "purchase" && "New Order"}
						{activeTab === "transfer" && "New Transfer"}
					</Button>
				</div>
			</div>

			{/* Inventory Summary */}
			<InventorySummary
				businessId={user?.id || ""}
				storeId={selectedStoreId || ""}
			/>

			{/* Main Content */}
			<div className="space-y-6">
				{activeTab === "stock" && (
					<StockManagement
						storeId={selectedStoreId || ""}
						inventory={getInventory()}
						loading={inventoryLoading}
					/>
				)}

				{activeTab === "purchase" && (
					<PurchaseOrders
						storeId={selectedStoreId || ""}
						purchaseOrders={getPurchaseOrders()}
						loading={purchaseOrdersLoading}
					/>
				)}

				{activeTab === "transfer" && (
					<TransferOrders
						storeId={selectedStoreId || ""}
						transferOrders={getTransferOrders()}
						loading={transferOrdersLoading}
					/>
				)}
			</div>
		</MotionPage>
	);
}
