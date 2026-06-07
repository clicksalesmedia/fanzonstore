"use client";

import { useEffect, useState } from "react";
import { Check, Gift, ShieldCheck, Truck } from "lucide-react";
import type {
  BundleComponentSelection,
  CartLine,
  Product,
  ProductImage,
  ProductVariant,
} from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { useCart } from "@/store/cart";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/components/product/ProductGallery";

interface BundleSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  /** dollars */
  price: number;
  /** dollars or null */
  compareAtPrice: number | null;
  badge: string | null;
}

interface DetailComponent {
  label: string;
  lockedVariantId: number | null;
  product: Product;
}

interface Selection {
  size: string;
  color: string;
}

const ALLOWED_BADGES = ["Bestseller", "New", "Limited", "Host Nation"];

function initialSelection(c: DetailComponent): Selection {
  const sizeRequired = c.product.sizes.length > 1;
  return {
    size: sizeRequired ? "" : (c.product.sizes[0] ?? "One Size"),
    color: c.product.colors[0]?.name ?? "",
  };
}

function resolveVariant(
  c: DetailComponent,
  sel: Selection,
): ProductVariant | undefined {
  if (c.lockedVariantId != null) {
    return c.product.variants.find(
      (v) => v.printfulVariantId === c.lockedVariantId,
    );
  }
  return (
    c.product.variants.find(
      (v) => v.size === sel.size && v.color === sel.color,
    ) ??
    c.product.variants.find((v) => v.color === sel.color) ??
    c.product.variants.find((v) => v.size === sel.size) ??
    c.product.variants[0]
  );
}

function selectVariantImage(product: Product, variant: ProductVariant) {
  const match = product.images?.find((im) =>
    im.variantIds.includes(variant.printfulVariantId),
  );
  return match?.src ?? product.image;
}

