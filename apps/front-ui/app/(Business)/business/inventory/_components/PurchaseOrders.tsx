// app/business/inventory/_components/PurchaseOrders.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PURCHASE_ORDERS,
  CREATE_PURCHASE_ORDER,
  MARK_PURCHASE_ORDER_RECEIVED
} from '@/graphql/inventory.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Pencil,
  X,
  Minus
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_PRODUCTS } from '@/graphql/product.gql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';

interface PurchaseOrdersProps {
  storeId: string;
  purchaseOrders: any[];
  loading: boolean;
}

export default function PurchaseOrders({
  storeId,
  purchaseOrders,
  loading
}: PurchaseOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const { showToast } = useToast()
  const user = useMe();

  const {
    data: productsData,
    loading: productsLoading
  } = useQuery(GET_PRODUCTS, {
    variables: {
      storeId
    },
    skip: !storeId
  });

  // const {
  //   data: suppliersData,
  //   loading: suppliersLoading
  // } = useQuery(GET_SUPPLIERS, {
  //   variables: {
  //     businessId: user?.id
  //   },
  //   skip: !storeId
  // });

  const [createPurchaseOrder] = useMutation(CREATE_PURCHASE_ORDER);
  const [markOrderReceived] = useMutation(MARK_PURCHASE_ORDER_RECEIVED);

  const filteredOrders = purchaseOrders.filter(order =>
    order.id.includes(searchQuery) ||
    order.supplierId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.products.some((p: any) => p.product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'PROCESSING':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Processing</span>;
      case 'RECEIVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Received</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0 || !supplierId || !expectedDelivery) {
      showToast('error', 'Error', 'Please fill all required fields');
      return;
    }

    try {
      await createPurchaseOrder({
        variables: {
          input: {
            businessId: user?.id,
            storeId,
            supplierId,
            expectedDelivery,
            products: selectedProducts.map(p => ({
              productId: p.id,
              quantity: p.quantity
            }))
          }
        }
      });

      showToast('success', 'Success', 'Purchase order created');
      setShowCreateModal(false);
      setSelectedProducts([]);
      setSupplierId('');
      setExpectedDelivery('');
    } catch (error) {
      showToast('error', 'Error', 'Failed to create purchase order');
    }
  };

  const handleMarkReceived = async (orderId: string) => {
    try {
      await markOrderReceived({
        variables: {
          id: orderId,
          receivedItems: selectedOrder.products.map((p: any) => ({
            productId: p.productId,
            quantity: p.quantity
          }))
        }
      });

      showToast('success', 'Success', 'Order marked as received');
      setSelectedOrder(null);
    } catch (error) {
      showToast('error', 'Error', 'Failed to mark order as received');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Purchase Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Manage supplier orders and deliveries</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Button
              variant="default"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading || productsLoading ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No matching orders found' : 'No purchase orders yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Order ID</th>
                  <th className="py-3 font-medium">Supplier</th>
                  <th className="py-3 font-medium">Expected Delivery</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Items</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3">{order.id.substring(0, 8)}...</td>
                    <td className="py-3">{order.supplierId || 'N/A'}</td>
                    <td className="py-3">{new Date(order.expectedDelivery).toLocaleDateString()}</td>
                    <td className="py-3">{getStatusBadge(order.status)}</td>
                    <td className="py-3">{order.products.length}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                        {order.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCreateModal(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Purchase Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder ? `Order #${selectedOrder.id.substring(0, 8)}` : 'Add a new supplier order'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedOrder(null);
                    setSelectedProducts([]);
                    setSupplierId('');
                    setExpectedDelivery('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier</label>
                    {/* <select
                      title='supplier ID'
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-md"
                      disabled={selectedOrder && selectedOrder.status !== 'PENDING'}
                    >
                      <option value="">Select a supplier</option>
                      {suppliersData?.suppliers?.map((supplier: any) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select> */}
                    <Input
                      type="text"
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      disabled={selectedOrder && selectedOrder.status !== 'PENDING'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Delivery</label>
                    <Input
                      type="date"
                      value={expectedDelivery}
                      onChange={(e) => setExpectedDelivery(e.target.value)}
                      disabled={selectedOrder && selectedOrder.status !== 'PENDING'}
                    />
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
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
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
                      setSelectedOrder(null);
                      setSelectedProducts([]);
                      setSupplierId('');
                      setExpectedDelivery('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={handleCreateOrder}
                  >
                    {selectedOrder ? 'Update Order' : 'Create Order'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && !showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">#{selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedOrder.status)}
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedOrder.expectedDelivery).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Supplier</h3>
                  <p>{selectedOrder.supplierId || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Store</h3>
                  <p>{selectedOrder.store?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.store?.address}</p>
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
                <div className="flex justify-between items-center mb-2">
                  <span>Expected Delivery</span>
                  <span>{new Date(selectedOrder.expectedDelivery).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center font-bold pt-2 border-t border-border">
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