import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryLabels } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import { Reveal } from "@/components/Reveal";

const ACCENTS: Record<string, string> = {
  tees: "#e0a92e",
  hoodies: "#00a85e",
  headwear: "#5cf0a8",
  accessories: "#ffe39a",
  drinkware: "#18e08a",
  prints: "#f5c451",
  jerseys: "#00c46f",
};

const BLURBS: Record<string, string> = {
  tees: "The staple of the summer.",
  hoodies: "For the cold-night kickoffs.",
  headwear: "Crowned in your colors.",
  accessories: "Matchday, sorted.",
  drinkware: "Every goal tastes better.",
  prints: "Frame the moment.",
  jerseys: "Wear the kit.",
};

export async function FeaturedCollections() {
  const products = await getCatalog();

  // build collections only from categories that actually have products
  const byCategory = new Map<string, { image: string; count: number }>();
  for (const p of products) {
    const entry = byCategory.get(p.category);
    if (entry) entry.count += 1;
    else byCategory.set(p.category, { image: p.image, count: 1 });
  }
  const collections = [...byCategory.entries()]
    .map(([slug, { image, count }]) => ({
      slug,
      title: categoryLabels[slug] ?? slug,
      image,
      count,
      accent: ACCENTS[slug] ?? "#18e08a",
      blurb: BLURBS[slug] ?? "Wear it your way.",
    }))
    .slice(0, 4);

  if (collections.length === 0) return null;

  return (
    <section className="container-page py-14 md:py-28">
      <div className="mb-8 flex flex-col gap-3 md:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sport text-xs text-pitch-300">Curated for the cup</p>
          <h2 className="font-display mt-3 text-4xl text-chalk sm:text-5xl">
            Shop by collection
          </h2>
        </div>
        <p className="max-w-sm text-sm text-mist">
          Find your fit for 2026 — every piece designed in the stadium-night
          palette.
        </p>
      </div>

      <Reveal
        stagger
        className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        {collections.map((collection, i) => (
          <Link
            key={collection.slug}
            href={`/shop?category=${collection.slug}`}
            className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-4 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:rounded-3xl sm:p-6"
          >
            <Image
              src={collection.image}
              alt={collection.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="-z-20 object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              priority={i < 2}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />
            <div
              className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full opacity-50 blur-[70px] transition-opacity duration-500 group-hover:opacity-90"
              style={{ background: collection.accent }}
              aria-hidden
            />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sport text-[0.65rem] uppercase tracking-wider text-pitch-300">
                  {collection.count} {collection.count === 1 ? "piece" : "pieces"}
                </p>
                <h3 className="font-display mt-1 text-xl text-chalk sm:text-2xl">
                  {collection.title}
                </h3>
                <p className="mt-1.5 text-xs text-mist sm:text-sm">{collection.blurb}</p>
              </div>
              <span
                className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-chalk transition-colors duration-300 group-hover:border-transparent group-hover:bg-pitch-400 group-hover:text-ink-950"
                aria-hidden
              >
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
