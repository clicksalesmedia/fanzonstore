import "server-only";
import type { Product } from "./types";
import { products as mockProducts } from "./products";
import { fetchPrintifyProducts, printifyConfigured } from "./printify";

/**
 * The storefront catalog. Source of truth is Printify; if Printify is
 * unconfigured / empty / unreachable we fall back to the static mock catalog
 * so the store always renders.
 */
export async function getCatalog(): Promise<Product[]> {
  if (!printifyConfigured) return mockProducts;
  try {
    const live = await fetchPrintifyProducts();
    return live.length ? live : mockProducts;
  } catch (e) {
    console.error("[catalog] Printify fetch failed, using fallback:", e);
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getCatalog();
  return all.filter((p) => p.category === category);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const all = await getCatalog();
  const p = all.find((x) => x.slug === slug);
  if (!p) return all.slice(0, limit);
  return all
    .filter((x) => x.slug !== slug && x.category === p.category)
    .concat(all.filter((x) => x.slug !== slug && x.category !== p.category))
    .slice(0, limit);
}
