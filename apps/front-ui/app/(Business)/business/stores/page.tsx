'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_STORES, DELETE_STORE } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Building, Pencil, Trash2, Plus, Search, Package, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { useOpenCreateStoreModal } from '../_hooks/use-open-create-store-modal';
import { StoreEntity } from '@/lib/types';
import { useMe } from '@/lib/useMe';
import CreateStoreModal from '../_components/modals/CreateStoreModal';
import { useRouter } from 'next/navigation';

export default function BusinessStoresPage() {
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast()
  const router = useRouter()

  const { data, loading, error, refetch } = useQuery(GET_STORES);

  const [deleteStore] = useMutation(DELETE_STORE, {
    refetchQueries: [GET_STORES]
  });

  const handleDelete = async (storeId: string) => {
    if (confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      try {
        await deleteStore({ variables: { id: storeId } });
        showToast('success', 'Success', 'Store deleted successfully');
      } catch (error: any) {
        showToast('error', 'Error', error.message);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader loading={true} />
    </div>
  )
  if (error) return <div>Error loading stores: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-muted-foreground">Manage your store locations</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Button onClick={() => setIsOpen({ openCreateStoreModal: true, initialStoreData: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.stores.map((store: StoreEntity) => {
          // Calculate store statistics
          const totalSales = store.sales?.length || 0;
          const totalProducts = store.products?.length || 0;
          const totalRevenue = store.sales?.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) || 0;
          const lowStockProducts = store.products?.filter(product => product.quantity < product.minQuantity).length || 0;

          return (
            <div key={store.id} className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-foreground">{store.name}</h3>
                </div>

                {store.address && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{store.address}</p>
                )}

                {/* Store Statistics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sales</p>
                      <p className="font-semibold text-sm">{totalSales}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-sm">${totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Package className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Products</p>
                      <p className="font-semibold text-sm">{totalProducts}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <AlertTriangle className={`h-4 w-4 ${lowStockProducts > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Low Stock</p>
                      <p className={`font-semibold text-sm ${lowStockProducts > 0 ? 'text-red-500' : ''}`}>
                        {lowStockProducts}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(store.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setIsOpen({
                            openCreateStoreModal: true,
                            initialStoreData: {
                              id: store.id,
                              name: store.name,
                              address: store.address || ''
                            }
                          })
                          router.push("/business/stores?edit=true")
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(store.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {data.stores.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No stores yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first store location</p>
          <Button onClick={() => {
            setIsOpen({ openCreateStoreModal: true, initialStoreData: null })
            router.push("/business/stores?create=true")
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Store
          </Button>
        </div>
      )}

      {/* Create Store Modal */}
      <CreateStoreModal />
    </div>
  );
}