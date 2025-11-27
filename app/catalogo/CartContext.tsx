'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, CatalogProduct } from './types';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: CatalogProduct, quantity?: number, notes?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: CatalogProduct, quantity = 1, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id
            ? {
                ...it,
                quantity: it.quantity + quantity,
                notes: notes ?? it.notes,
              }
            : it,
        );
      }
      return [...prev, { product, quantity, notes }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.product.id === productId ? { ...it, quantity } : it,
        )
        .filter((it) => it.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const { totalQuantity, total } = useMemo(() => {
    const qty = items.reduce((acc, it) => acc + it.quantity, 0);
    const tot = items.reduce(
      (acc, it) => acc + it.quantity * it.product.price,
      0,
    );
    return { totalQuantity: qty, total: tot };
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalQuantity,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
