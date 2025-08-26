// app/business/sales/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STORES } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  CreditCard,
  BarChart,
  Search,
  Plus,
  ArrowLeft,
  Receipt,
  ArrowRightLeft
} from 'lucide-react';
import { useOpenCreateStoreModal } from '../_hooks/use-open-create-store-modal';
import { useMe } from '@/lib/useMe';
import { useSales } from '../_hooks/use-sales';
import { StoreEntity } from '@/lib/types';
import CurrentSalePanel from './_components/CurrentSalePanel';
import SalesDashboard from './_components/SalesDashboard';
import SalesHistoryPanel from './_components/SalesHistoryPanel';

export default function SalesManagementPage() {
  const { user, role, loading: authLoading } = useMe();
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES);

  const {
    getCurrentSale,
    getSalesHistory,
    createSale,
    activeSalesLoading,
    salesHistoryLoading
  } = useSales(selectedStoreId || '');

  // Auto-select first store if none selected
  useEffect(() => {
    if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  if (authLoading || storesLoading) return <Loader loading={true} />;
  if (storesError) return <div>Error loading stores: {storesError.message}</div>;
  if (!storesData?.stores || storesData.stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <div className="text-center max-w-md">
          <div className="bg-muted/50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Stores Found</h2>
          <p className="text-muted-foreground mb-6">
            You need to create at least one store before you can process sales
          </p>
          <Button
            onClick={() => setIsOpen({
              openCreateStoreModal: true,
              initialStoreData: null
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Process sales and manage transactions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            title='selected store ID'
            value={selectedStoreId || ''}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-64 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {storesData.stores.map((store: StoreEntity) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.address ? `• ${store.address}` : ''}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={createSale}
            disabled={!selectedStoreId}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Main POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Sale Panel */}
        <div className="lg:col-span-2">
          <CurrentSalePanel
            storeId={selectedStoreId || ''}
            currentSale={getCurrentSale()}
            onNewSale={createSale}
          />
        </div>

        {/* Right: Dashboard & History */}
        <div className="space-y-6">
          <SalesDashboard storeId={selectedStoreId || ''} />
          <SalesHistoryPanel
            storeId={selectedStoreId || ''}
            salesHistory={getSalesHistory()}
            loading={salesHistoryLoading}
          />
        </div>
      </div>
    </div>
  );
}