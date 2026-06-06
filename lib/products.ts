import type { Collection, Product } from "./types";

/**
 * Mock catalog modeled after a Printful print-on-demand store.
 * Product/variant ids mirror Printful's shape so this can later be swapped
 * for live Printful Sync Product / Catalog API responses.
 */

const APPAREL_SIZES = ["S", "M", "L", "XL", "2XL"];

function apparelVariants(
  base: number,
  colors: { name: string; hex: string }[],
) {
  const sizes = APPAREL_SIZES;
  const out = [] as Product["variants"];
  let n = base;
  for (const c of colors) {
    for (const s of sizes) {
      out.push({
        id: `${base}-${c.name}-${s}`.toLowerCase().replace(/\s+/g, "-"),
        size: s,
        color: c.name,
        hex: c.hex,
        printfulVariantId: n++,
      });
    }
  }
  return out;
}

const EMERALD = { name: "Emerald", hex: "#00a85e" };
const INK = { name: "Ink", hex: "#0a1212" };
const CHALK = { name: "Chalk", hex: "#f4f7f5" };
const GOLD = { name: "Gold", hex: "#e0a92e" };

export const products: Product[] = [
  {
    id: "wc-jersey-home",
    slug: "host-jersey",
    name: "Host Jersey",
    category: "jerseys",
    price: 74,
    compareAtPrice: 89,
    image: "/images/products/jersey-home.webp",
    description:
      "A breathable World Cup 2026 fan jersey made for the supporters who turn every room into a home stand. Wear it for the anthem, the watch party, and the moment you feel like you belong to something bigger.",
    highlights: [
      "Breathable matchday feel",
      "Built for loyal supporters",
      "Athletic fan fit",
    ],
    sizes: APPAREL_SIZES,
    colors: [EMERALD, INK],
    variants: apparelVariants(7001, [EMERALD, INK]),
    badge: "Bestseller",
    rating: 4.9,
    reviews: 412,
    printfulProductId: 71,
  },
  {
    id: "wc-tee-classic",
    slug: "classic-tee",
    name: "Classic Tee",
    category: "tees",
    price: 32,
    image: "/images/products/tee-white.webp",
    description:
      "A soft World Cup 2026 fan tee for the believers who feel every pass, every miss, and every roar. Easy to wear, easy to love, and made to say you were part of the summer.",
    highlights: ["Soft supporter fit", "Made for watch parties", "Unisex cut"],
    sizes: APPAREL_SIZES,
    colors: [CHALK, INK, EMERALD],
    variants: apparelVariants(7101, [CHALK, INK, EMERALD]),
    badge: "Bestseller",
    rating: 4.8,
    reviews: 968,
    printfulProductId: 71,
  },
  {
    id: "wc-hoodie-champions",
    slug: "champions-hoodie",
    name: "Champions Hoodie",
    category: "hoodies",
    price: 64,
    compareAtPrice: 78,
    image: "/images/products/hoodie-black.webp",
    description:
      "A warm World Cup 2026 hoodie for late kickoffs, road trips, and the nights when belief runs louder than the crowd. Pull it on when your side needs one more voice.",
    highlights: ["Cozy fleece feel", "Made for cold match nights", "Double-lined hood"],
    sizes: APPAREL_SIZES,
    colors: [INK, EMERALD],
    variants: apparelVariants(7201, [INK, EMERALD]),
    badge: "New",
    rating: 4.9,
    reviews: 287,
    printfulProductId: 146,
  },
  {
    id: "wc-cap-unity",
    slug: "unity-cap",
    name: "Unity Cap",
    category: "headwear",
    price: 28,
    image: "/images/products/cap.webp",
    description:
      "An easy World Cup 2026 supporter cap for everyday pride. Wear it to the store, the stadium queue, or wherever your matchday loyalty follows you.",
    highlights: ["Everyday fan style", "Adjustable brass buckle", "One size"],
    sizes: ["One Size"],
    colors: [{ name: "Cream", hex: "#efe7d4" }, GOLD],
    variants: [
      { id: "cap-cream", size: "One Size", color: "Cream", hex: "#efe7d4", printfulVariantId: 7301 },
      { id: "cap-gold", size: "One Size", color: "Gold", hex: "#e0a92e", printfulVariantId: 7302 },
    ],
    rating: 4.7,
    reviews: 154,
    printfulProductId: 206,
  },
  {
    id: "wc-mug-golden",
    slug: "golden-goal-mug",
    name: "Golden Goal Mug",
    category: "drinkware",
    price: 18,
    image: "/images/products/mug.webp",
    description:
      "A World Cup 2026 fan mug for early kickoffs, replay mornings, and every coffee poured while the group chat is still arguing about the match.",
    highlights: ["11oz / 15oz options", "Matchday desk energy", "Dishwasher safe"],
    sizes: ["11oz", "15oz"],
    colors: [CHALK],
    variants: [
      { id: "mug-11", size: "11oz", color: "Chalk", hex: "#f4f7f5", printfulVariantId: 7401 },
      { id: "mug-15", size: "15oz", color: "Chalk", hex: "#f4f7f5", printfulVariantId: 7402 },
    ],
    rating: 4.8,
    reviews: 223,
    printfulProductId: 19,
  },
  {
    id: "wc-poster-stadium",
    slug: "stadium-nights-print",
    name: "Stadium Nights Print",
    category: "prints",
    price: 24,
    image: "/images/products/poster.webp",
    description:
      "World Cup 2026 wall art for the fan room, bedroom, or office corner that becomes sacred during tournament month. A daily reminder of the lights, noise, and shared belief.",
    highlights: ["2026 soccer wall art", "Multiple sizes", "Frame not included"],
    sizes: ['12×16"', '18×24"', '24×36"'],
    colors: [CHALK],
    variants: [
      { id: "poster-s", size: '12×16"', color: "Chalk", hex: "#f4f7f5", printfulVariantId: 7501 },
      { id: "poster-m", size: '18×24"', color: "Chalk", hex: "#f4f7f5", printfulVariantId: 7502 },
      { id: "poster-l", size: '24×36"', color: "Chalk", hex: "#f4f7f5", printfulVariantId: 7503 },
    ],
    badge: "Limited",
    rating: 4.9,
    reviews: 96,
    printfulProductId: 1,
  },
  {
    id: "wc-tote-supporter",
    slug: "supporter-tote",
    name: "Supporter Tote",
    category: "accessories",
    price: 22,
    image: "/images/products/tote.webp",
    description:
      "A sturdy soccer fan tote for snacks, scarves, extra layers, and the little rituals that make matchday feel like matchday. Carry the summer with you.",
    highlights: ["Matchday-ready carry", "Reinforced handles", "Roomy 15L"],
    sizes: ["One Size"],
    colors: [{ name: "Natural", hex: "#e7dcc4" }],
    variants: [
      { id: "tote-natural", size: "One Size", color: "Natural", hex: "#e7dcc4", printfulVariantId: 7601 },
    ],
    rating: 4.7,
    reviews: 178,
    printfulProductId: 643,
  },
  {
    id: "wc-scarf-supporter",
    slug: "terrace-scarf",
    name: "Terrace Scarf",
    category: "accessories",
    price: 26,
    image: "/images/products/scarf.webp",
    description:
      "A World Cup 2026 supporter scarf made for raised arms, loud rooms, and the kind of pride you can feel in your chest. Hold it high when the moment comes.",
    highlights: ["Soft supporter knit", "Double-sided weave", "Fringed ends"],
    sizes: ["One Size"],
    colors: [EMERALD],
    variants: [
      { id: "scarf-emerald", size: "One Size", color: "Emerald", hex: "#00a85e", printfulVariantId: 7701 },
    ],
    badge: "Limited",
    rating: 5.0,
    reviews: 64,
    printfulProductId: 532,
  },
  {
    id: "wc-longsleeve",
    slug: "matchday-long-sleeve",
    name: "Matchday Long Sleeve",
    category: "tees",
    price: 38,
    image: "/images/products/longsleeve.webp",
    description:
      "A World Cup 2026 long sleeve for cooler nights, nervous second halves, and fans who keep their colors on after the final whistle.",
    highlights: ["Mid-weight fan layer", "Ribbed cuffs", "Unisex fit"],
    sizes: APPAREL_SIZES,
    colors: [{ name: "Cream", hex: "#efe7d4" }, INK],
    variants: apparelVariants(7801, [{ name: "Cream", hex: "#efe7d4" }, INK]),
    badge: "New",
    rating: 4.8,
    reviews: 71,
    printfulProductId: 163,
  },
  {
    id: "wc-beanie",
    slug: "extra-time-beanie",
    name: "Extra Time Beanie",
    category: "headwear",
    price: 24,
    image: "/images/products/beanie.webp",
    description:
      "A cozy soccer fan beanie for cold-night kickoffs, winter watch parties, and every supporter who stays locked in until extra time.",
    highlights: ["Cold matchday comfort", "Supporter patch look", "One size"],
    sizes: ["One Size"],
    colors: [INK],
    variants: [
      { id: "beanie-ink", size: "One Size", color: "Ink", hex: "#0a1212", printfulVariantId: 7901 },
    ],
    rating: 4.7,
    reviews: 58,
    printfulProductId: 380,
  },
];

