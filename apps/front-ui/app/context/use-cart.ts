"use client";
import { createContext, createElement, ReactNode, useContext } from 'react';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ProductEntity } from '@/lib/types';

export interface CartItem {
  product: any;
  quantity: number;
}

export interface BusinessGroup {
  businessId: string;
  businessName: string;
  businessType?: string;
  businessAvatar?: string;
  items: CartItem[];
  subtotal: number;
}

type CartContextType = {
  items: CartItem[];
  addItem: (product: ProductEntity, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getCartTotal: () => number;
  getItemsByBusiness: () => BusinessGroup[];
}

type CartState = {
  items: CartItem[];
  addItem: (product: ProductEntity, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getCartTotal: () => number;
  getItemsByBusiness: () => BusinessGroup[];
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, { product, quantity }] };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      getCartTotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
      getItemsByBusiness: (): BusinessGroup[] => {
        const groups: Record<string, BusinessGroup> = {};
        for (const item of get().items) {
          const biz = item.product?.business;
          const bizId = biz?.id ?? "unknown";
          if (!groups[bizId]) {
            groups[bizId] = {
              businessId: bizId,
              businessName: biz?.name ?? "Unknown Business",
              businessType: biz?.businessType,
              businessAvatar: biz?.avatar,
              items: [],
              subtotal: 0,
            };
          }
          groups[bizId].items.push(item);
          groups[bizId].subtotal += item.product.price * item.quantity;
        }
        return Object.values(groups);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const store = useCartStore();

  return createElement(
    CartContext.Provider,
    { value: store },
    children
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}