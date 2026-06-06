"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const toCents = (dollars: unknown) =>
  Math.round((Number(dollars) || 0) * 100);

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** A bundle slug unique across the table (ignoring the bundle being edited). */
async function uniqueSlug(name: string, exceptId?: string) {
  const base = slugify(name) || "bundle";
  let slug = base;
  let n = 2;
  // Loop until we find an unused slug.
  // (Bundles are few; this is cheap.)
  while (true) {
    const existing = await prisma.bundle.findUnique({ where: { slug } });
    if (!existing || existing.id === exceptId) return slug;
    slug = `${base}-${n++}`;
  }
}

interface ComponentInput {
  productId: string;
  label: string;
  sortOrder: number;
  lockedVariantId: number | null;
  allowedColors: string | null;
}

/** Parse up to 8 indexed component rows; skip rows with no product chosen. */
function parseComponents(formData: FormData): ComponentInput[] {
  const out: ComponentInput[] = [];
  for (let i = 0; i < 8; i++) {
    const productId = String(formData.get(`component_${i}_productId`) ?? "").trim();
    if (!productId) continue;
    const label =
      String(formData.get(`component_${i}_label`) ?? "").trim() ||
      `Item ${out.length + 1}`;
    const sortOrder =
      Number(formData.get(`component_${i}_sortOrder`)) || out.length;
    const lockedRaw = String(
      formData.get(`component_${i}_lockedVariantId`) ?? "",
    ).trim();
    const lockedVariantId = lockedRaw ? Number(lockedRaw) || null : null;
    const allowedRaw = String(
      formData.get(`component_${i}_allowedColors`) ?? "",
    ).trim();
    out.push({
      productId,
      label,
      sortOrder,
      lockedVariantId,
      allowedColors: allowedRaw || null,
    });
  }
  return out;
}

function readBundleFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "tees").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  if (!image) throw new Error("A hero image URL is required");
  const price = toCents(formData.get("price"));
  if (price <= 0) throw new Error("Set price must be greater than 0");
  const compareRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPrice = compareRaw ? toCents(compareRaw) : null;
  const active = String(formData.get("active") ?? "") === "on";
  return { name, description, category, badge, image, price, compareAtPrice, active };
}

function bust(slug?: string) {
  revalidatePath("/admin/bundles");
  revalidatePath("/shop");
  revalidatePath("/");
  if (slug) revalidatePath(`/bundle/${slug}`);
}

export async function createBundle(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const fields = readBundleFields(formData);
  const components = parseComponents(formData);
  if (components.length < 2) {
    throw new Error("A bundle needs at least 2 products.");
  }

  const slug = await uniqueSlug(fields.name);
  await prisma.bundle.create({
    data: {
      slug,
      name: fields.name,
      description: fields.description,
      category: fields.category,
      badge: fields.badge || null,
      image: fields.image,
      price: fields.price,
      compareAtPrice: fields.compareAtPrice,
      active: fields.active,
      components: { create: components },
    },
  });

  bust(slug);
  redirect("/admin/bundles");
}

export async function updateBundle(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing bundle id");

  const fields = readBundleFields(formData);
  const components = parseComponents(formData);
  if (components.length < 2) {
    throw new Error("A bundle needs at least 2 products.");
  }

  const slug = await uniqueSlug(fields.name, id);
  await prisma.bundle.update({
    where: { id },
    data: {
      slug,
      name: fields.name,
      description: fields.description,
      category: fields.category,
      badge: fields.badge || null,
      image: fields.image,
      price: fields.price,
      compareAtPrice: fields.compareAtPrice,
      active: fields.active,
      // Replace the component set wholesale (simplest correct edit).
      components: { deleteMany: {}, create: components },
    },
  });

  bust(slug);
  redirect("/admin/bundles");
}

export async function toggleBundleActive(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing bundle id");
  const active = String(formData.get("active") ?? "") === "true";
  const updated = await prisma.bundle.update({
    where: { id },
    data: { active },
  });
  bust(updated.slug);
}

export async function deleteBundle(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing bundle id");
  const deleted = await prisma.bundle.delete({ where: { id } });
  bust(deleted.slug);
  redirect("/admin/bundles");
}
