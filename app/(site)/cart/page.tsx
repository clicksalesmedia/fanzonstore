"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, selectSubtotal } from "@/store/cart";
import { formatPrice, cn, isPrintifyImage } from "@/lib/utils";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_US_SHIPPING_ESTIMATE_CENTS,
} from "@/lib/pricing";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { useMounted } from "@/components/useMounted";

const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS / 100;
const SHIPPING_FEE = STANDARD_US_SHIPPING_ESTIMATE_CENTS / 100;

export default function CartPage() {
  const mounted = useMounted();

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectSubtotal);

  const hasItems = mounted && lines.length > 0;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const freeShippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <main className="min-h-screen py-16 sm:py-24">
      <div className="container-page">
        <Reveal>
          <p className="font-sport text-xs tracking-[0.3em] text-pitch-400">
            YOUR BAG
          </p>
          <h1 className="font-display mt-3 text-4xl text-chalk sm:text-5xl lg:text-6xl">
            CHECKOUT
          </h1>
        </Reveal>

        {!mounted ? (
          <div className="mt-16 h-64 animate-pulse rounded-3xl bg-white/5" />
        ) : !hasItems ? (
          <Reveal className="mt-16">
            <div className="glass flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pitch-400/10 text-pitch-400">
                <ShoppingBag className="h-9 w-9" aria-hidden />
              </div>
              <h2 className="font-display mt-6 text-2xl text-chalk sm:text-3xl">
                YOUR BAG IS EMPTY
              </h2>
              <p className="mt-3 max-w-sm text-mist">
                No gear yet. Explore the collection and kit yourself out for
                World Cup 2026.
              </p>
              <ButtonLink href="/shop" variant="primary" size="lg" className="mt-8">
                Shop the drop
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
            {/* Line items */}
            <Reveal stagger className="space-y-4">
              {lines.map((line) => (
                <div
                  key={line.variantId}
                  className="glass flex gap-4 rounded-2xl p-4 sm:gap-6 sm:p-5"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-ink-850 sm:h-28 sm:w-28">
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="112px"
                      className={cn(isPrintifyImage(line.image) ? "object-contain" : "object-cover")}
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight text-chalk">
                          {line.name}
                        </h3>
                        {line.bundle ? (
                          <ul className="mt-1 space-y-0.5 text-sm text-mist">
                            {line.bundle.components.map((c) => (
                              <li key={`${c.productId}-${c.variantId}`}>
                                <span className="font-sport uppercase tracking-wider text-pitch-300">
                                  {c.label}:
                                </span>{" "}
                                {c.size}
                                {c.color ? ` · ${c.color}` : ""}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1 flex items-center gap-2 text-sm text-mist">
                            <span className="font-sport tracking-wider uppercase">
                              {line.size}
                            </span>
                            {line.color && (
                              <>
                                <span className="text-white/20">/</span>
                                <span>{line.color}</span>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.variantId)}
                        aria-label={`Remove ${line.name} from bag`}
                        className="cursor-pointer rounded-full p-2 text-mist transition-colors duration-200 hover:bg-white/5 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      {/* Qty stepper */}
                      <div className="inline-flex items-center rounded-full border border-white/12 bg-white/5">
                        <button
                          type="button"
                          onClick={() =>
                            setQty(line.variantId, line.qty - 1)
                          }
                          aria-label="Decrease quantity"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
                        >
                          <Minus className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="w-8 text-center font-sport text-sm tabular-nums text-chalk">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(line.variantId, line.qty + 1)
                          }
                          aria-label="Increase quantity"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>

                      <p className="font-sport text-lg tracking-wide text-chalk tabular-nums">
                        {formatPrice(line.price * line.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-sm text-mist transition-colors duration-200 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 rounded"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
                  Continue shopping
                </Link>
              </div>
            </Reveal>

            {/* Order summary */}
            <Reveal y={24}>
              <div className="glass sticky top-24 rounded-2xl p-6 sm:p-7">
                <h2 className="font-display text-xl text-chalk">ORDER SUMMARY</h2>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-mist">Subtotal</dt>
                    <dd className="font-medium text-chalk tabular-nums">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-mist">Shipping</dt>
                    <dd
                      className={cn(
                        "font-medium tabular-nums",
                        shipping === 0 ? "text-pitch-400" : "text-chalk",
                      )}
                    >
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </dd>
                  </div>

                  {freeShippingGap > 0 && (
                    <p className="rounded-xl bg-pitch-400/10 px-4 py-3 text-xs leading-relaxed text-pitch-300">
                      Add{" "}
                      <span className="font-semibold">
                        {formatPrice(freeShippingGap)}
                      </span>{" "}
                      more to unlock free shipping.
                    </p>
                  )}

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <dt className="font-sport tracking-wider uppercase text-chalk">
                        Estimated total
                      </dt>
                      <dd className="font-sport text-xl tracking-wide text-gold-400 tabular-nums">
                        {formatPrice(total)}
                      </dd>
                    </div>
                  </div>
                </dl>

                <ButtonLink
                  href="/checkout"
                  variant="gold"
                  size="lg"
                  className="mt-7 w-full"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>

                <p className="mt-4 text-center text-xs text-mist">
                  Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                  Taxes calculated at checkout.
                </p>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </main>
  );
}
