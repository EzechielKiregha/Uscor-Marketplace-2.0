"use client";

import { Barcode } from "lucide-react";
import { useCallback, useState } from "react";
import CurrentSalePanel from "@/app/(worker)/worker/_components/_sales/CurrentSalePanel";
import SalesDashboard from "@/app/(worker)/worker/_components/_sales/SalesDashboard";
import SalesHistoryPanel from "@/app/(worker)/worker/_components/_sales/SalesHistoryPanel";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import PageSkeleton from "@/components/skeletons/PageSkeleton";
import { Button } from "@/components/ui/button";
import { useOfflinePOS } from "@/hooks/use-offline-pos";
import { useMe } from "@/lib/useMe";
import BarcodeScannerModal from "./BarcodeScannerModal";
import CustomerLookup from "./CustomerLookup";
import QuickSaleGrid from "./QuickSaleGrid";

interface PosPageProps {
  selectedStoreId: string | null;
  viewMode?: "worker" | "business";
  workerId?: string;
  retchDashData?: () => void;
}

export default function PosPage({
  selectedStoreId,
  viewMode = "worker",
  workerId,
  retchDashData,
}: PosPageProps) {
  const { user, role } = useMe();
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const effectiveWorkerId =
    viewMode === "business" && workerId ? workerId : user?.id;

  const {
    isOnline,
    pendingCount,
    syncStatus,
    lastSyncTime,
    conflicts,
    getCurrentSale,
    getSalesHistory,
    createSale,
    addProductToSale,
    activeSalesLoading,
    salesHistoryLoading,
    syncPendingOperations,
    currentSaleId,
  } = useOfflinePOS(
    selectedStoreId || "",
    effectiveWorkerId || "",
    role || "",
  );

  // Quick-add product from QuickSaleGrid or BarcodeScanner
  const handleQuickProductSelect = useCallback(
    async (productId: string, quantity: number = 1) => {
      const existingSale = getCurrentSale();
      let saleId = currentSaleId || existingSale?.id;

      // Auto-create sale if none active
      if (!saleId) {
        saleId = await createSale(effectiveWorkerId || undefined, selectedClient?.id);
      }

      if (saleId) {
        await addProductToSale(saleId, productId, quantity);
      }
    },
    [currentSaleId, getCurrentSale, createSale, addProductToSale, effectiveWorkerId, selectedClient],
  );

  if (activeSalesLoading) return <PageSkeleton variant="split" />;

  return (
    <div className="space-y-4">
      {/* Sync Status Bar — always visible */}
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        conflictCount={conflicts.length}
        onSyncNow={syncPendingOperations}
      />

      {/* Customer Lookup + Barcode Scanner Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <CustomerLookup
            storeId={selectedStoreId || ""}
            isOnline={isOnline}
            onClientSelected={setSelectedClient}
            selectedClient={selectedClient}
          />
        </div>
        <Button
          variant="outline"
          className="sm:self-start h-10 gap-2"
          onClick={() => setShowBarcodeScanner(true)}
        >
          <Barcode className="h-4 w-4" />
          Scan Barcode
        </Button>
      </div>

      {/* Quick Sale Grid */}
      <QuickSaleGrid
        storeId={selectedStoreId || ""}
        onProductSelect={handleQuickProductSelect}
      />

      {/* Main POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Sale Panel */}
        <div className="lg:col-span-2 space-y-6">
          <CurrentSalePanel
            storeId={selectedStoreId || ""}
            sale={getCurrentSale()}
            onNewSale={createSale}
            userRole={role || ""}
            userId={effectiveWorkerId || ""}
            client={selectedClient}
            onCompleteSale={retchDashData}
          />
        </div>

        {/* Right: Dashboard & History */}
        <div className="space-y-6">
          <SalesHistoryPanel
            salesHistory={getSalesHistory()}
            loading={salesHistoryLoading}
          />
        </div>
      </div>
      <SalesDashboard storeId={selectedStoreId || ""} />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        storeId={selectedStoreId || ""}
        onProductFound={(product) => {
          handleQuickProductSelect(product.id, 1);
          setShowBarcodeScanner(false);
        }}
      />
    </div>
  );
}
