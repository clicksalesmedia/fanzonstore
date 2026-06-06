"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (line: CartLine) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (line) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              isOpen: true,
              lines: s.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, qty: l.qty + line.qty }
                  : l,
              ),
            };
          }
          return { isOpen: true, lines: [...s.lines, line] };
        }),
      remove: (variantId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      setQty: (variantId, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.variantId === variantId ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "wc26-cart" },
  ),
);

export const selectCount = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.qty, 0);
export const selectSubtotal = (s: CartState) =>
  s.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
