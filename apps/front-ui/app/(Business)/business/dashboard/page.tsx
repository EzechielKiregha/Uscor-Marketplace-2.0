'use client';

import { useQuery } from '@apollo/client';
import Loader from '@/components/seraui/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, ShoppingCart, MessageSquare, Plus, Search } from 'lucide-react';
import { GET_BUSINESS_DASHBOARD } from '@/graphql/business.gql';
import { OrderEntity, ProductEntity, SaleEntity, StoreEntity } from '@/lib/types';
import { useMe } from '@/lib/useMe';
import { useOpenOrderDetailsModal } from '../_hooks/use-open-order-details-modal';
import { useEffect, useState } from 'react';
import { GET_BUSINESS_ORDERS } from '@/graphql/order.gql';
import { Button } from '@/components/ui/button';
import SalesDashboard from '../sales/_components/SalesDashboard';
import { GET_STORES } from '@/graphql/store.gql';
import CreateStoreModal from '../_components/modals/CreateStoreModal';
import { useOpenCreateStoreModal } from '../_hooks/use-open-create-store-modal';
import OrderDetailsModal from './orders/_components/OrderDetailsModal';
import { useToast } from '@/components/toast-provider';
import { useRouter } from 'next/navigation';

export default function BusinessDashboardPage() {
  const { isOpen: isOpenOrder, setIsOpen: setIsOpenOrder } = useOpenOrderDetailsModal();
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  // Calculate store statistics
  const [totalSales, setTotalSales] = useState<number>(0)
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<number>(0);
  const user = useMe();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const route = useRouter()
  const [ordersCount, setOdersCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const router = useRouter()

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES);

  const { data, loading, error, refetch } = useQuery(GET_BUSINESS_ORDERS, {
    variables: {
      businessId: user?.id,
      search: searchTerm,
      status: statusFilter || undefined,
      date: dateFilter || undefined
    }
  });
  const { data: businessData, loading: businessDataLoading, error: businessDataErro } = useQuery(GET_BUSINESS_DASHBOARD);

  // Auto-select first store if none selected
  useEffect(() => {
    if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  // Calculate statistics for all stores combined
  useEffect(() => {
    if (storesData?.stores && businessData?.businessDashboard) {
      let totalSalesCount = 0;
      let totalRevenueAmount = 0;
      let totalProductsCount = 0;
      let lowStockCount = 0;

      // Loop through all stores to aggregate data
      storesData.stores.forEach((store: StoreEntity) => {
        // Aggregate sales
        totalSalesCount += store.sales?.length || 0;

        // Aggregate revenue
        const storeRevenue = store.sales?.reduce((sum: number, sale: SaleEntity) =>
          sum + (sale.totalAmount || 0), 0) || 0;
        totalRevenueAmount += storeRevenue;

        // Aggregate products
        totalProductsCount += store.products?.length || 0;

        // Aggregate low stock products
        const storeLowStock = store.products?.filter((product: ProductEntity) =>
          product.quantity < product.minQuantity).length || 0;
        lowStockCount += storeLowStock;
      });

      // Calculate orders statistics
      data?.businessOrders.items.forEach((order: OrderEntity) => {
        if (order.payment?.status === 'PENDING') {
          setPendingOrdersCount((prev) => prev + 1);
        } else if (order.payment?.status === 'COMPLETED') {
          setCompletedOrdersCount((prev) => prev + 1);
        }
        setOdersCount((prev) => prev + 1);
      });

      // Update state with aggregated values
      setTotalSales(totalSalesCount);
      setTotalProducts(totalProductsCount);
      setTotalRevenue(totalRevenueAmount);
      setLowStockProducts(lowStockCount);
    }

  }, [storesData, businessData, data]);

  useEffect(() => {
    if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Processing</span>;
      case 'SHIPPED':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Shipped</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">{status}</span>;
    }
  };

  if (loading || businessDataLoading || storesLoading) return (
    <Loader loading={true} />
  )
  if (error || businessDataErro || storesError) return <div>Error loading dashboard</div>;

  const stats = businessData.businessDashboard.stats;
  const salesData = businessData.businessDashboard.salesData;
  localStorage.setItem("unreadMessages", stats.unreadMessages)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +{((totalRevenue / totalSales) * 100).toFixed(2)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrdersCount} pending, {completedOrdersCount} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts} low stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMessages} total messages
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col justify-between sm:flex-row gap-3 w-full sm:w-auto">
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

        <Button
          variant="default"
          size="sm"
          onClick={() => {
            route.push("/business/sales")
            showToast('success', 'Redirecting to new sale page', 'You are now redirecting to the point of sale page', false, 9000);
          }}
          disabled={!selectedStoreId}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Sales Chart */}
      {!storesData?.stores || storesData.stores.length === 0 ? (
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
              onClick={() => {
                showToast('success', 'Redirecting to store page', 'You are now redirecting to the store page', false, 9000);
                router.push("/business/stores?create=true")
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Store
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
          <SalesDashboard storeId={selectedStoreId || ''} />
        </>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-3 font-medium">Order ID</th>
              <th className="py-3 font-medium">Customer</th>
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Amount</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Items</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.businessOrders.items.map((order: OrderEntity) => (
              <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3">{order.id.substring(0, 8)}...</td>
                <td className="py-3">{order.client.email}</td>
                <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-3">${order.payment?.amount.toFixed(2)}</td>
                <td className="py-3">{getStatusBadge(order.payment?.status ?? 'Undefined')}</td>
                <td className="py-3">{order.products?.length}</td>
                <td className="py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpenOrder({ openOrderDetailsModal: true, orderId: order.id })}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Order Details Modal */}
      <OrderDetailsModal />
    </div>
  );
}