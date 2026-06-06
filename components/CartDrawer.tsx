"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart, selectSubtotal } from "@/store/cart";
import { ButtonLink } from "@/components/ui/Button";
import { cn, formatPrice, isPrintifyImage } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/pricing";
import { useMounted } from "@/components/useMounted";

const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS / 100;

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectSubtotal);

  const mounted = useMounted();

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const isEmpty = lines.length === 0;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60]",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "glass absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 shadow-2xl shadow-ink-950/60 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-display flex items-center gap-2 text-xl uppercase tracking-wide text-chalk">
            <ShoppingBag className="h-5 w-5 text-pitch-400" />
            Your Bag
            {mounted && !isEmpty && (
              <span className="font-sport text-sm text-mist">
                ({lines.reduce((n, l) => n + l.qty, 0)})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/5 hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {!mounted || isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <ShoppingBag className="h-9 w-9 text-mist" />
            </div>
            <div className="space-y-1.5">
              <p className="font-display text-2xl uppercase tracking-wide text-chalk">
                Your bag is empty
              </p>
              <p className="text-sm text-mist">
                Kit yourself out for the tournament of the century.
              </p>
            </div>
            <ButtonLink href="/shop" variant="primary" size="md" onClick={close}>
              Start Shopping
            </ButtonLink>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-white/10 px-6 py-4">
              <p className="font-sport text-xs uppercase tracking-wider text-mist">
                {remaining > 0 ? (
                  <>
                    Add{" "}
                    <span className="text-pitch-300">
                      {formatPrice(remaining)}
                    </span>{" "}
                    for free shipping
                  </>
                ) : (
                  <span className="text-pitch-300">
                    You&apos;ve unlocked free shipping
                  </span>
                )}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pitch-500 to-gold-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Lines */}
            <ul className="no-scrollbar flex-1 overflow-y-auto px-6 py-4">
              {lines.map((line) => (
                <li
                  key={line.variantId}
                  className="flex gap-4 border-b border-white/5 py-4 last:border-b-0"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-ink-850">
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="80px"
                      className={cn(isPrintifyImage(line.image) ? "object-contain" : "object-cover")}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-chalk">
                        {line.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(line.variantId)}
                        aria-label={`Remove ${line.name}`}
                        className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/5 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {line.bundle ? (
                      <ul className="mt-0.5 space-y-0.5 text-xs text-mist">
                        {line.bundle.components.map((c) => (
                          <li key={`${c.productId}-${c.variantId}`}>
                            <span className="text-pitch-300">{c.label}:</span>{" "}
                            {c.size}
                            {c.color ? ` · ${c.color}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-0.5 text-xs text-mist">
                        {line.size}
                        {line.color ? ` · ${line.color}` : ""}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(line.variantId, line.qty - 1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:bg-white/10 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-sport w-7 text-center text-sm text-chalk">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.variantId, line.qty + 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:bg-white/10 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="font-sport text-sm font-semibold text-chalk">
                        {formatPrice(line.price * line.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-5">
              <div className="flex items-end justify-between">
                <span className="font-sport text-xs uppercase tracking-wider text-mist">
                  Subtotal
                </span>
                <span className="font-display text-2xl text-chalk">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-mist">
                Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                Taxes calculated at checkout.
              </p>

              <div className="mt-4 flex flex-col gap-2.5">
                <ButtonLink
                  href="/checkout"
                  variant="primary"
                  size="lg"
                  onClick={close}
                  className="w-full"
                >
                  Checkout
                </ButtonLink>
                <ButtonLink
                  href="/cart"
                  variant="outline"
                  size="md"
                  onClick={close}
                  className="w-full"
                >
                  View Cart
                </ButtonLink>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
