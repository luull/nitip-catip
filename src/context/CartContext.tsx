"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ProductItem } from "@/types";

export interface CartItem extends ProductItem {
  cartId: string; // unique key for cart management
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: ProductItem) => void;
  updateItem: (cartId: string, updates: Partial<CartItem>) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = "nitipcatip_cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {
    // ignore corrupted data
  }
  return [];
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: ProductItem) => {
    const cartItem: CartItem = { ...item, cartId: generateCartId() };
    setItems((prev) => [...prev, cartItem]);
  }, []);

  const updateItem = useCallback((cartId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.cartId === cartId ? { ...it, ...updates } : it)),
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((it) => it.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, it) => sum + it.jumlah, 0);
  const totalPrice = items.reduce(
    (sum, it) => sum + it.hargaBarang * it.jumlah,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
