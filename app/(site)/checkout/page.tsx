"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart, selectSubtotal } from "@/store/cart";
import { cn, formatPrice, isPrintifyImage } from "@/lib/utils";
import { qualifiesForFreeShipping } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { useMounted } from "@/components/useMounted";

type Field = {
  name: string;
  label: string;
  autoComplete: string;
  required: boolean;
  type?: string;
  half?: boolean;
};

const FIELDS: Field[] = [
  { name: "first_name", label: "First name", autoComplete: "given-name", required: true, half: true },
  { name: "last_name", label: "Last name", autoComplete: "family-name", required: true, half: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  { name: "phone", label: "Phone (optional)", autoComplete: "tel", required: false },
  { name: "address1", label: "Address", autoComplete: "address-line1", required: true },
  { name: "address2", label: "Apt, suite (optional)", autoComplete: "address-line2", required: false },
  { name: "city", label: "City", autoComplete: "address-level2", required: true, half: true },
  { name: "region", label: "State / Region", autoComplete: "address-level1", required: false, half: true },
  { name: "zip", label: "ZIP / Postal code", autoComplete: "postal-code", required: true, half: true },
  { name: "country", label: "Country (ISO-2, e.g. US)", autoComplete: "country", required: true, half: true },
];

export default function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const mounted = useMounted();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderId: string; sentToProduction: boolean } | null>(null);

  // Live shipping quote (cents) from Printify, fetched once a destination is
  // entered. null = not yet quoted ("calculated at checkout").
  const [shipCents, setShipCents] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteAbort = useRef<AbortController | null>(null);

  const subtotalCents = Math.round(subtotal * 100);
  const freeShipping = qualifiesForFreeShipping(subtotalCents);
  const effectiveShipCents = freeShipping ? 0 : shipCents === 0 ? null : shipCents;
  const shipping = effectiveShipCents == null ? null : effectiveShipCents / 100;
  const total = subtotal + (shipping ?? 0);

  // Debounced shipping quote whenever the address (esp. country + zip) changes.
  function requestQuote(formEl: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(formEl).entries());
    const country = String(data.country ?? "").trim();
    const zip = String(data.zip ?? "").trim();
    if (freeShipping) {
      setShipCents(0);
      return;
    }
    if (!country || !zip || lines.length === 0) {
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
            address: { ...data, country: country.toUpperCase() },
            items: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              qty: l.qty,
            })),
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
    }, 600);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const address = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: { ...address, country: String(address.country).toUpperCase() },
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            qty: l.qty,
            name: l.name,
            image: l.image,
            price: l.price,
            size: l.size,
            color: l.color,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setDone({ orderId: data.orderId, sentToProduction: data.sentToProduction });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="size-16 text-pitch-400" aria-hidden />
        <h1 className="font-display mt-6 text-4xl text-chalk sm:text-5xl">Order placed</h1>
        <p className="mt-4 max-w-md text-mist">
          Your Printify order <span className="font-sport text-pitch-300">{done.orderId}</span> was
          created.{" "}
          {done.sentToProduction
            ? "It has been sent to production."
            : "It is awaiting review in the Printify dashboard before production."}
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
          className="order-2 lg:order-1"
        >
          <h2 className="font-sport text-sm uppercase tracking-wider text-pitch-300">
            Shipping details
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.name} className={f.half ? "col-span-1" : "col-span-2"}>
                <label
                  htmlFor={f.name}
                  className="mb-1.5 block font-sport text-[0.7rem] uppercase tracking-wider text-mist"
                >
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type ?? "text"}
                  autoComplete={f.autoComplete}
                  required={f.required}
                  className="h-11 w-full rounded-xl border border-white/12 bg-ink-900 px-4 text-sm text-chalk outline-none transition-colors placeholder:text-mist/50 focus:border-pitch-400 focus-visible:ring-2 focus-visible:ring-pitch-400/40"
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="mt-6 w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Placing order…
              </>
            ) : (
              <>
                <Lock className="size-4" aria-hidden /> Place order · {formatPrice(total)}
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center gap-2 text-xs text-mist">
            <ShieldCheck className="size-3.5 text-pitch-400" aria-hidden />
            Your order is placed securely. Connect a payment provider to charge cards.
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
                      <p className="font-sport text-[0.7rem] uppercase tracking-wider text-mist">
                        {l.size} · {l.color}
                      </p>
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
