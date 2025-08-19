// app/business/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STORES } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import InventorySummary from './_components/InventorySummary';
import StockManagement from './_components/StockManagement';
import PurchaseOrders from './_components/PurchaseOrders';
import TransferOrders from './_components/TransferOrders';
import { useOpenCreateStoreModal } from '../_hooks/use-open-create-store-modal';
import { useMe } from '@/lib/useMe';
import { useInventory } from '../_hooks/use-inventory';

export default function InventoryManagementPage() {
  const { user, role, loading: authLoading } = useMe();
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stock' | 'purchase' | 'transfer'>('stock');

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES, {
    variables: { businessId: user?.id },
    skip: !user?.id
  });

  const {
    getInventory,
    getPurchaseOrders,
    getTransferOrders,
    inventoryLoading,
    purchaseOrdersLoading,
    transferOrdersLoading
  } = useInventory(selectedStoreId || '', user?.id || '');

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
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Stores Found</h2>
          <p className="text-muted-foreground mb-6">
            You need to create at least one store before you can manage inventory
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
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage stock levels, purchase orders, and transfers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            title='selected store ID'
            value={selectedStoreId || ''}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-64 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {storesData.stores.map((store: any) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.address ? `• ${store.address}` : ''}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            <Button
              variant={activeTab === 'stock' ? 'default' : 'outline'}
              onClick={() => setActiveTab('stock')}
            >
              Stock
            </Button>
            <Button
              variant={activeTab === 'purchase' ? 'default' : 'outline'}
              onClick={() => setActiveTab('purchase')}
            >
              Purchase Orders
            </Button>
            <Button
              variant={activeTab === 'transfer' ? 'default' : 'outline'}
              onClick={() => setActiveTab('transfer')}
            >
              Transfer Orders
            </Button>
          </div>

          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'stock' && 'Adjust Stock'}
            {activeTab === 'purchase' && 'New Order'}
            {activeTab === 'transfer' && 'New Transfer'}
          </Button>
        </div>
      </div>

      {/* Inventory Summary */}
      <InventorySummary storeId={selectedStoreId || ''} />

      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === 'stock' && (
          <StockManagement
            storeId={selectedStoreId || ''}
            inventory={getInventory()}
            loading={inventoryLoading}
          />
        )}

        {activeTab === 'purchase' && (
          <PurchaseOrders
            storeId={selectedStoreId || ''}
            purchaseOrders={getPurchaseOrders()}
            loading={purchaseOrdersLoading}
          />
        )}

        {activeTab === 'transfer' && (
          <TransferOrders
            storeId={selectedStoreId || ''}
            transferOrders={getTransferOrders()}
            loading={transferOrdersLoading}
          />
        )}
      </div>
    </div>
  );
}