export function BundleDetail({
  bundle,
  gallery,
  components,
}: {
  bundle: BundleSummary;
  gallery: ProductImage[];
  components: DetailComponent[];
}) {
  const add = useCart((s) => s.add);
  const [selections, setSelections] = useState<Selection[]>(() =>
    components.map(initialSelection),
  );
  const [attempted, setAttempted] = useState(false);

  const onSale =
    bundle.compareAtPrice !== null && bundle.compareAtPrice > bundle.price;
  const badge = ALLOWED_BADGES.includes(bundle.badge ?? "")
    ? (bundle.badge as Product["badge"])
    : undefined;

  function setSel(i: number, patch: Partial<Selection>) {
    setSelections((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  }

  // A component is "ready" when it has a resolvable variant and (unless locked /
  // single-size) a chosen size.
  function componentReady(c: DetailComponent, sel: Selection) {
    if (c.lockedVariantId != null)
      return Boolean(resolveVariant(c, sel));
    const sizeRequired = c.product.sizes.length > 1;
    if (sizeRequired && sel.size === "") return false;
    return Boolean(resolveVariant(c, sel));
  }

  const allReady = components.every((c, i) => componentReady(c, selections[i]));

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      currency: "USD",
      value: bundle.price,
      content_name: bundle.name,
      content_type: "product_group",
      content_ids: components.map((c) => c.product.id),
      contents: components.map((c) => ({
        id: c.product.id,
        quantity: 1,
      })),
      num_items: components.length,
    });
  }, [bundle.name, bundle.price, components]);

  function handleAdd() {
    setAttempted(true);
    if (!allReady) return;

    const picks: BundleComponentSelection[] = components.map((c, i) => {
      const v = resolveVariant(c, selections[i])!;
      return {
        productId: c.product.id,
        variantId: v.printfulVariantId,
        label: c.label,
        size: v.size,
        color: v.color,
        name: c.product.name,
        image: selectVariantImage(c.product, v),
      };
    });

    // Deterministic composite key: identical configs merge, different configs
    // stay distinct. productId here is the Printify id (never the bundle id).
    const composite = picks
      .map((p) => `${p.productId}-${p.variantId}`)
      .sort()
      .join(",");

    const summary = picks
      .map((p) => `${p.label}: ${p.size}${p.color ? ` · ${p.color}` : ""}`)
      .join("  /  ");

    const line: CartLine = {
      productId: `bundle:${bundle.id}`,
      variantId: `bundle:${bundle.id}:${composite}`,
      name: bundle.name,
      image: bundle.image,
      price: bundle.price,
      size: summary,
      color: "",
      qty: 1,
      bundle: { bundleId: bundle.id, components: picks },
    };
    add(line);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
      {/* Gallery: live bundle hero + component mockups */}
      <Reveal>
        <ProductGallery
          images={gallery}
          fallbackImage={bundle.image}
          name={bundle.name}
          badge={badge}
        />
      </Reveal>

      {/* Info + per-component pickers. NOTE: not wrapped in a staggered Reveal —
          the scroll-reveal can leave a late child (the Add-to-bag button) stuck
          at opacity:0. Keep the buy flow always visible. */}
      <div className="flex flex-col">
        <span className="inline-flex w-fit items-center gap-1.5 font-sport text-xs uppercase tracking-[0.2em] text-pitch-400">
          <Gift className="h-3.5 w-3.5" aria-hidden /> Matching set ·{" "}
          {components.length} pieces
        </span>

        <h1 className="mt-2 text-balance font-display text-4xl leading-[0.95] text-chalk sm:text-5xl">
          {bundle.name}
        </h1>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-sport text-3xl font-semibold tracking-wide text-chalk">
            {formatPrice(bundle.price)}
          </span>
          {onSale && (
            <>
              <span className="font-sport text-lg text-white/30 line-through">
                {formatPrice(bundle.compareAtPrice!)}
              </span>
              <span className="rounded-full bg-gold-400/15 px-2.5 py-1 font-sport text-[11px] font-semibold uppercase tracking-wider text-gold-300">
                Set price
              </span>
            </>
          )}
        </div>

        <p className="mt-5 max-w-prose leading-relaxed text-mist">
          {bundle.description}
        </p>

        {/* One picker block per component */}
        <div className="mt-8 space-y-6">
          {components.map((c, i) => {
            const sel = selections[i];
            const locked = c.lockedVariantId != null;
            const lockedVariant = locked ? resolveVariant(c, sel) : undefined;
            const sizeRequired = c.product.sizes.length > 1;
            const needsSize = sizeRequired && sel.size === "" && attempted;
            return (
              <div
                key={c.label}
                className="rounded-2xl border border-white/10 bg-ink-900/40 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sport text-sm uppercase tracking-wider text-chalk">
                    {c.label}
                  </span>
                  <span className="max-w-[55%] truncate text-xs text-mist">
                    {c.product.name}
                  </span>
                </div>

                {locked ? (
                  <p className="mt-3 text-sm text-mist">
                    {lockedVariant
                      ? `${lockedVariant.size}${lockedVariant.color ? ` · ${lockedVariant.color}` : ""}`
                      : "Selected for you"}
                  </p>
                ) : (
                  <>
                    {/* Colors */}
                    {c.product.colors.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-sport text-[11px] uppercase tracking-wider text-mist">
                            Color
                          </span>
                          <span className="text-xs text-mist">{sel.color}</span>
                        </div>
                        <div
                          className="mt-2 flex flex-wrap gap-2.5"
                          role="radiogroup"
                          aria-label={`${c.label} color`}
                        >
                          {c.product.colors.map((col) => {
                            const selected = col.name === sel.color;
                            return (
                              <button
                                key={col.name}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                aria-label={col.name}
                                title={col.name}
                                onClick={() => setSel(i, { color: col.name })}
                                className={cn(
                                  "relative h-9 w-9 cursor-pointer rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                                  selected
                                    ? "ring-2 ring-pitch-400 ring-offset-2 ring-offset-ink-950"
                                    : "ring-1 ring-white/15 hover:ring-white/40",
                                )}
                                style={{ backgroundColor: col.hex }}
                              >
                                {selected && (
                                  <Check
                                    className="absolute inset-0 m-auto h-4 w-4 text-ink-950 mix-blend-difference"
                                    strokeWidth={3}
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {c.product.sizes.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-sport text-[11px] uppercase tracking-wider text-mist">
                            Size
                          </span>
                          {needsSize && (
                            <span className="text-xs text-gold-300">
                              Select a size
                            </span>
                          )}
                        </div>
                        <div
                          className="mt-2 flex flex-wrap gap-2"
                          role="radiogroup"
                          aria-label={`${c.label} size`}
                        >
                          {c.product.sizes.map((s) => {
                            const selected = s === sel.size;
                            return (
                              <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setSel(i, { size: s })}
                                className={cn(
                                  "inline-flex h-10 min-w-[2.75rem] cursor-pointer items-center justify-center rounded-full px-3.5 font-sport text-sm font-semibold uppercase tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                                  selected
                                    ? "bg-pitch-400 text-ink-950 glow-pitch"
                                    : "border border-white/15 text-chalk hover:border-pitch-400/60 hover:text-pitch-300",
                                )}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleAdd}
          disabled={attempted && !allReady}
          className="mt-8 w-full"
        >
          {allReady || !attempted
            ? `Add set to bag · ${formatPrice(bundle.price)}`
            : "Choose every size"}
        </Button>

        {/* Trust block */}
        <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl glass p-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
            <span className="text-xs text-mist leading-snug">
              One set for the memory
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
            <span className="text-xs text-mist leading-snug">
              Ships together in one order
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
            <span className="text-xs text-mist leading-snug">
              Printed on demand for you
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
