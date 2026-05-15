"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CartItem from "./CartItem";
import { CartItem as CI, useCart } from "@/app/context/use-cart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, clearCart, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const deliveryFee = 5.0; // Could be calculated based on location
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    onClose();
    router.push("/marketplace/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-card shadow-xl overflow-y-auto">
            <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-foreground">
                  Shopping Cart
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-6 w-6" aria-hidden="true" />
                </Button>
              </div>

              <div className="mt-8">
                <div className="flow-root">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium">Your cart is empty</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add some products to get started
                      </p>
                    </div>
                  ) : (
                    <ul className="-my-6 divide-y divide-border">
                      {items.map((item: CI) => (
                        <CartItem
                          key={item.product.id}
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeItem}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-medium mt-2">
                  <p>Delivery Fee</p>
                  <p>${deliveryFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-bold mt-2">
                  <p>Total</p>
                  <p>${total.toFixed(2)}</p>
                </div>

                <div className="mt-6">
                  <Button
                    className="w-full bg-primary hover:bg-accent text-primary-foreground"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
                <div className="mt-4 flex justify-center text-sm text-muted-foreground">
                  <p>
                    <CheckCircle className="h-4 w-4 text-success inline mr-1" />
                    Secure checkout
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-border px-4 py-6 sm:px-6">
              <div className="flex items-center text-sm">
                <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                <span>Free delivery on orders over $1500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
