"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Minus, Plus, Flame, Heart, ShieldCheck } from "lucide-react";
import type { CartLine, Product } from "@/lib/types";
import { categoryLabels } from "@/lib/products";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { Rating } from "@/components/Rating";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/components/product/ProductGallery";

export function ProductDetail({ product }: { product: Product }) {
  const add = useCart((s) => s.add);

  const sizeRequired = product.sizes.length > 1;
  const [size, setSize] = useState<string>(
    sizeRequired ? "" : (product.sizes[0] ?? "One Size"),
  );
  const [color, setColor] = useState<string>(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState<number>(1);

  // Description "read more" — clamp to 4 lines and reveal a toggle only when
  // the copy actually overflows.
  const [descExpanded, setDescExpanded] = useState(false);
  const [descClamped, setDescClamped] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = descRef.current;
    if (el) setDescClamped(el.scrollHeight > el.clientHeight + 2);
  }, [product.description]);

  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const canAdd = !sizeRequired || size !== "";

  function resolveVariant() {
    return (
      product.variants.find((v) => v.size === size && v.color === color) ??
      product.variants.find((v) => v.color === color) ??
      product.variants.find((v) => v.size === size) ??
      product.variants[0]
    );
  }

  // Drives which mockups the gallery shows — updates as color/size changes.
  const activeVariant = resolveVariant();

  function handleAdd() {
    if (!canAdd) return;
    const variant = resolveVariant();
    if (!variant) return;
    const line: CartLine = {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: variant.size,
      color: variant.color,
      qty,
    };
    add(line);
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <Reveal>
        <ProductGallery
          images={product.images}
          fallbackImage={product.image}
          name={product.name}
          activeVariantId={activeVariant?.printfulVariantId}
          badge={product.badge}
        />
      </Reveal>

      {/* Info */}
      <Reveal delay={0.08} stagger className="flex flex-col">
        <span className="font-sport text-xs uppercase tracking-[0.2em] text-pitch-400">
          {categoryLabels[product.category] ?? product.category}
        </span>

        <h1 className="mt-2 font-display text-4xl leading-[0.95] text-chalk sm:text-5xl">
          {product.name}
        </h1>

        <div className="mt-4">
          <Rating rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-sport text-3xl font-semibold tracking-wide text-chalk">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <>
              <span className="font-sport text-lg text-white/30 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
              <span className="rounded-full bg-gold-400/15 px-2.5 py-1 font-sport text-[11px] font-semibold uppercase tracking-wider text-gold-300">
                Sale
              </span>
            </>
          )}
        </div>

        <div className="mt-5 max-w-prose">
          <p
            ref={descRef}
            className={cn(
              "text-mist leading-relaxed",
              !descExpanded && "line-clamp-4",
            )}
          >
            {product.description}
          </p>
          {(descClamped || descExpanded) && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              aria-expanded={descExpanded}
              className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded font-sport text-xs uppercase tracking-wider text-pitch-300 transition-colors duration-200 hover:text-pitch-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              {descExpanded ? "Read less" : "Read more"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  descExpanded && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          )}
        </div>

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="font-sport text-xs uppercase tracking-wider text-chalk">
                Color
              </span>
              <span className="text-sm text-mist">{color}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-label="Color">
              {product.colors.map((c) => {
                const selected = c.name === color;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColor(c.name)}
                    className={cn(
                      "relative h-10 w-10 cursor-pointer rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                      selected
                        ? "ring-2 ring-pitch-400 ring-offset-2 ring-offset-ink-950"
                        : "ring-1 ring-white/15 hover:ring-white/40",
                    )}
                    style={{ backgroundColor: c.hex }}
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
        {product.sizes.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="font-sport text-xs uppercase tracking-wider text-chalk">
                Size
              </span>
              {sizeRequired && size === "" && (
                <span className="text-sm text-gold-300">Please select a size</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Size">
              {product.sizes.map((s) => {
                const selected = s === size;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSize(s)}
                    className={cn(
                      "inline-flex h-11 min-w-[3rem] cursor-pointer items-center justify-center rounded-full px-4 font-sport text-sm font-semibold uppercase tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
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

        {/* Qty + Add to bag */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="flex h-14 items-center justify-between gap-2 rounded-full border border-white/15 px-2 sm:w-36">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <span
              className="min-w-[2ch] text-center font-sport text-lg font-semibold text-chalk"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex-1"
          >
            {canAdd ? "Add to bag" : "Select a size"}
          </Button>
        </div>

        {/* Highlights */}
        {product.highlights.length > 0 && (
          <ul className="mt-9 space-y-3 border-t border-white/10 pt-7">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-chalk">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pitch-400/15">
                  <Check className="h-3.5 w-3.5 text-pitch-400" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="text-sm text-mist">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Trust block */}
        <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl glass p-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
            <span className="text-xs text-mist leading-snug">Worn by the believers</span>
          </div>
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
            <span className="text-xs text-mist leading-snug">Made for the moment</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-pitch-400" aria-hidden="true" />
            <span className="text-xs text-mist leading-snug">Yours to keep forever</span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