export const collections: Collection[] = [
  {
    slug: "jerseys",
    title: "Jerseys",
    blurb: "Match-grade kits for every supporter.",
    image: "/images/products/jersey-home.webp",
    accent: "#00a85e",
  },
  {
    slug: "tees",
    title: "Tees & Tops",
    blurb: "Everyday staples, tournament-ready.",
    image: "/images/products/tee-white.webp",
    accent: "#e0a92e",
  },
  {
    slug: "headwear",
    title: "Headwear",
    blurb: "Caps & beanies with the gold crest.",
    image: "/images/products/cap.webp",
    accent: "#5cf0a8",
  },
  {
    slug: "accessories",
    title: "Accessories",
    blurb: "Scarves, totes & matchday extras.",
    image: "/images/products/tote.webp",
    accent: "#ffe39a",
  },
];

export const categoryLabels: Record<string, string> = {
  jerseys: "Jerseys",
  tees: "Tees & Tops",
  hoodies: "Hoodies",
  headwear: "Headwear",
  accessories: "Accessories",
  drinkware: "Drinkware",
  prints: "Prints",
};

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getRelated(slug: string, limit = 4): Product[] {
  const p = getProduct(slug);
  if (!p) return products.slice(0, limit);
  return products
    .filter((x) => x.slug !== slug && x.category === p.category)
    .concat(products.filter((x) => x.slug !== slug && x.category !== p.category))
    .slice(0, limit);
}

export const allCategories = Object.keys(categoryLabels);
