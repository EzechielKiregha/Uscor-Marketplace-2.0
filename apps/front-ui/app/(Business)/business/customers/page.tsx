// app/business/customers/page.tsx
"use client";

import MotionPage from "@/components/MotionPage";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GET_SALES_HISTORY } from "@/graphql/sales.gql";
import { GET_STORES } from "@/graphql/store.gql";
import { exportCustomersCSV } from "@/lib/export-utils";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import {
    ChevronDown,
    ChevronUp,
    DollarSign,
    Download,
    Search,
    ShoppingCart,
    Star,
    User,
    Users,
    X
} from "lucide-react";
import { useMemo, useState } from "react";

interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  lastPurchase: string;
  favoriteStore: string;
  topProducts: { title: string; qty: number }[];
  paymentMethods: string[];
}

export default function CustomersPage() {
  const { user, loading: authLoading } = useMe();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"totalSpent" | "orderCount" | "lastPurchase">(
    "totalSpent",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const { data: storesData, loading: storesLoading } = useQuery(GET_STORES);

  // Fetch sales history across all stores (or specific store)
  const { data: salesData, loading: salesLoading } = useQuery(GET_SALES_HISTORY, {
    variables: {
      storeId: selectedStoreId === "all" ? undefined : selectedStoreId,
      limit: 500,
      status: "COMPLETED",
    },
    skip: !user?.id,
  });

  const loading = authLoading || storesLoading || salesLoading;

  // Build customer records from sales data
  const customers = useMemo(() => {
    const sales = salesData?.salesHistory?.items || [];
    const customerMap: Record<string, CustomerRecord> = {};

    sales.forEach((sale: any) => {
      if (!sale.client?.id) return;

      const cId = sale.client.id;
      if (!customerMap[cId]) {
        customerMap[cId] = {
          id: cId,
          fullName: sale.client.fullName || "Unknown Customer",
          email: sale.client.email || "",
          totalSpent: 0,
          orderCount: 0,
          avgOrderValue: 0,
          lastPurchase: sale.createdAt,
          favoriteStore: sale.store?.name || "",
          topProducts: [],
          paymentMethods: [],
        };
      }

      const customer = customerMap[cId];
      customer.totalSpent += sale.totalAmount || 0;
      customer.orderCount += 1;

      // Track latest purchase
      if (new Date(sale.createdAt) > new Date(customer.lastPurchase)) {
        customer.lastPurchase = sale.createdAt;
      }

      // Track payment methods
      if (
        sale.paymentMethod &&
        !customer.paymentMethods.includes(sale.paymentMethod)
      ) {
        customer.paymentMethods.push(sale.paymentMethod);
      }

      // Track product frequency
      sale.saleProducts?.forEach((sp: any) => {
        const existing = customer.topProducts.find(
          (p) => p.title === sp.product?.title,
        );
        if (existing) {
          existing.qty += sp.quantity;
        } else if (sp.product?.title) {
          customer.topProducts.push({
            title: sp.product.title,
            qty: sp.quantity,
          });
        }
      });
    });

    // Calculate averages and sort products
    Object.values(customerMap).forEach((c) => {
      c.avgOrderValue = c.orderCount > 0 ? c.totalSpent / c.orderCount : 0;
      c.topProducts.sort((a, b) => b.qty - a.qty);
      c.topProducts = c.topProducts.slice(0, 5);
    });

    return Object.values(customerMap);
  }, [salesData]);

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortBy === "lastPurchase") {
        const diff =
          new Date(a.lastPurchase).getTime() -
          new Date(b.lastPurchase).getTime();
        return sortDir === "desc" ? -diff : diff;
      }
      const diff = (aVal as number) - (bVal as number);
      return sortDir === "desc" ? -diff : diff;
    });

    return result;
  }, [customers, searchQuery, sortBy, sortDir]);

  // Aggregate stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLifetimeValue =
    totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) return null;
    return sortDir === "desc" ? (
      <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronUp className="h-3 w-3" />
    );
  };

  const formatPaymentMethod = (method: string) => {
    const labels: Record<string, string> = {
      CASH: "Cash",
      MOBILE_MONEY: "Mobile Money",
      CARD: "Card",
      TOKEN: "Token",
      BANK_TRANSFER: "Bank",
    };
    return labels[method] || method;
  };

  if (loading) return <TableSkeleton />;

  return (
    <MotionPage className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-page-title flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Customer CRM
          </h1>
          <p className="text-page-subtitle">
            Customer insights, purchase history, and relationship management
          </p>
        </div>
        <select
          title="Filter by store"
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="w-full sm:w-64 p-2 border border-border hover:border-primary hover:bg-primary/5 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Stores</option>
          {storesData?.stores?.map((store: any) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-stat-label">Customers</span>
            </div>
            <p className="text-stat">{totalCustomers}</p>
            <p className="text-xs text-muted-foreground">unique buyers</p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-stat-label">Total Revenue</span>
            </div>
            <p className="text-stat">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">from all customers</p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-orange-500" />
              <span className="text-stat-label">Avg. Lifetime</span>
            </div>
            <p className="text-stat">${avgLifetimeValue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">per customer</p>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              <span className="text-stat-label">Repeat Buyers</span>
            </div>
            <p className="text-stat">{repeatCustomers}</p>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0
                ? ((repeatCustomers / totalCustomers) * 100).toFixed(0)
                : 0}
              % return rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCustomersCSV(filteredCustomers)}
          disabled={filteredCustomers.length === 0}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Export CSV
        </Button>
      </div>
      <div className="relative w-full sm:w-80">
        <Input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Customer Table */}
      <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Completed sales with customer info will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th
                      className="py-3 px-4 font-medium cursor-pointer select-none"
                      onClick={() => toggleSort("totalSpent")}
                    >
                      <span className="flex items-center gap-1">
                        Total Spent <SortIcon field="totalSpent" />
                      </span>
                    </th>
                    <th
                      className="py-3 px-4 font-medium cursor-pointer select-none"
                      onClick={() => toggleSort("orderCount")}
                    >
                      <span className="flex items-center gap-1">
                        Orders <SortIcon field="orderCount" />
                      </span>
                    </th>
                    <th className="py-3 px-4 font-medium">Avg Order</th>
                    <th
                      className="py-3 px-4 font-medium cursor-pointer select-none"
                      onClick={() => toggleSort("lastPurchase")}
                    >
                      <span className="flex items-center gap-1">
                        Last Purchase <SortIcon field="lastPurchase" />
                      </span>
                    </th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <>
                      <tr
                        key={customer.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {customer.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {customer.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">
                            ${customer.totalSpent.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{customer.orderCount}</td>
                        <td className="py-3 px-4">
                          ${customer.avgOrderValue.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(customer.lastPurchase).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedCustomer(
                                expandedCustomer === customer.id
                                  ? null
                                  : customer.id,
                              )
                            }
                          >
                            {expandedCustomer === customer.id
                              ? "Hide"
                              : "Details"}
                          </Button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedCustomer === customer.id && (
                        <tr key={`${customer.id}-details`}>
                          <td colSpan={6} className="px-4 py-4 bg-muted/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Top Products */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2">
                                  Top Products
                                </h4>
                                {customer.topProducts.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {customer.topProducts.map((p, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span className="truncate max-w-[160px]">
                                          {p.title}
                                        </span>
                                        <span className="text-muted-foreground">
                                          x{p.qty}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No product data
                                  </p>
                                )}
                              </div>

                              {/* Payment Preferences */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2">
                                  Payment Methods Used
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {customer.paymentMethods.map((method) => (
                                    <span
                                      key={method}
                                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                    >
                                      {formatPaymentMethod(method)}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Quick Stats */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2">
                                  Customer Summary
                                </h4>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Lifetime Value
                                    </span>
                                    <span className="font-medium">
                                      ${customer.totalSpent.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      First Purchase
                                    </span>
                                    <span className="font-medium">
                                      {customer.orderCount > 0
                                        ? `${customer.orderCount} orders`
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Repeat Buyer
                                    </span>
                                    <span
                                      className={`font-medium ${customer.orderCount > 1 ? "text-green-600" : "text-muted-foreground"}`}
                                    >
                                      {customer.orderCount > 1 ? "Yes" : "No"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Count */}
      {filteredCustomers.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredCustomers.length} of {totalCustomers} customer
          {totalCustomers !== 1 ? "s" : ""}
        </p>
      )}
    </MotionPage>
  );
}
