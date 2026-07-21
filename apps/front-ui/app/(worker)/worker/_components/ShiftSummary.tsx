"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Banknote,
    Clock,
    CreditCard,
    DollarSign,
    Package,
    Printer,
    Receipt,
    Smartphone,
    TrendingUp,
    X,
} from "lucide-react";
import { useMemo } from "react";

// ─── Types ─────────────────────────────────────────────

interface ShiftSale {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  saleProducts?: Array<{
    productId: string;
    quantity: number;
    price: number;
    product?: {
      id: string;
      title: string;
    };
  }>;
  createdAt: string;
}

interface ShiftData {
  id: string;
  startTime: string;
  endTime?: string;
  sales: number;
  transactionCount?: number;
}

interface ShiftSummaryProps {
  shift: ShiftData;
  shiftSales: ShiftSale[];
  onClose: () => void;
  onPrint?: () => void;
}

// ─── Helpers ───────────────────────────────────────────

function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function getPaymentIcon(method: string) {
  switch (method) {
    case "CASH":
      return Banknote;
    case "CARD":
      return CreditCard;
    case "MOBILE_MONEY":
      return Smartphone;
    case "TOKEN":
      return DollarSign;
    default:
      return Receipt;
  }
}

function getPaymentLabel(method: string): string {
  switch (method) {
    case "CASH":
      return "Cash";
    case "CARD":
      return "Card";
    case "MOBILE_MONEY":
      return "Mobile Money";
    case "TOKEN":
      return "Token";
    default:
      return method;
  }
}

// ─── Component ─────────────────────────────────────────

export default function ShiftSummary({
  shift,
  shiftSales,
  onClose,
  onPrint,
}: ShiftSummaryProps) {
  // Payment breakdown
  const paymentBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; total: number }> = {};
    for (const sale of shiftSales) {
      const method = sale.paymentMethod || "UNKNOWN";
      if (!breakdown[method]) {
        breakdown[method] = { count: 0, total: 0 };
      }
      breakdown[method].count++;
      breakdown[method].total += sale.totalAmount;
    }
    return Object.entries(breakdown).sort((a, b) => b[1].total - a[1].total);
  }, [shiftSales]);

  // Top products
  const topProducts = useMemo(() => {
    const productMap: Record<
      string,
      { title: string; totalQty: number; totalRevenue: number }
    > = {};

    for (const sale of shiftSales) {
      for (const sp of sale.saleProducts || []) {
        const key = sp.productId;
        if (!productMap[key]) {
          productMap[key] = {
            title: sp.product?.title || "Unknown Product",
            totalQty: 0,
            totalRevenue: 0,
          };
        }
        productMap[key].totalQty += sp.quantity;
        productMap[key].totalRevenue += sp.price * sp.quantity;
      }
    }

    return Object.values(productMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [shiftSales]);

  // Totals
  const totalRevenue = shiftSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const completedSales = shiftSales.filter(
    (s) => s.status === "COMPLETED",
  ).length;
  const refundedSales = shiftSales.filter(
    (s) => s.status === "REFUNDED",
  ).length;
  const averageSale =
    completedSales > 0 ? totalRevenue / completedSales : 0;

  const endTime = shift.endTime || new Date().toISOString();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border hover:border-primary  rounded-lg w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold text-lg">Shift Summary</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(shift.startTime).toLocaleDateString()} |{" "}
                {new Date(shift.startTime).toLocaleTimeString()} -{" "}
                {new Date(endTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Total Revenue
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Transactions
                </span>
              </div>
              <p className="text-2xl font-bold">{completedSales}</p>
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Avg. Sale
                </span>
              </div>
              <p className="text-2xl font-bold">${averageSale.toFixed(2)}</p>
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
              <p className="text-2xl font-bold">
                {formatDuration(shift.startTime, endTime)}
              </p>
            </div>
          </div>

          {/* Refunds */}
          {refundedSales > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-destructive">
                Refunded Transactions
              </span>
              <Badge variant="destructive">{refundedSales}</Badge>
            </div>
          )}

          {/* Payment Breakdown */}
          {paymentBreakdown.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-muted border-b border-border">
                <h3 className="font-semibold text-sm">Payment Breakdown</h3>
              </div>
              <div className="divide-y divide-border">
                {paymentBreakdown.map(([method, data]) => {
                  const Icon = getPaymentIcon(method);
                  return (
                    <div
                      key={method}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getPaymentLabel(method)}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {data.count}
                        </Badge>
                      </div>
                      <span className="font-medium text-sm">
                        ${data.total.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-muted border-b border-border">
                <h3 className="font-semibold text-sm">Top Products</h3>
              </div>
              <div className="divide-y divide-border">
                {topProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5">
                        #{i + 1}
                      </span>
                      <span className="text-sm truncate">{product.title}</span>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        x{product.totalQty}
                      </Badge>
                    </div>
                    <span className="font-medium text-sm shrink-0 ml-2">
                      ${product.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {shiftSales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sales during this shift</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex gap-2">
          {onPrint && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onPrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Summary
            </Button>
          )}
          <Button className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
