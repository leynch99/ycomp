"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, ProductListItem } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/storage";
import toast from "react-hot-toast";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: ProductListItem, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  isModalOpen: boolean;
  lastAddedId: string | null;
  closeModal: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ycomp_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(readStorage<CartItem[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEY, items);
  }, [items]);

  const addItem = (item: ProductListItem, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        setLastAddedId(item.id);
        setIsModalOpen(true);
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      }
      setLastAddedId(item.id);
      setIsModalOpen(true);
      return [...prev, { ...item, qty }];
    });
    toast.success("Додано до кошика");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p)),
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.salePrice * item.qty, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clear,
        total,
        isModalOpen,
        lastAddedId,
        closeModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
