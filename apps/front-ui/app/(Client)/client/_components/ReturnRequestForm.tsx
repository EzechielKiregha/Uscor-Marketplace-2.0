"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Package,
  RefreshCcw,
  Search,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GET_CLIENT_ORDERS } from "@/graphql/client-panel.gql";

interface ReturnRequestFormProps {
  client: any;
}

type ReturnReason =
  | "DEFECTIVE"
  | "WRONG_ITEM"
  | "NOT_AS_DESCRIBED"
  | "DAMAGED_IN_TRANSIT"
  | "CHANGED_MIND"
  | "OTHER";

const RETURN_REASONS: { value: ReturnReason; label: string; description: string }[] = [
  { value: "DEFECTIVE", label: "Defective Product", description: "The item doesn't work as expected" },
  { value: "WRONG_ITEM", label: "Wrong Item Received", description: "Received a different item than ordered" },
  { value: "NOT_AS_DESCRIBED", label: "Not As Described", description: "The item doesn't match the listing" },
  { value: "DAMAGED_IN_TRANSIT", label: "Damaged in Transit", description: "The item was damaged during shipping" },
  { value: "CHANGED_MIND", label: "Changed Mind", description: "I no longer need this item" },
  { value: "OTHER", label: "Other", description: "Another reason" },
];

type Step = "select-order" | "select-items" | "reason" | "confirm" | "submitted";

export default function ReturnRequestForm({ client }: ReturnRequestFormProps) {
  const [step, setStep] = useState<Step>("select-order");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState<ReturnReason | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { showToast } = useToast();

  const { data, loading } = useQuery(GET_CLIENT_ORDERS, {
    variables: { clientId: client.id, status: "DELIVERED", limit: 50 },
  });

  const eligibleOrders = useMemo(() => {
    const orders = data?.clientOrders?.items || [];
    // Only delivered orders within 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return orders.filter((o: any) => {
      if (o.clientOrderId) return false;
      const orderDate = new Date(o.createdAt);
      return orderDate >= cutoff;
    });
  }, [data]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return eligibleOrders;
    const q = searchQuery.toLowerCase();
    return eligibleOrders.filter(
      (o: any) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.business?.name?.toLowerCase().includes(q),
    );
  }, [eligibleOrders, searchQuery]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSubmitReturn = () => {
    // In a real app, this would call a mutation
    showToast(
      "success",
      "Return Request Submitted",
      `Your return request for ${selectedItems.length} item(s) has been submitted. The business will review and respond within 48 hours.`,
    );
    setStep("submitted");
  };

  const resetForm = () => {
    setStep("select-order");
    setSelectedOrder(null);
    setSelectedItems([]);
    setReturnReason(null);
    setAdditionalNotes("");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title flex items-center gap-2">
            <RefreshCcw className="h-6 w-6 text-primary" />
            Return Request
          </h1>
          <p className="text-muted-foreground text-sm">
            Submit a return request for delivered items
          </p>
        </div>
        {step !== "select-order" && step !== "submitted" && (
          <Button variant="ghost" size="sm" onClick={resetForm}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Start Over
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      {step !== "submitted" && (
        <div className="flex items-center gap-2 text-xs">
          {["select-order", "select-items", "reason", "confirm"].map(
            (s, i) => {
              const labels = ["Select Order", "Choose Items", "Reason", "Confirm"];
              const stepOrder = ["select-order", "select-items", "reason", "confirm"];
              const currentIdx = stepOrder.indexOf(step);
              const isActive = i <= currentIdx;
              return (
                <div key={s} className="flex items-center gap-1">
                  {i > 0 && (
                    <div
                      className={`w-6 h-px ${isActive ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`hidden sm:inline ${
                      isActive ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {labels[i]}
                  </span>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Step 1: Select Order */}
      {step === "select-order" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Input
                placeholder="Search by order number or business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No eligible orders for return</p>
              <p className="text-xs mt-1">
                Only delivered orders within the last 30 days can be returned
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[50vh] overflow-y-auto">
              {filteredOrders.map((order: any) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setStep("select-items");
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  {order.business?.avatar ? (
                    <img
                      src={order.business.avatar}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      Order #{order.orderNumber?.substring(0, 12) || order.id.substring(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.business?.name} |{" "}
                      {new Date(order.createdAt).toLocaleDateString()} |{" "}
                      {order.items?.length} items
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">
                      ${order.totalAmount?.toFixed(2)}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Items */}
      {step === "select-items" && selectedOrder && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border bg-muted">
            <p className="text-sm font-medium">
              Select items to return from Order #{selectedOrder.orderNumber?.substring(0, 12)}
            </p>
          </div>

          <div className="divide-y divide-border">
            {selectedOrder.items?.map((item: any) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>

                  {item.media?.[0]?.url ? (
                    <img
                      src={item.media[0].url}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.price?.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-border flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep("select-order")}>
              Back
            </Button>
            <Button
              size="sm"
              disabled={selectedItems.length === 0}
              onClick={() => setStep("reason")}
            >
              Continue ({selectedItems.length} selected)
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Return Reason */}
      {step === "reason" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border bg-muted">
            <p className="text-sm font-medium">Why are you returning these items?</p>
          </div>

          <div className="divide-y divide-border">
            {RETURN_REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => setReturnReason(reason.value)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                  returnReason === reason.value
                    ? "bg-primary/5 border-l-4 border-l-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                    returnReason === reason.value
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {returnReason === reason.value && (
                    <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{reason.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="p-3 border-t border-border">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Additional Notes (optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Provide any additional details about your return..."
              className="w-full p-2 text-sm border border-border rounded-lg bg-background resize-none h-20"
            />
          </div>

          <div className="p-3 border-t border-border flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep("select-items")}>
              Back
            </Button>
            <Button
              size="sm"
              disabled={!returnReason}
              onClick={() => setStep("confirm")}
            >
              Review Request
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && selectedOrder && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border bg-muted">
            <p className="text-sm font-medium">Review Your Return Request</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Order Info */}
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">
                  Order #{selectedOrder.orderNumber?.substring(0, 12)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.business?.name}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Items to Return ({selectedItems.length})
              </p>
              <div className="space-y-2">
                {selectedOrder.items
                  ?.filter((item: any) => selectedItems.includes(item.id))
                  .map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Return Reason
              </p>
              <Badge variant="secondary">
                {RETURN_REASONS.find((r) => r.value === returnReason)?.label}
              </Badge>
            </div>

            {/* Notes */}
            {additionalNotes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-sm">{additionalNotes}</p>
              </div>
            )}

            {/* Policy Notice */}
            <div className="bg-muted/50 border border-border rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Return Policy</p>
                <p className="mt-0.5">
                  The business will review your request within 48 hours. If approved,
                  you'll receive instructions on how to return the items. Refunds are
                  processed within 5-7 business days after the item is received.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-border flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep("reason")}>
              Back
            </Button>
            <Button size="sm" onClick={handleSubmitReturn}>
              Submit Return Request
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Submitted */}
      {step === "submitted" && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Return Request Submitted</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your return request has been submitted to{" "}
            <strong>{selectedOrder?.business?.name}</strong>. They will review
            and respond within 48 hours. You'll receive a notification with the
            next steps.
          </p>
          <Button variant="outline" className="mt-6" onClick={resetForm}>
            Submit Another Return
          </Button>
        </div>
      )}
    </div>
  );
}
