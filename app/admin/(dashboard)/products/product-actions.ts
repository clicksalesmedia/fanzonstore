"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import {
  fetchPrintifyProductForAdmin,
  updatePrintifyProduct,
  buildControlTags,
  type ProductPatch,
} from "@/lib/printify";

const toCents = (dollars: number) => Math.round((Number(dollars) || 0) * 100);

function bust(id?: string) {
  // Server-action context: refresh the Printify-tagged reads + affected pages.
  revalidateTag("printify", "max");
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/product/[slug]", "page");
}

/**
 * Bulk product editor save: metadata (title/description/category/badge) +
 * per-variant price (dollars→cents) and enabled toggle. Sends only changed
 * fields/variants to Printify and never enables a provider-unavailable variant.
 */
export async function updateProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");

  const current = await fetchPrintifyProductForAdmin(id);
  if (!current) throw new Error("Product not found");

  const patch: ProductPatch = {};

  const title = String(formData.get("title") ?? "").trim();
  if (title && title !== current.title) patch.title = title;

  const description = String(formData.get("description") ?? "").trim();
  if (description !== current.description) patch.description = description;

  const category = String(formData.get("category") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const curBadge = current.badge ?? "";
  if (category !== current.category || badge !== curBadge) {
    patch.tags = buildControlTags(current.tags, {
      category: category || undefined,
      badge: badge || undefined,
    });
  }

  // Per-variant diff. Only changed variants are sent (sparse PUT).
  const ids = String(formData.get("variantIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);

  const byId = new Map(current.variants.map((v) => [v.id, v]));
  const changed: NonNullable<ProductPatch["variants"]> = [];
  for (const vid of ids) {
    const cur = byId.get(vid);
    if (!cur) continue;
    const priceRaw = formData.get(`price_${vid}`);
    const newPrice =
      priceRaw != null && String(priceRaw) !== ""
        ? toCents(Number(priceRaw))
        : cur.price;
    // Checkbox only present in FormData when checked.
    const wantEnabled = formData.get(`enabled_${vid}`) != null;
    // Never enable a variant the print provider can't make.
    const enabled = wantEnabled && cur.isAvailable;

    const delta: { id: number; price?: number; is_enabled?: boolean } = {
      id: vid,
    };
    let dirty = false;
    if (Number.isInteger(newPrice) && newPrice > 0 && newPrice !== cur.price) {
      delta.price = newPrice;
      dirty = true;
    }
    if (enabled !== cur.isEnabled) {
      delta.is_enabled = enabled;
      dirty = true;
    }
    if (dirty) changed.push(delta);
  }
  if (changed.length) patch.variants = changed;

  await updatePrintifyProduct(id, patch);
  bust(id);
}

/** Quick show/hide toggle from the product list. */
export async function toggleVisible(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");
  const visible = String(formData.get("visible") ?? "") === "true";
  await updatePrintifyProduct(id, { visible });
  bust(id);
}
