// app/business/sales/page.tsx
"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import MotionPage from "@/components/MotionPage";
import PageSkeleton from "@/components/skeletons/PageSkeleton";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { StoreEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import CreateStoreModal from "../_components/modals/CreateStoreModal";
import { useOpenCreateStoreModal } from "../_hooks/use-open-create-store-modal";
import { useSales } from "../_hooks/use-sales";
import CurrentSalePanel from "./_components/CurrentSalePanel";
import NewSaleModal from "./_components/NewSaleModal";
import SalesDashboard from "./_components/SalesDashboard";
import SalesHistoryPanel from "./_components/SalesHistoryPanel";

export default function SalesManagementPage() {
  const { user, role, loading: authLoading } = useMe();
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError,
  } = useQuery(GET_STORES);

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

  const {
    getCurrentSale,
    getSalesHistory,
    createSale,
    activeSalesLoading,
    salesHistoryLoading,
  } = useSales(selectedStoreId!, user?.id || "", role!);

  if (authLoading || storesLoading) return <PageSkeleton variant="split" />;
  if (storesError)
    return <div>Error loading stores: {storesError.message}</div>;
  if (!storesData?.stores || storesData.stores.length === 0) {
    return (
      <EmptyState
        icon={emptyStateIcons.stores}
        title="No Stores Found"
        description="You need to create at least one store before you can process sales"
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
          <h1 className="text-page-title">Point of Sale</h1>
          <p className="text-page-subtitle">
            Process sales and manage transactions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            title="selected store ID"
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-64 p-2 border border-border hover:border-primary hover:bg-primary/5 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {storesData.stores.map((store: StoreEntity) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.address ? `• ${store.address}` : ""}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowNewSaleModal(true)}
            disabled={!selectedStoreId}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* New Sale Modal */}
      <NewSaleModal
        isOpen={showNewSaleModal}
        onClose={() => setShowNewSaleModal(false)}
        onCreateSale={createSale}
        storeId={selectedStoreId || ""}
        userRole={role || ""}
        userId={user?.id || ""}
      />

      {/* Main POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Left: Current Sale Panel */}
        <div className="lg:col-span-2 space-y-6">
          <CurrentSalePanel
            storeId={selectedStoreId || ""}
            sale={getCurrentSale()}
            onNewSale={createSale}
            userRole={role || ""}
            userId={user?.id || ""}
          />
          <SalesDashboard storeId={selectedStoreId || ""} />
        </div>

        {/* Right: Dashboard & History */}
        <div className="space-y-6">
          <SalesHistoryPanel
            salesHistory={getSalesHistory()}
            loading={salesHistoryLoading}
          />
        </div>
      </div>

      {/* Create Store Modal */}
      <CreateStoreModal />
    </MotionPage>
  );
}
