"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart, selectSubtotal } from "@/store/cart";
import { cn, formatPrice, isPrintifyImage } from "@/lib/utils";
import {
  createMetaEventId,
  linesToMetaCustomData,
  trackMetaPixelEvent,
} from "@/lib/meta-pixel";
import { qualifiesForFreeShipping } from "@/lib/pricing";
import { US_COUNTRY, US_STATES, citiesForState } from "@/lib/us-locations";
import { Button } from "@/components/ui/Button";
import { useMounted } from "@/components/useMounted";

const OTHER_CITY = "__other__";

const inputClass =
  "h-11 w-full rounded-xl border border-white/12 bg-ink-900 px-4 text-sm text-chalk outline-none transition-colors placeholder:text-mist/50 focus:border-pitch-400 focus-visible:ring-2 focus-visible:ring-pitch-400/40";
const labelClass =
  "mb-1.5 block font-sport text-[0.7rem] uppercase tracking-wider text-mist";

export default function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const mounted = useMounted();

  // Controlled address state (country is fixed to the US).
  const [stateCode, setStateCode] = useState("");
  const [cityChoice, setCityChoice] = useState("");
  const [cityOther, setCityOther] = useState("");
  const cityValue = cityChoice === OTHER_CITY ? cityOther : cityChoice;
  const cities = useMemo(() => citiesForState(stateCode), [stateCode]);

  const [stripeReturn] = useState(() => {
    if (typeof window === "undefined")
      return { success: false, canceled: false, sessionId: null as string | null };
    const params = new URLSearchParams(window.location.search);
    return {
      success: params.get("success") === "1",
      canceled: params.get("canceled") === "1",
      sessionId: params.get("session_id"),
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    stripeReturn.canceled
      ? "Payment was canceled. Your cart is still here when you're ready."
      : null,
  );

  // Live shipping quote (cents) from Printify, fetched once a destination is
  // entered. null = not yet quoted ("calculated at checkout").
  const [shipCents, setShipCents] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteAbort = useRef<AbortController | null>(null);
  const purchaseTracked = useRef(false);

  const subtotalCents = Math.round(subtotal * 100);
  const freeShipping = qualifiesForFreeShipping(subtotalCents);
  const effectiveShipCents = freeShipping ? 0 : shipCents === 0 ? null : shipCents;
  const shipping = effectiveShipCents == null ? null : effectiveShipCents / 100;
  const total = subtotal + (shipping ?? 0);

  useEffect(() => {
    if (stripeReturn.success) {
      clear();
    }
    if (stripeReturn.success || stripeReturn.canceled) {
      window.history.replaceState(null, "", "/checkout");
    }
  }, [clear, stripeReturn]);

  useEffect(() => {
    if (
      !stripeReturn.success ||
      !stripeReturn.sessionId ||
      purchaseTracked.current
    ) {
      return;
    }

    purchaseTracked.current = true;
    void fetch(
      `/api/meta/purchase?session_id=${encodeURIComponent(stripeReturn.sessionId)}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.eventId && data?.customData) {
          trackMetaPixelEvent("Purchase", data.customData, data.eventId);
        }
      })
      .catch(() => undefined);
  }, [stripeReturn]);

  // Debounced shipping quote whenever the destination (state + zip) changes.
  function requestQuote(formEl: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(formEl).entries());
    const zip = String(data.zip ?? "").trim();
    const region = String(data.region ?? "").trim();
    if (freeShipping) {
      setShipCents(0);
      return;
    }
    if (!region || !zip || lines.length === 0) {
      setShipCents(null);
      return;
    }
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      quoteAbort.current?.abort();
      const ac = new AbortController();
      quoteAbort.current = ac;
      setQuoting(true);
      try {
        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            address: { ...data, country: US_COUNTRY.code },
            // Flatten bundles into their component shirts so the quote covers
            // every physical item Printify will ship.
            items: lines.flatMap((l) =>
              l.bundle
                ? l.bundle.components.map((c) => ({
                    productId: c.productId,
                    variantId: String(c.variantId),
                    qty: l.qty,
                  }))
                : [{ productId: l.productId, variantId: l.variantId, qty: l.qty }],
            ),
          }),
        });
        const json = await res.json();
        const std = json?.rates?.standard;
        setShipCents(typeof std === "number" ? std : null);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setShipCents(null);
        }
      } finally {
        setQuoting(false);
      }
    }, 500);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const address = Object.fromEntries(form.entries());
    const metaEventId = createMetaEventId("InitiateCheckout");
    trackMetaPixelEvent(
      "InitiateCheckout",
      linesToMetaCustomData(lines, total),
      metaEventId,
    );
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: { ...address, country: US_COUNTRY.code },
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            qty: l.qty,
            name: l.name,
            image: l.image,
            price: l.price,
            size: l.size,
            color: l.color,
            bundle: l.bundle,
          })),
          metaEventId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (!data.checkoutUrl) throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (stripeReturn.success) {
    return (
      <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="size-16 text-pitch-400" aria-hidden />
        <h1 className="font-display mt-6 text-4xl text-chalk sm:text-5xl">Payment received</h1>
        <p className="mt-4 max-w-md text-mist">
          Stripe confirmed your payment. Your order is being prepared and will be
          synced into Printify automatically.
        </p>
        <Link href="/shop" className="mt-8">
          <Button variant="primary" size="lg">Keep shopping</Button>
        </Link>
      </main>
    );
  }

  if (mounted && lines.length === 0) {
    return (
      <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="font-display text-4xl text-chalk">Your bag is empty</h1>
        <Link href="/shop" className="mt-8">
          <Button variant="primary" size="lg">Shop the drop</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container-page py-12 sm:py-16">
      <h1 className="font-display text-4xl text-chalk sm:text-5xl">Checkout</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        {/* shipping form */}
        <form
          onSubmit={onSubmit}
          onChange={(e) => requestQuote(e.currentTarget)}
          className="order-2 space-y-5 lg:order-1"
        >
          <input type="hidden" name="country" value={US_COUNTRY.code} />

          <div className="flex items-center justify-between">
            <h2 className="font-sport text-sm uppercase tracking-wider text-pitch-300">
              Shipping details
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-ink-900 px-3 py-1 font-sport text-[0.7rem] uppercase tracking-wider text-mist">
              <span aria-hidden>🇺🇸</span> Ships to {US_COUNTRY.name}
            </span>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className={labelClass}>First name</label>
              <input id="first_name" name="first_name" autoComplete="given-name" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="last_name" className={labelClass}>Last name</label>
              <input id="last_name" name="last_name" autoComplete="family-name" required className={inputClass} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
              <input id="phone" name="phone" autoComplete="tel" className={inputClass} />
            </div>
          </div>

          {/* Street */}
          <div>
            <label htmlFor="address1" className={labelClass}>Street address</label>
            <input id="address1" name="address1" autoComplete="address-line1" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="address2" className={labelClass}>Apt, suite (optional)</label>
            <input id="address2" name="address2" autoComplete="address-line2" className={inputClass} />
          </div>

          {/* State + City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="region" className={labelClass}>State</label>
              <select
                id="region"
                name="region"
                required
                value={stateCode}
                onChange={(e) => {
                  setStateCode(e.target.value);
                  setCityChoice("");
                  setCityOther("");
                }}
                className={cn(inputClass, stateCode ? "" : "text-mist/60")}
              >
                <option value="" disabled>Select state</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code} className="text-ink-950">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city_select" className={labelClass}>City</label>
              <select
                id="city_select"
                disabled={!stateCode}
                value={cityChoice}
                onChange={(e) => setCityChoice(e.target.value)}
                className={cn(inputClass, "disabled:opacity-50", cityChoice ? "" : "text-mist/60")}
              >
                <option value="" disabled>
                  {stateCode ? "Select city" : "Pick a state first"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c} className="text-ink-950">{c}</option>
                ))}
                <option value={OTHER_CITY} className="text-ink-950">Other…</option>
              </select>
            </div>
          </div>

          {/* "Other" free-text city */}
          {cityChoice === OTHER_CITY && (
            <div>
              <label htmlFor="city_other" className={labelClass}>Enter your city</label>
              <input
                id="city_other"
                value={cityOther}
                onChange={(e) => setCityOther(e.target.value)}
                autoComplete="address-level2"
                required
                className={inputClass}
              />
            </div>
          )}
          {/* Authoritative city value submitted with the form */}
          <input type="hidden" name="city" value={cityValue} />

          {/* ZIP + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zip" className={labelClass}>ZIP code</label>
              <input
                id="zip"
                name="zip"
                inputMode="numeric"
                autoComplete="postal-code"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <div className={cn(inputClass, "flex items-center text-mist")}>
                {US_COUNTRY.name}
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Opening payment…
              </>
            ) : (
              <>
                <Lock className="size-4" aria-hidden /> Pay securely · {formatPrice(total)}
              </>
            )}
          </Button>
          <p className="flex items-center gap-2 text-xs text-mist">
            <ShieldCheck className="size-3.5 text-pitch-400" aria-hidden />
            Card payment is processed by Stripe before the order is sent to Printify.
          </p>
        </form>

        {/* summary */}
        <aside className="order-1 h-fit lg:order-2 lg:sticky lg:top-28">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-sport text-sm uppercase tracking-wider text-chalk">Order summary</h2>
            <ul className="mt-5 space-y-4">
              {mounted &&
                lines.map((l) => (
                  <li key={l.variantId} className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="64px"
                        className={cn(isPrintifyImage(l.image) ? "object-contain" : "object-cover")}
                      />
                      <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-pitch-400 text-[0.65rem] font-bold text-ink-950">
                        {l.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-chalk">{l.name}</p>
                      {l.bundle ? (
                        <p className="font-sport text-[0.7rem] uppercase tracking-wider text-mist">
                          {l.bundle.components
                            .map(
                              (c) =>
                                `${c.label} ${c.size}${c.color ? ` ${c.color}` : ""}`,
                            )
                            .join(" · ")}
                        </p>
                      ) : (
                        <p className="font-sport text-[0.7rem] uppercase tracking-wider text-mist">
                          {l.size}
                          {l.color ? ` · ${l.color}` : ""}
                        </p>
                      )}
                    </div>
                    <p className="font-sport text-sm text-chalk">{formatPrice(l.price * l.qty)}</p>
                  </li>
                ))}
            </ul>
            <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label="Shipping"
                value={
                  quoting
                    ? "Calculating…"
                    : shipping == null
                      ? "Enter address"
                      : shipping === 0
                        ? "Free"
                        : formatPrice(shipping)
                }
              />
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-sport text-sm uppercase tracking-wider text-chalk">Total</span>
                <span className="font-display text-2xl text-pitch-400">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-mist">
      <span>{label}</span>
      <span className="text-chalk">{value}</span>
    </div>
  );
}
