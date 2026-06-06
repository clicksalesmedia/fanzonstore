"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, PackageOpen } from "lucide-react";
import { categoryLabels } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ShopGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const [sort, setSort] = useState<SortKey>("featured");

  // categories actually present in the live catalog (keeps empty ones hidden)
  const presentCategories = useMemo(() => {
    const seen: string[] = [];
    for (const p of products) if (!seen.includes(p.category)) seen.push(p.category);
    return seen;
  }, [products]);

  const filtered = useMemo(() => {
    const base =
      activeCategory && presentCategories.includes(activeCategory)
        ? products.filter((p) => p.category === activeCategory)
        : products;

    const list = [...base];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [activeCategory, sort, products, presentCategories]);

  const pills = [
    { key: null as string | null, label: "All" },
    ...presentCategories.map((c) => ({ key: c, label: categoryLabels[c] ?? c })),
  ];

  return (
    <section className="container-page pb-24">
      <div className="sticky top-16 z-20 -mx-4 mb-8 bg-ink-950/80 px-4 py-4 backdrop-blur-md sm:top-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav
            aria-label="Product categories"
            className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {pills.map((pill) => {
              const isActive = (pill.key ?? null) === (activeCategory ?? null);
              const href = pill.key ? `/shop?category=${pill.key}` : "/shop";
              return (
                <Link
                  key={pill.label}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-full border px-4 py-2 font-sport text-xs uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                    isActive
                      ? "border-pitch-400 bg-pitch-400 text-ink-950 glow-pitch"
                      : "border-white/15 text-mist hover:border-pitch-400/50 hover:text-pitch-300",
                  )}
                >
                  {pill.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <p className="font-sport text-xs uppercase tracking-wider text-mist">
              {filtered.length}{" "}
              {filtered.length === 1 ? "product" : "products"}
            </p>
            <div className="relative">
              <label htmlFor="shop-sort" className="sr-only">
                Sort products
              </label>
              <select
                id="shop-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer appearance-none rounded-full border border-white/15 bg-ink-900 py-2 pl-4 pr-10 font-sport text-xs uppercase tracking-wider text-chalk transition-colors hover:border-pitch-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value} className="bg-ink-900">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-mist"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-20 text-center">
          <PackageOpen className="size-10 text-mist" aria-hidden />
          <p className="font-display text-2xl text-chalk">Nothing here yet</p>
          <p className="max-w-sm text-sm text-mist">
            No products match this category. Try browsing the full collection.
          </p>
          <Link
            href="/shop"
            className="cursor-pointer font-sport text-xs uppercase tracking-wider text-pitch-300 underline-offset-4 hover:underline"
          >
            View all products
          </Link>
        </div>
      ) : (
        <Reveal
          stagger
          className="grid grid-cols-2 auto-rows-fr gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i < 4}
            />
          ))}
        </Reveal>
      )}
    </section>
  );
}
