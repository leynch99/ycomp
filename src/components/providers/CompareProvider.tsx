"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ProductListItem } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/storage";
import toast from "react-hot-toast";

type CompareContextValue = {
  items: ProductListItem[];
  toggle: (item: ProductListItem) => void;
  isInCompare: (id: string) => boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "ycomp_compare";

export function CompareProvider({ children }: { children: React.ReactNode }) {
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
        toast("Видалено з порівняння");
        return prev.filter((p) => p.id !== item.id);
      }
      if (prev.length >= 4) {
        toast.error("Максимум 4 товари для порівняння");
        return prev;
      }
      toast.success("Додано в порівняння");
      return [...prev, item];
    });
  };

  const isInCompare = (id: string) => items.some((p) => p.id === id);

  return (
    <CompareContext.Provider value={{ items, toggle, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
