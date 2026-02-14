"use client";

import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { Toaster } from "react-hot-toast";
import { CartModal } from "@/components/CartModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <CompareProvider>
          {children}
          <Toaster position="top-right" />
          <CartModal />
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
