import { Suspense } from "react";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import ShopGrid from "@/components/shop/ShopGrid";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "World Cup 2026 Fan Gear",
  description:
    "Shop Fanzonstore World Cup 2026 fan gear: emotional soccer tees, hoodies, caps, mugs, and matchday essentials made for supporters who want to belong.",
};

function ShopGridFallback() {
  return (
    <div className="container-page pb-24">
      <div className="mb-8 h-12 animate-pulse rounded-full bg-white/5" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-2xl bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await getCatalog();
  return (
    <main className="pt-28 sm:pt-32">
      <Reveal as="header" className="container-page pb-10 text-center">
        <p className="font-sport text-xs uppercase tracking-[0.3em] text-pitch-400">
          Fanzonstore · World Cup 2026
        </p>
        <h1 className="mt-4 font-display text-5xl text-chalk sm:text-6xl lg:text-7xl">
          Fan Gear
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-mist">
          Pull on your colors. This is World Cup 2026 fan gear for the believers:
          the ones who feel every kick, every roar, every goosebump. Find the
          piece that says you belonged to the summer the world will never forget.
        </p>
      </Reveal>

      <Suspense fallback={<ShopGridFallback />}>
        <ShopGrid products={products} />
      </Suspense>
    </main>
  );
}
