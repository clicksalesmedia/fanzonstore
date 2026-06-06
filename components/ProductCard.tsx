"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { categoryLabels } from "@/lib/products";
import { cn, formatPrice, isPrintifyImage } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/Rating";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);

  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;
  const isMockupImage = isPrintifyImage(product.image);

  function handleQuickAdd() {
    const variant = product.variants[0];
    if (!variant) return;
    add({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: variant.size,
      color: variant.color,
      qty: 1,
    });
    open();
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-pitch-400/40 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] focus-within:border-pitch-400/40">
      <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_42%,#ffffff_0%,#f7f7f2_48%,#e9ece5_100%)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className={cn(
            "object-center transition-transform duration-500 ease-out group-hover:scale-105",
            isMockupImage ? "object-contain p-5 sm:p-6" : "object-cover",
          )}
        />

        {product.badge && (
          <div className="absolute left-3 top-3 z-10">
            <Badge badge={product.badge} />
          </div>
        )}

        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Quick add ${product.name} to cart`}
          className="absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-pitch-400 text-ink-950 shadow-lg transition-all duration-200 hover:bg-pitch-300 cursor-pointer glow-pitch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-sport text-[11px] uppercase tracking-wider text-mist">
          {categoryLabels[product.category] ?? product.category}
        </span>

        <h3 className="min-h-[2.75rem] text-base font-semibold leading-snug text-chalk">
          <Link
            href={`/product/${product.slug}`}
            className="cursor-pointer transition-colors duration-200 after:absolute after:inset-0 hover:text-pitch-300 focus-visible:outline-none focus-visible:text-pitch-300"
          >
            {product.name}
          </Link>
        </h3>

        <Rating rating={product.rating} reviews={product.reviews} className="min-h-5" />

        <div className="mt-auto flex min-h-8 items-baseline gap-2 pt-1">
          <span className="font-sport text-lg font-semibold tracking-wide text-chalk">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <>
              <span className="font-sport text-sm text-white/30 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
              <span
                className={cn(
                  "ml-auto rounded-full bg-gold-400/15 px-2 py-0.5 font-sport text-[10px] font-semibold uppercase tracking-wider text-gold-300"
                )}
              >
                Sale
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
