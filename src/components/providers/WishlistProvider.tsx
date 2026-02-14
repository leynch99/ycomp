"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ProductListItem } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/storage";
import toast from "react-hot-toast";

type WishlistContextValue = {
  items: ProductListItem[];
  toggle: (item: ProductListItem) => void;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "ycomp_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductListItem[]>([]);

  useEffect(() => {
    setItems(readStorage<ProductListItem[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEY, items);
  }, [items]);

  const toggle = (item: ProductListItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) {
        toast("Видалено з обраного");
        return prev.filter((p) => p.id !== item.id);
      }
      toast.success("Додано в обране");
      return [...prev, item];
    });
  };

  const isInWishlist = (id: string) => items.some((p) => p.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggle, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
