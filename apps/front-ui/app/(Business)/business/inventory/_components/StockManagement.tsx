// app/business/inventory/_components/StockManagement.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_INVENTORY,
  CREATE_INVENTORY_ADJUSTMENT
} from '@/graphql/inventory.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  Minus,
  Pencil,
  X
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_PRODUCTS } from '@/graphql/product.gql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductEntity } from '@/lib/types';

interface StockManagementProps {
  storeId: string;
  inventory: any[];
  loading: boolean;
}

export default function StockManagement({
  storeId,
  inventory,
  loading
}: StockManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const { showToast } = useToast()

  const {
    data: productsData,
    loading: productsLoading,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      storeId
    },
    skip: !storeId
  });

  const [createInventoryAdjustment] = useMutation(CREATE_INVENTORY_ADJUSTMENT);

  const filteredInventory = inventory.filter(item =>
    item.product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustStock = async () => {
    if (!selectedItem || quantity <= 0) return;

    try {
      await createInventoryAdjustment({
        variables: {
          input: {
            productId: selectedItem.productId,
            storeId: selectedItem.storeId,
            adjustmentType,
            quantity: adjustmentType === 'ADD' ? quantity : -quantity,
            reason: reason || 'Manual adjustment'
          }
        }
      });

      showToast('success', 'Success', 'Inventory adjusted successfully');
      setShowAdjustModal(false);
      setSelectedItem(null);
      setQuantity(1);
      setReason('');
    } catch (error) {
      showToast('error', 'Error', 'Failed to adjust inventory');
    }
  };

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) {
      return {
        status: 'out-of-stock',
        label: 'Out of Stock',
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      };
    }
    if (item.quantity < item.minQuantity) {
      return {
        status: 'low-stock',
        label: 'Low Stock',
        icon: <AlertTriangle className="h-4 w-4 text-warning" />
      };
    }
    return {
      status: 'in-stock',
      label: 'In Stock',
      icon: <Package className="h-4 w-4 text-success" />
    };
  };

  if (loading || productsLoading) return (
    <Card>
      <CardContent className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Stock Management</CardTitle>
            <p className="text-sm text-muted-foreground">Manage your product inventory levels</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Button
              variant="default"
              onClick={() => {
                setSelectedItem(null);
                setShowAdjustModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredInventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No matching products found' : 'No inventory items available'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Product</th>
                  <th className="py-3 font-medium">Current Stock</th>
                  <th className="py-3 font-medium">Min Stock Level</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product.title}</p>
                            <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-medium">{item.quantity}</td>
                      <td className="py-3">{item.minQuantity}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {status.icon}
                          <span className={`${status.status === 'out-of-stock' ? 'text-destructive' :
                            status.status === 'low-stock' ? 'text-warning' : 'text-success'
                            }`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowAdjustModal(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedItem ? `Adjust Stock: ${selectedItem.product.title}` : 'Adjust Stock'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedItem ? `Current: ${selectedItem.quantity} units` : 'Select a product to adjust'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedItem(null);
                    setQuantity(1);
                    setReason('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!selectedItem ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Select a product to adjust:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {productsData?.products?.items?.map((product: ProductEntity) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          const inventoryItem = inventory.find(i => i.productId === product.id);
                          setSelectedItem(inventoryItem || {
                            productId: product.id,
                            storeId: storeId,
                            quantity: 0,
                            minQuantity: 5,
                            product: product
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {product.medias[0].url ? (
                            <img
                              src={product.medias[0].url}
                              alt={product.title}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {inventory.find(i => i.productId === product.id)?.quantity || 0} in stock
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{selectedItem.product.title}</p>
                      <p className="text-sm text-muted-foreground">${selectedItem.product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{selectedItem.quantity}</p>
                      <p className="text-sm text-muted-foreground">Current Stock</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button
                        variant={adjustmentType === 'ADD' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAdjustmentType('ADD')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stock
                      </Button>
                      <Button
                        variant={adjustmentType === 'REMOVE' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAdjustmentType('REMOVE')}
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Remove Stock
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Reason</label>
                      <Input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Delivery received, Damaged items"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAdjustModal(false);
                        setSelectedItem(null);
                        setQuantity(1);
                        setReason('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary hover:bg-accent text-primary-foreground"
                      onClick={handleAdjustStock}
                    >
                      Confirm Adjustment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}