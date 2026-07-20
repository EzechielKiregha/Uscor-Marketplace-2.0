"use client";

import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/app/context/use-cart";
import { Button } from "@/components/ui/button";
import CartItem from "./CartItem";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getItemsByBusiness } = useCart();
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const businessGroups = getItemsByBusiness();
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const deliveryFee = businessGroups.length * 5.0;
  const total = subtotal + deliveryFee;

  const toggleGroup = (bizId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(bizId)) next.delete(bizId);
      else next.add(bizId);
      return next;
    });
  };

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

              <div className="mt-6">
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
                  <div className="space-y-4">
                    {businessGroups.map((group) => {
                      const isCollapsed = collapsedGroups.has(group.businessId);
                      return (
                        <div
                          key={group.businessId}
                          className="border border-border rounded-lg overflow-hidden"
                        >
                          {/* Business header */}
                          <button
                            onClick={() => toggleGroup(group.businessId)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {group.businessAvatar ? (
                                <img
                                  src={group.businessAvatar}
                                  alt={group.businessName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Store className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <div className="text-left">
                                <p className="font-medium text-sm">
                                  {group.businessName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {group.items.length} item{group.items.length > 1 ? "s" : ""} · ${group.subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          {/* Items */}
                          {!isCollapsed && (
                            <ul className="divide-y divide-border px-4">
                              {group.items.map((item) => (
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-4 py-6 sm:px-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>Subtotal ({items.length} items from {businessGroups.length} business{businessGroups.length > 1 ? "es" : ""})</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <p>Delivery Fee ({businessGroups.length} &times; $5.00)</p>
                  <p>${deliveryFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-border">
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
                    Secure checkout · USCOR handles payment distribution
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-border px-4 py-4 sm:px-6">
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-warning mr-2 shrink-0" />
                <span>Free delivery on orders over $1500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
