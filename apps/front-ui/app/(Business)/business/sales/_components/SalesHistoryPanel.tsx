"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar, Download, Eye, Filter, Package, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ReceiptGenerator from "./ReceiptGenerator";

interface SalesHistoryPanelProps {
  salesHistory: any[];
  loading: boolean;
}

export default function SalesHistoryPanel({
  salesHistory,
  loading,
}: SalesHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, _setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const filteredSales = useMemo(() => {
    if (!salesHistory) return [];

    return salesHistory.filter((sale) => {
      // Apply search filter
      const matchesSearch =
        !searchQuery ||
        sale.id.includes(searchQuery) ||
        sale.client?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Apply date filter
      const saleDate = new Date(sale.createdAt);
      const matchesDate =
        (!dateRange.start || saleDate >= dateRange.start) &&
        (!dateRange.end || saleDate <= dateRange.end);

      return matchesSearch && matchesDate;
    });
  }, [salesHistory, searchQuery, dateRange]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Completed
          </span>
        );
      case "OPEN":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Processing
          </span>
        );
      case "RETURNED":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            Returned
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border hover:border-primary hover:bg-primary/5 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Sales</CardTitle>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {filteredSales.length === 0 ? (
            <EmptyState
              icon={emptyStateIcons.sales}
              title={searchQuery || dateRange.start || dateRange.end ? "No matching sales found" : "No sales history available"}
              description="Sales will appear here as they are completed"
              compact
            />
          ) : (
            <div className="space-y-3 max-h-75 overflow-y-auto">
              {filteredSales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="border border-border hover:border-primary hover:bg-primary/5 rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedSale(sale)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          #{sale.id.substring(0, 8)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sale.client?.fullName || "Walk-in Customer"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${sale.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(sale.createdAt), "MMM d, yyyy")}
                      </p>
                      {getStatusBadge(sale.status)}
                      {sale.receiptUrl && (
                        <Button type="button" size="sm" variant="link">
                          <Eye className="w-4 h-4 mr-1" />
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredSales.length > 5 && (
            <div className="mt-3 text-center">
              <Button variant="ghost" className="w-full">
                View All Sales
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border hover:border-primary hover:bg-primary/5 rounded-lg w-full max-w-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Sale Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    #{selectedSale.id.substring(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedSale.status)}
                  <p className="text-sm font-medium mt-1">
                    ${selectedSale.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer</h3>
                  <p>{selectedSale.client?.fullName || "Walk-in Customer"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSale.client?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Date & Time</h3>
                  <p>{format(new Date(selectedSale.createdAt), "PPP p")}</p>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-2 mb-6">
                {selectedSale.saleProducts.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal</span>
                  <span>${selectedSale.totalAmount.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-destructive">
                    <span>Discount</span>
                    <span>-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${selectedSale.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setSelectedSale(null)}>
                  Close
                </Button>
                {selectedSale.receiptUrl ? (
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleView(selectedSale.receiptUrl)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Receipt
                  </Button>
                ) : (
                  <ReceiptGenerator
                    saleId={selectedSale.id}
                    clientEmail={selectedSale.client?.email}
                    onReceiptGenerated={(receipt) => {
                      console.log("Receipt generated:", receipt);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
