"use client";

import { AlertTriangle } from "lucide-react";
import Loader from "@/components/seraui/Loader";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useMe } from "@/lib/useMe";
import { useSales } from "@/app/(Business)/business/_hooks/use-sales";
import CurrentSalePanel from "@/app/(Business)/business/sales/_components/CurrentSalePanel";
import SalesDashboard from "@/app/(Business)/business/sales/_components/SalesDashboard";
import SalesHistoryPanel from "@/app/(Business)/business/sales/_components/SalesHistoryPanel";

interface PosPageProps {
  selectedStoreId: string | null;
}

export default function PosPage({ selectedStoreId }: PosPageProps) {
  const { user, role } = useMe();
  const { isOnline } = useIndexedDB();

  const {
    getCurrentSale,
    getSalesHistory,
    createSale,
    activeSalesLoading,
    salesHistoryLoading,
  } = useSales(selectedStoreId || "", user?.id || "", role || "");

  if (activeSalesLoading) return <Loader loading={true} />;

  return (
    <div className="space-y-6">
      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium">Offline Mode</p>
            <p className="text-sm text-muted-foreground">
              Sales will sync when connection is restored. Currently saving to
              local storage.
            </p>
          </div>
        </div>
      )}

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
        </div>

        {/* Right: Dashboard & History */}
        <div className="space-y-6">
          <SalesHistoryPanel
            storeId={selectedStoreId || ""}
            salesHistory={getSalesHistory()}
            loading={salesHistoryLoading}
          />
        </div>
      </div>
      <SalesDashboard storeId={selectedStoreId || ""} />
    </div>
  );
}
