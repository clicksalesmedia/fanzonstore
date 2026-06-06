export type ProductCategory =
  | "jerseys"
  | "tees"
  | "hoodies"
  | "headwear"
  | "accessories"
  | "drinkware"
  | "prints";

export interface ProductVariant {
  id: string;
  /** e.g. "S", "M", "L" or "One Size" */
  size: string;
  /** human label e.g. "Emerald" */
  color: string;
  /** hex swatch */
  hex: string;
  /** Printful-style variant id (mock) */
  printfulVariantId: number;
}

export interface ProductImage {
  /** mockup URL */
  src: string;
  /**
   * Printify/Printful variant ids this mockup belongs to. Empty = applies to
   * all variants. Used to swap the gallery when color/size changes.
   */
  variantIds: number[];
  /** "front", "back", "context", etc. */
  position?: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  /** USD price */
  price: number;
  compareAtPrice?: number;
  /** primary mockup image under /public/images/products */
  image: string;
  /** optional secondary mockup */
  hoverImage?: string;
  description: string;
  /** marketing bullet points */
  highlights: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  badge?: "Bestseller" | "New" | "Limited" | "Host Nation";
  rating: number;
  reviews: number;
  printfulProductId: number;
  /** Printify product id (string hex) when sourced from Printify */
  printifyProductId?: string;
  /** extra mockup images from Printify (flat src list) */
  gallery?: string[];
  /** full gallery with per-variant associations (for color/size image swap) */
  images?: ProductImage[];
}

export interface Collection {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  accent: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string; // emoji
  group: string;
  host?: boolean;
  /** tailwind-friendly accent hex for the country's mini-store */
  accent: string;
}

/** One chosen component shirt inside a bundle cart line. */
export interface BundleComponentSelection {
  /** Printify product id of the component shirt */
  productId: string;
  /** Printify numeric variant id */
  variantId: number;
  /** "Dad" / "Kid" */
  label: string;
  size: string;
  color: string;
  /** component product name (for display) */
  name: string;
  /** component image (for display) */
  image: string;
}

/** Present only on a bundle cart line; carries the chosen component variants. */
export interface CartLineBundle {
  /** Bundle.id in the DB */
  bundleId: string;
  components: BundleComponentSelection[];
}

export interface CartLine {
  /** for bundles this is "bundle:<bundleId>" */
  productId: string;
  /** merge/remove key; for bundles a deterministic composite (see store/cart) */
  variantId: string;
  name: string;
  image: string;
  /** USD (dollars). For bundles, the FIXED set price — client display only. */
  price: number;
  size: string;
  color: string;
  qty: number;
  /** present ONLY for bundle lines */
  bundle?: CartLineBundle;
}
