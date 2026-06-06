import "server-only";
import type { Bundle, BundleComponent } from "@prisma/client";
import type { Product } from "./types";
import { prisma } from "./db";
import { fetchPrintifyProduct } from "./printify";

/**
 * Storefront bundle data source. A Bundle is ONE product the shopper buys at a
 * fixed set price, fulfilled as 2+ separate Printify products. Bundle marketing
 * + pricing live in our DB; component variants/images are fetched LIVE from
 * Printify so they never drift.
 *
 * UNITS: Bundle.price/compareAtPrice are CENTS in the DB. The storefront works
 * in DOLLARS, so the card/detail adapters divide by 100. Checkout reads the
 * authoritative CENTS price straight from the DB (never trusts the client).
 */

export type BundleWithComponents = Bundle & { components: BundleComponent[] };

export async function getBundles(): Promise<BundleWithComponents[]> {
  try {
    return await prisma.bundle.findMany({
      where: { active: true },
      include: { components: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("[bundles] getBundles failed:", e);
    return [];
  }
}

export async function getBundleBySlug(
  slug: string,
): Promise<BundleWithComponents | null> {
  try {
    return await prisma.bundle.findUnique({
      where: { slug },
      include: { components: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (e) {
    console.error("[bundles] getBundleBySlug failed:", e);
    return null;
  }
}

const ALLOWED_BADGES = ["Bestseller", "New", "Limited", "Host Nation"] as const;

function castBadge(badge: string | null): Product["badge"] | undefined {
  return ALLOWED_BADGES.includes(badge as (typeof ALLOWED_BADGES)[number])
    ? (badge as Product["badge"])
    : undefined;
}

/**
 * Adapt a Bundle into the existing `Product` shape so ShopGrid/ProductCard need
 * no structural change. The synthetic id is namespaced `bundle:<id>` so it never
 * collides with a Printify product id and so ProductCard can route it to
 * /bundle/[slug] instead of /product/[slug].
 */
export function bundleToProductCard(bundle: BundleWithComponents): Product {
  return {
    id: `bundle:${bundle.id}`,
    slug: bundle.slug,
    name: bundle.name,
    category: bundle.category as Product["category"],
    price: bundle.price / 100,
    compareAtPrice:
      bundle.compareAtPrice != null ? bundle.compareAtPrice / 100 : undefined,
    image: bundle.image,
    description: bundle.description,
    highlights: [],
    sizes: [],
    colors: [],
    variants: [],
    badge: castBadge(bundle.badge),
    rating: 5,
    reviews: 0,
    printfulProductId: 0,
  };
}

export interface BundleDetailComponent {
  label: string;
  sortOrder: number;
  lockedVariantId: number | null;
  /** restricted color list when configured, else null */
  allowedColors: string[] | null;
  /** live component product from Printify */
  product: Product;
}

export interface BundleDetail {
  bundle: BundleWithComponents;
  components: BundleDetailComponent[];
}

function parseAllowedColors(csv: string | null): string[] | null {
  if (!csv) return null;
  const list = csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

/**
 * Full bundle for the detail page: each component resolved to its LIVE Printify
 * product (variants/sizes/colors/images). Returns null if the bundle is missing.
 * A component whose Printify product no longer exists is dropped, so the page can
 * surface "currently unavailable" if components.length is short.
 */
export async function getBundleDetail(
  slug: string,
): Promise<BundleDetail | null> {
  const bundle = await getBundleBySlug(slug);
  if (!bundle) return null;

  const resolved = await Promise.all(
    bundle.components.map(async (c) => {
      const product = await fetchPrintifyProduct(c.productId);
      if (!product) return null;
      const allowedColors = parseAllowedColors(c.allowedColors);
      // Apply optional color restriction so the picker only offers allowed colors.
      const filtered: Product = allowedColors
        ? {
            ...product,
            colors: product.colors.filter((col) =>
              allowedColors.some(
                (a) => a.toLowerCase() === col.name.toLowerCase(),
              ),
            ),
            variants: product.variants.filter((v) =>
              allowedColors.some(
                (a) => a.toLowerCase() === v.color.toLowerCase(),
              ),
            ),
          }
        : product;
      return {
        label: c.label,
        sortOrder: c.sortOrder,
        lockedVariantId: c.lockedVariantId,
        allowedColors,
        product: filtered,
      } satisfies BundleDetailComponent;
    }),
  );

  return {
    bundle,
    components: resolved.filter((c): c is BundleDetailComponent => c !== null),
  };
}
