"use client";

import { AlertTriangle, CheckCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  items: any[];
  deliveryFee: number;
  total: number;
  uTnAmount: number;
  onCheckout: () => void;
  isProcessing?: boolean;
  isUsingUnifiedPayment?: boolean;
}

export default function OrderSummary({
  items,
  deliveryFee,
  total,
  uTnAmount,
  onCheckout,
  isUsingUnifiedPayment,
  isProcessing = false,
}: OrderSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border">
        <h2 className="font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Items ({items?.length})</h3>
          <div className="max-h-48 overflow-y-auto pr-2">
            {items?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product.title}</p>
                  <p className="text-sm text-muted-foreground">
                    x{item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${(total - deliveryFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>${deliveryFee?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
            <span>Total</span>
            <span>${total?.toFixed(2)}</span>
          </div>

          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Payment secured by USCOR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/50 border-t border-border">
        {!isUsingUnifiedPayment && (
          <Button
            className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-lg"
            onClick={onCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-white border-t-transparent"></span>
                Processing...
              </>
            ) : (
              <>Checkout • ${total?.toFixed(2)}</>
            )}
          </Button>
        )}

        <div className="mt-3 flex items-center justify-center text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>Free delivery on orders over $1500</span>
        </div>
      </div>
    </div>
  );
}
