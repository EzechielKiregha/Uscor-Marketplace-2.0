// app/business/inventory/_components/TransferOrders.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_TRANSFER_ORDERS,
  CREATE_TRANSFER_ORDER,
  MARK_TRANSFER_ORDER_RECEIVED
} from '@/graphql/inventory.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  ArrowRightLeft,
  Warehouse,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  X,
  Package,
  Minus
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_STORES } from '@/graphql/store.gql';
import { GET_PRODUCTS } from '@/graphql/product.gql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/seraui/Loader';
import { useMe } from '@/lib/useMe';

interface TransferOrdersProps {
  storeId: string;
  transferOrders: any[];
  loading: boolean;
}

export default function TransferOrders({
  storeId,
  transferOrders,
  loading
}: TransferOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [toStoreId, setToStoreId] = useState('');
  const [fromStoreId, setFromStoreId] = useState(storeId);
  const { showToast } = useToast()
  const user = useMe();

  const {
    data: storesData,
    loading: storesLoading
  } = useQuery(GET_STORES, {
    variables: {
      businessId: user?.id
    },
    skip: !storeId
  });

  const {
    data: productsData,
    loading: productsLoading
  } = useQuery(GET_PRODUCTS, {
    variables: {
      storeId: fromStoreId
    },
    skip: !fromStoreId
  });

  const [createTransferOrder] = useMutation(CREATE_TRANSFER_ORDER);
  const [markOrderReceived] = useMutation(MARK_TRANSFER_ORDER_RECEIVED);

  const filteredOrders = transferOrders.filter(order =>
    order.id.includes(searchQuery) ||
    order.fromStore?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.toStore?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.products.some((p: any) => p.product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'IN_TRANSIT':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Transit</span>;
      case 'RECEIVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Received</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0 || !toStoreId || !fromStoreId) {
      showToast('error', 'Error', 'Please fill all required fields');
      return;
    }

    try {
      await createTransferOrder({
        variables: {
          input: {
            fromStoreId,
            toStoreId,
            products: selectedProducts.map(p => ({
              productId: p.id,
              quantity: p.quantity
            }))
          }
        }
      });

      showToast('success', 'Success', 'Transfer order created');
      setShowCreateModal(false);
      setSelectedProducts([]);
      setToStoreId('');
    } catch (error) {
      showToast('error', 'Error', 'Failed to create transfer order');
    }
  };

  const handleMarkReceived = async (orderId: string) => {
    try {
      await markOrderReceived({
        variables: {
          id: orderId
        }
      });

      showToast('success', 'Success', 'Transfer marked as received');
      setSelectedOrder(null);
    } catch (error) {
      showToast('error', 'Error', 'Failed to mark transfer as received');
    }
  };

  // Filter stores for transfer (can't transfer to same store)
  const transferableStores = storesData?.stores?.filter((store: any) => store.id !== fromStoreId) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Transfer Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Manage inventory transfers between stores</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search transfers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Button
              variant="default"
              onClick={() => {
                setShowCreateModal(true);
                setFromStoreId(storeId);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading || storesLoading || productsLoading ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No matching transfers found' : 'No transfer orders yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Transfer ID</th>
                  <th className="py-3 font-medium">From Store</th>
                  <th className="py-3 font-medium">To Store</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Items</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3">{order.id.substring(0, 8)}...</td>
                    <td className="py-3">{order.fromStore?.name}</td>
                    <td className="py-3">{order.toStore?.name}</td>
                    <td className="py-3">{getStatusBadge(order.status)}</td>
                    <td className="py-3">{order.products.length}</td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Create Transfer Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Create Transfer Order</h2>
                  <p className="text-sm text-muted-foreground mt-1">Transfer inventory between stores</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedProducts([]);
                    setToStoreId('');
                    setFromStoreId(storeId);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From Store</label>
                    <select
                      title='from store ID'
                      value={fromStoreId}
                      onChange={(e) => setFromStoreId(e.target.value)}
                      className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                    >
                      {storesData?.stores?.map((store: any) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To Store</label>
                    <select
                      title='to store ID'
                      value={toStoreId}
                      onChange={(e) => setToStoreId(e.target.value)}
                      className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                    >
                      <option value="">Select destination store</option>
                      {transferableStores.map((store: any) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium">Products</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Logic to add products
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </div>

                  {selectedProducts.length === 0 ? (
                    <div className="text-center py-6 border border-orange-400/60 dark:border-orange-500/70 rounded-lg">
                      <ArrowRightLeft className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No products added yet</p>
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => {
                          // Logic to add products
                        }}
                      >
                        Add Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 border border-orange-400/60 dark:border-orange-500/70 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedProducts(prev =>
                                  prev.map(p =>
                                    p.id === product.id
                                      ? { ...p, quantity: Math.max(1, p.quantity - 1) }
                                      : p
                                  )
                                );
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{product.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedProducts(prev =>
                                  prev.map(p =>
                                    p.id === product.id
                                      ? { ...p, quantity: p.quantity + 1 }
                                      : p
                                  )
                                );
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setSelectedProducts(prev =>
                                  prev.filter(p => p.id !== product.id)
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedProducts([]);
                      setToStoreId('');
                      setFromStoreId(storeId);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={handleCreateOrder}
                    disabled={!toStoreId}
                  >
                    Create Transfer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Transfer Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">#{selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    From Store
                  </h3>
                  <p>{selectedOrder.fromStore?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.fromStore?.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    To Store
                  </h3>
                  <p>{selectedOrder.toStore?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.toStore?.address}</p>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Products</h3>
              <div className="space-y-3 mb-6">
                {selectedOrder.products.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center font-bold pt-2">
                  <span>Status</span>
                  <span>{selectedOrder.status}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={() => handleMarkReceived(selectedOrder.id)}
                  >
                    Mark as Received
                  </Button>
                )}
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}