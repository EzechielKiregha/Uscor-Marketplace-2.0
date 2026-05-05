"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  AlertTriangle,
  Camera,
  Clock,
  CreditCard,
  Loader2,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ADD_SALE_PRODUCT,
  COMPLETE_SALE,
  GET_WORKER_CURRENT_SALE,
  GET_WORKER_INVENTORY,
  ON_INVENTORY_UPDATED,
  ON_SALE_CREATED,
  PROCESS_MOBILE_MONEY_PAYMENT,
  REMOVE_SALE_PRODUCT,
} from "@/graphql/worker.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useMe } from "@/lib/useMe";
import { useInventory } from "@/app/(Business)/business/_hooks/use-inventory";
import { useSales } from "@/app/(Business)/business/_hooks/use-sales";
import CurrentSalePanel from "@/app/(Business)/business/sales/_components/CurrentSalePanel";
import SalesDashboard from "@/app/(Business)/business/sales/_components/SalesDashboard";
import SalesHistoryPanel from "@/app/(Business)/business/sales/_components/SalesHistoryPanel";

interface PosPageProps {
  selectedStoreId: string | null;
}

export default function PosPage({ selectedStoreId }: PosPageProps) {
  const { user, role } = useMe();
  const { isOnline, getLocalSales } = useIndexedDB();

  const [currentSale, setCurrentSale] = useState<any>(null);
  const [_offlineQueue, _setOfflineQueue] = useState<any[]>([]);

  // Auto-sync when coming online
  useEffect(() => {
    if (!isOnline) {
      setCurrentSale(getLocalSales());
    }
  }, [isOnline, getLocalSales]);

  const {
    getCurrentSale,
    getSalesHistory,
    createSale,
    activeSalesLoading,
    salesHistoryLoading,
  } = useSales(selectedStoreId || "", user?.id || "", role || "");

  useEffect(() => {
    if (!currentSale && !activeSalesLoading) {
      setCurrentSale(getCurrentSale());
    }
  });

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
            currentSale={currentSale}
            onCompleteSale={setCurrentSale}
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
