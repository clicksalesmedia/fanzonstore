import "server-only";
import type { Product, ProductImage, ProductVariant } from "./types";

/**
 * Server-side Printify API client + mappers.
 * Never import this from a client component — it carries the API token.
 */

const BASE = "https://api.printify.com/v1";
const TOKEN = process.env.PRINTIFY_API_TOKEN;
const SHOP = process.env.PRINTIFY_SHOP_ID;

export const printifyConfigured = Boolean(TOKEN && SHOP);

interface PFImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}
interface PFVariant {
  id: number;
  title: string;
  /** retail price in integer cents (what we charge) */
  price: number;
  /** print provider cost in integer cents */
  cost?: number;
  /** offered in the shop */
  is_enabled: boolean;
  /** the print provider can actually produce this variant */
  is_available?: boolean;
  is_default?: boolean;
  options: number[];
}
interface PFOptionValue {
  id: number;
  title: string;
  colors?: string[];
}
interface PFOption {
  name: string;
  type: string;
  values: PFOptionValue[];
}
export interface PFProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: PFOption[];
  variants: PFVariant[];
  images: PFImage[];
  visible: boolean;
  /** locked while Printify (re)generates art/mockups — field edits still persist */
  is_locked?: boolean;
}

async function pf<T>(
  endpoint: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  const { revalidate = 60, ...rest } = init ?? {};
  const res = await fetch(`${BASE}${endpoint}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "fanzonstore",
      ...(rest.headers ?? {}),
    },
    // tag reads so a Printify webhook (or /api/revalidate) can refresh instantly
    next: rest.method ? undefined : { revalidate, tags: ["printify"] },
    cache: rest.method ? "no-store" : undefined,
  });
  if (!res.ok) {
    throw new Error(`Printify ${endpoint} -> ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

// ---- mapping ---------------------------------------------------------------

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  jerseys: "/images/products/jersey-home.webp",
  tees: "/images/products/tee-white.webp",
  hoodies: "/images/products/hoodie-black.webp",
  headwear: "/images/products/cap.webp",
  accessories: "/images/products/tote.webp",
  drinkware: "/images/products/mug.webp",
  prints: "/images/products/poster.webp",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function tag(tags: string[], prefix: string) {
  const t = tags.find((x) => x.startsWith(`${prefix}:`));
  return t ? t.slice(prefix.length + 1) : undefined;
}

/**
 * Infer a storefront category for products that lack our `category:*` tag
 * (e.g. items created directly in the Printify UI), from their title + tags.
 */
function inferCategory(p: PFProduct): string {
  const hay = `${p.title} ${(p.tags ?? []).join(" ")}`.toLowerCase();
  const has = (...words: string[]) => words.some((w) => hay.includes(w));
  if (has("hoodie", "sweatshirt", "sweater", "crewneck")) return "hoodies";
  if (has("mug", "drinkware", "bottle", "tumbler", "cup")) return "drinkware";
  if (has("cap", " hat", "beanie", "headwear", "snapback")) return "headwear";
  if (has("tote", "bag", "backpack", "pouch")) return "accessories";
  if (has("poster", "wall art", "canvas print", " print")) return "prints";
  if (has("jersey")) return "jerseys";
  if (has("t-shirt", "tshirt", "tee", "shirt", "top", "longsleeve")) return "tees";
  return "tees";
}

/** Deterministic pseudo-rating so the storefront looks alive (no real reviews in POD). */
function synthRating(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rating = 4.6 + (h % 5) / 10; // 4.6 – 5.0
  const reviews = 40 + (h % 900);
  return { rating: Math.round(rating * 10) / 10, reviews };
}

const HIGHLIGHTS: Record<string, string[]> = {
  tees: ["For USA soccer fans", "Soft everyday fan fit", "Printed on demand"],
  hoodies: ["Warm matchday layer", "Made for watch parties", "Printed on demand"],
  headwear: ["Easy supporter style", "Adjustable everyday fit", "One size"],
  accessories: ["Matchday-ready carry", "Made for loyal fans", "Printed on demand"],
  drinkware: ["Morning-after-the-match mug", "Glossy ceramic finish", "Dishwasher safe"],
  prints: ["2026 soccer wall art", "Built for fan rooms", "Frame not included"],
  jerseys: ["Breathable fan layer", "Made for the faithful", "Printed on demand"],
};

const PRODUCT_COPY_OVERRIDES: Record<string, { name: string; description: string }> = {
  "6a2404648ca667581803202e": {
    name: "One Nation, One Team USA 2026 Soccer Tee",
    description:
      "For the fans who feel the anthem before the whistle. This USA 2026 soccer tee brings everyone under one flag, one team, and one shared summer of belief. A proud everyday shirt for watch parties, street celebrations, and anyone who wants to belong to the moment.",
  },
  "6a240312ebab40861f089e07": {
    name: "Here for '26 Kids USA Soccer Tee",
    description:
      "Made for the little supporter stepping into his first big 2026 soccer summer beside Dad. This kids heavy cotton tee is part of the father-and-son matching set: pair it with the Was There '94 Dad tee to turn family history into a new matchday memory.",
  },
  "6a240049beda42506c04c9af": {
    name: "Was There '94 Dad USA Soccer Tee",
    description:
      "For the dad who remembers 1994 and now gets to pass the feeling down in 2026. This unisex heavy cotton tee is part of the father-and-son matching set: pair it with the Here for '26 kids tee and wear the story together.",
  },
  "6a231f5b7eee7f279102d21e": {
    name: "America's Time 1994-2026 Soccer Tee",
    description:
      "From the memories of 1994 to the promise of 2026, this USA soccer tee is for fans who believe this summer belongs to all of us. Wear it for the watch party, the family gathering, and the feeling that your country is part of something bigger.",
  },
  "6a231090ea7700f32b032e58": {
    name: "America's Time USA Trophy Soccer Tee",
    description:
      "A bold USA soccer trophy tee for supporters ready to dream out loud. Built for 2026 pride, shared chants, and the feeling of standing with millions of fans who believe America's time is here.",
  },
};

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function shortPrintifyTitle(title: string, category: string) {
  const raw = title.trim();
  const lower = raw.toLowerCase();
  if (lower.includes("red white") && lower.includes("goal")) return "Red White Goal Tee";
  if (lower.includes("this time") && lower.includes("our house")) return "This Time Tee";
  if (lower.includes("our house") && lower.includes("eagle")) return "Our House Tee";
  if (lower.includes("american eagle")) return "Eagle Pride Tee";
  if (lower.includes("soccer ball") && lower.includes("flag")) return "Flag Goal Tee";

  const first = raw
    .split("|")[0]
    .replace(/\b(unisex|heavy|cotton|t-shirt|shirt|soccer|football|graphic|design)\b/gi, "")
    .replace(/[^\w\s'&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = first.split(" ").filter(Boolean).slice(0, 4).join(" ");
  if (words.length >= 8) return words;

  const fallback: Record<string, string> = {
    tees: "Fan Tee",
    hoodies: "Fan Hoodie",
    headwear: "Fan Cap",
    drinkware: "Fan Mug",
    prints: "Fan Print",
    accessories: "Fan Essential",
    jerseys: "Fan Jersey",
  };
  return fallback[category] ?? "Fan Gear";
}

function emotionalDescription(p: PFProduct, category: string, displayName: string) {
  const hay = `${p.title} ${(p.tags ?? []).join(" ")} ${stripHtml(p.description ?? "")}`.toLowerCase();
  const usa = /(usa|american|flag|eagle|red white|our house)/i.test(hay);
  const audience = usa
    ? "USA soccer fans"
    : "World Cup 2026 supporters";
  const categoryCopy: Record<string, string> = {
    tees:
      "soft fan tee made for watch parties, street celebrations, and every shout at the screen",
    hoodies:
      "warm supporter hoodie for late kickoffs, road trips, and cold nights when belief still runs hot",
    headwear:
      "easy fan cap for matchday errands, stadium queues, and every casual show of loyalty",
    drinkware:
      "ceramic fan mug for early kickoffs, post-match replays, and the mornings after big wins",
    prints:
      "soccer wall art for bedrooms, fan caves, and the corner of home that always feels like matchday",
    accessories:
      "matchday essential made to carry the colors, snacks, scarves, and small rituals fans never leave behind",
    jerseys:
      "breathable supporter layer for watch parties, summer streets, and standing with your side",
  };
  const original = stripHtml(p.description ?? "");
  const materialPatterns: Record<string, RegExp> = {
    tees: /\b(100% cotton|heavy cotton|cotton|polyester)\b/i,
    hoodies: /\b(fleece|cotton|polyester)\b/i,
    drinkware: /\b(ceramic|mug)\b/i,
    accessories: /\b(canvas|cotton|polyester)\b/i,
    prints: /\b(poster|matte paper|paper)\b/i,
    jerseys: /\b(polyester|mesh|knit)\b/i,
    headwear: /\b(cotton|polyester|canvas)\b/i,
  };
  const materialHint = original.match(materialPatterns[category])?.[0];
  const material = materialHint ? ` with a ${materialHint} feel` : "";

  return `${displayName} is a ${categoryCopy[category] ?? categoryCopy.tees}${material}. Made for ${audience} who want more than merch: a piece of the 2026 soccer moment, a way to belong, and a reason to say you were there.`;
}

/**
 * Resolve each variant's color + size from Printify's OPTION definitions rather
 * than by splitting the title positionally. Different products order the title
 * differently ("White / S" vs "XL / White"), so a positional split mislabels
 * color as size and vice-versa. Here we map each variant's option value ids to
 * the color option (type "color") and treat every other option as size.
 */
function resolveVariantAttrs(
  p: PFProduct,
): Map<number, { color: string; size: string; hex: string }> {
  const colorOption = p.options.find((o) => o.type === "color");
  const colorVals = new Map<number, { title: string; hex: string }>();
  colorOption?.values.forEach((v) =>
    colorVals.set(v.id, { title: v.title, hex: v.colors?.[0] ?? "#1b302d" }),
  );
  // Any option that isn't the color option contributes the "size" value
  // (apparel is normally color + size; this is order-independent).
  const sizeVals = new Map<number, string>();
  for (const o of p.options) {
    if (o === colorOption) continue;
    o.values.forEach((v) => sizeVals.set(v.id, v.title));
  }

  const out = new Map<number, { color: string; size: string; hex: string }>();
  for (const v of p.variants) {
    let color = "Default";
    let hex = "#1b302d";
    let size = "";
    for (const oid of v.options ?? []) {
      const c = colorVals.get(oid);
      if (c) {
        color = c.title;
        hex = c.hex;
      }
      const s = sizeVals.get(oid);
      if (s !== undefined) size = s;
    }
    // Fallback to title split only when options didn't resolve (rare).
    if (!size) {
      const parts = v.title.split(" / ").map((s) => s.trim());
      size = parts.length > 1 ? parts[parts.length - 1] : parts[0] || "One Size";
    }
    out.set(v.id, { color, size, hex });
  }
  return out;
}

export function mapProduct(p: PFProduct): Product {
  const category = tag(p.tags ?? [], "category") ?? inferCategory(p);
  const badge = tag(p.tags ?? [], "badge") as Product["badge"] | undefined;
  const copyOverride = PRODUCT_COPY_OVERRIDES[p.id];
  const name = copyOverride?.name ?? shortPrintifyTitle(p.title, category);
  const enabled = p.variants.filter((v) => v.is_enabled);
  const source = enabled.length ? enabled : p.variants;

  const attrs = resolveVariantAttrs(p);

  const sizes: string[] = [];
  const colors: { name: string; hex: string }[] = [];
  const variants: ProductVariant[] = source.map((v) => {
    const a = attrs.get(v.id) ?? { color: "Default", size: "One Size", hex: "#1b302d" };
    if (!sizes.includes(a.size)) sizes.push(a.size);
    if (!colors.some((c) => c.name === a.color))
      colors.push({ name: a.color, hex: a.hex });
    return {
      id: String(v.id),
      size: a.size,
      color: a.color,
      hex: a.hex,
      printfulVariantId: v.id,
    };
  });

  // images: Printify mockups when present, else category fallback. Keep the
  // per-variant association (variant_ids) so the PDP can swap the gallery when
  // the shopper changes color/size.
  const images: ProductImage[] = (p.images ?? []).map((i) => ({
    src: i.src,
    variantIds: i.variant_ids ?? [],
    position: i.position,
    isDefault: i.is_default,
  }));
  const mockups = images.map((i) => i.src);
  const defaultImg = images.find((i) => i.isDefault)?.src;
  const image = defaultImg ?? mockups[0] ?? CATEGORY_FALLBACK_IMAGE[category];
  const price = Math.min(...source.map((v) => v.price)) / 100;
  const { rating, reviews } = synthRating(p.id);

  return {
    id: p.id,
    slug: `${slugify(name)}-${p.id.slice(0, 6)}`,
    name,
    category: category as Product["category"],
    price,
    image,
    hoverImage: mockups[1],
    gallery: mockups.slice(0, 6),
    images,
    description: copyOverride?.description ?? emotionalDescription(p, category, name),
    highlights: HIGHLIGHTS[category] ?? HIGHLIGHTS.tees,
    sizes,
    colors,
    variants,
    badge,
    rating,
    reviews,
    printfulProductId: 0,
    printifyProductId: p.id,
  };
}

// ---- reads -----------------------------------------------------------------

export async function fetchPrintifyProducts(): Promise<Product[]> {
  if (!printifyConfigured) return [];
  const data = await pf<{ data: PFProduct[] }>(
    `/shops/${SHOP}/products.json?limit=50`,
  );
  // show every visible product in the shop (our pipeline's + any added in the
  // Printify UI). Category is inferred when our `category:*` tag is absent.
  return data.data.filter((p) => p.visible !== false).map(mapProduct);
}

export async function fetchPrintifyProduct(id: string): Promise<Product | null> {
  if (!printifyConfigured) return null;
  try {
    const p = await pf<PFProduct>(`/shops/${SHOP}/products/${id}.json`);
    return mapProduct(p);
  } catch {
    return null;
  }
}

// ---- orders ----------------------------------------------------------------

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string; // ISO2
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}
export interface OrderLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

/**
 * Create a Printify order. By default the order is created but NOT sent to
 * production (no charge) — set PRINTIFY_AUTO_PRODUCTION=true to auto-submit
 * after a successful (real) payment. Returns the Printify order id.
 */
export async function createPrintifyOrder(input: {
  externalId: string;
  label?: string;
  address: ShippingAddress;
  lineItems: OrderLineItem[];
  shippingMethod?: number;
}): Promise<{ id: string; sentToProduction: boolean }> {
  if (!printifyConfigured) throw new Error("Printify not configured");
  const order = await pf<{ id: string }>(`/shops/${SHOP}/orders.json`, {
    method: "POST",
    body: JSON.stringify({
      external_id: input.externalId,
      label: input.label ?? input.externalId,
      line_items: input.lineItems,
      shipping_method: input.shippingMethod ?? 1,
      send_shipping_notification: false,
      address_to: input.address,
    }),
  });

  let sentToProduction = false;
  if (process.env.PRINTIFY_AUTO_PRODUCTION === "true") {
    await pf(`/shops/${SHOP}/orders/${order.id}/send_to_production.json`, {
      method: "POST",
    });
    sentToProduction = true;
  }
  return { id: order.id, sentToProduction };
}

// ---- shipping --------------------------------------------------------------

/**
 * Printify order `shipping_method` enum. The connected print provider for this
 * shop currently quotes only `standard`; higher tiers surface automatically if
 * a provider returns them.
 */
export const SHIPPING_METHOD = {
  standard: 1,
  priority: 2,
  express: 3,
  economy: 4,
} as const;

export type ShippingTier = keyof typeof SHIPPING_METHOD;

/** All amounts in integer CENTS, keyed by tier. `standard` is always present on success. */
export type ShippingRates = Partial<Record<ShippingTier, number>>;

/**
 * Live shipping quote from Printify for a cart + destination.
 * Returns rates in CENTS. Throws if Printify can't quote (e.g. missing/invalid
 * address) — callers should try/catch and fall back gracefully.
 */
export async function getShippingCost(input: {
  lineItems: OrderLineItem[];
  address: ShippingAddress;
}): Promise<ShippingRates> {
  if (!printifyConfigured) throw new Error("Printify not configured");
  const rates = await pf<ShippingRates>(`/shops/${SHOP}/orders/shipping.json`, {
    method: "POST",
    body: JSON.stringify({
      line_items: input.lineItems,
      address_to: input.address,
    }),
  });
  return rates;
}

// ---- admin reads (full, unfiltered variant data) ---------------------------

export interface AdminVariant {
  id: number;
  title: string;
  color: string;
  size: string;
  hex: string;
  /** retail price in cents */
  price: number;
  /** provider cost in cents */
  cost: number;
  isEnabled: boolean;
  isAvailable: boolean;
  isDefault: boolean;
}

export interface AdminProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  visible: boolean;
  isLocked: boolean;
  image: string;
  gallery: string[];
  tags: string[];
  variants: AdminVariant[];
}

export interface AdminProductSummary {
  id: string;
  title: string;
  category: string;
  image: string;
  visible: boolean;
  isLocked: boolean;
  /** min/max retail price across variants, in cents */
  minPrice: number;
  maxPrice: number;
  variantCount: number;
  enabledCount: number;
}

function toAdminVariants(p: PFProduct): AdminVariant[] {
  const attrs = resolveVariantAttrs(p);
  return p.variants.map((v) => {
    const a = attrs.get(v.id) ?? { color: "Default", size: "One Size", hex: "#1b302d" };
    return {
      id: v.id,
      title: v.title,
      color: a.color,
      size: a.size,
      hex: a.hex,
      price: v.price,
      cost: v.cost ?? 0,
      isEnabled: v.is_enabled,
      isAvailable: v.is_available ?? true,
      isDefault: v.is_default ?? false,
    };
  });
}

function toAdminProduct(p: PFProduct): AdminProduct {
  const category = tag(p.tags ?? [], "category") ?? inferCategory(p);
  const badge = tag(p.tags ?? [], "badge");
  const mockups = (p.images ?? []).map((i) => i.src);
  const defaultImg = p.images?.find((i) => i.is_default)?.src;
  return {
    id: p.id,
    title: p.title,
    description: stripHtml(p.description ?? ""),
    category,
    badge,
    visible: p.visible !== false,
    isLocked: p.is_locked === true,
    image: defaultImg ?? mockups[0] ?? CATEGORY_FALLBACK_IMAGE[category],
    gallery: mockups.slice(0, 6),
    tags: p.tags ?? [],
    variants: toAdminVariants(p),
  };
}

/** All products for the admin list (includes hidden + every variant). Uncached. */
export async function fetchAdminProducts(): Promise<AdminProductSummary[]> {
  if (!printifyConfigured) return [];
  const data = await pf<{ data: PFProduct[] }>(
    `/shops/${SHOP}/products.json?limit=50`,
    { revalidate: 0 },
  );
  return data.data
    .filter((p) => !(p as { is_deleted?: boolean }).is_deleted)
    .map((p) => {
      const prices = p.variants.map((v) => v.price).filter((n) => n > 0);
      const mockups = (p.images ?? []).map((i) => i.src);
      const defaultImg = p.images?.find((i) => i.is_default)?.src;
      const category = tag(p.tags ?? [], "category") ?? inferCategory(p);
      return {
        id: p.id,
        title: p.title,
        category,
        image: defaultImg ?? mockups[0] ?? CATEGORY_FALLBACK_IMAGE[category],
        visible: p.visible !== false,
        isLocked: p.is_locked === true,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        variantCount: p.variants.length,
        enabledCount: p.variants.filter((v) => v.is_enabled).length,
      };
    });
}

/** One product with the FULL variant set for the admin editor. Uncached. */
export async function fetchPrintifyProductForAdmin(
  id: string,
): Promise<AdminProduct | null> {
  if (!printifyConfigured) return null;
  try {
    const p = await pf<PFProduct>(`/shops/${SHOP}/products/${id}.json`, {
      revalidate: 0,
    });
    return toAdminProduct(p);
  } catch {
    return null;
  }
}

// ---- admin mutations (PUT product) -----------------------------------------

export interface ProductPatch {
  title?: string;
  description?: string;
  tags?: string[];
  /** SPARSE — only the variants that changed. Printify merges by id. */
  variants?: { id: number; price?: number; is_enabled?: boolean }[];
  visible?: boolean;
}

/**
 * Update a Printify product. Sends ONLY the provided keys with a SPARSE
 * variants array (Printify merges variants by id and leaves omitted ones
 * untouched). Never sends print_areas/options/images, so it is safe on locked
 * products (field edits persist; only art edits are blocked while locked).
 */
export async function updatePrintifyProduct(
  id: string,
  patch: ProductPatch,
): Promise<void> {
  if (!printifyConfigured) throw new Error("Printify not configured");
  const body: Record<string, unknown> = {};
  if (patch.title !== undefined) body.title = patch.title;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.tags !== undefined) body.tags = patch.tags;
  if (patch.visible !== undefined) body.visible = patch.visible;
  if (patch.variants?.length) body.variants = patch.variants;
  if (Object.keys(body).length === 0) return;

  await pf(`/shops/${SHOP}/products/${id}.json`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Build the `tags` array for a product, replacing our `category:*` / `badge:*`
 * control tags while preserving any other tags it already has.
 */
export function buildControlTags(
  existing: string[],
  opts: { category?: string; badge?: string },
): string[] {
  const kept = existing.filter(
    (t) => !t.startsWith("category:") && !t.startsWith("badge:"),
  );
  if (opts.category) kept.push(`category:${opts.category}`);
  if (opts.badge) kept.push(`badge:${opts.badge}`);
  return kept;
}
