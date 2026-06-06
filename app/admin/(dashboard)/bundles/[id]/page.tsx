import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAdminProducts } from "@/lib/printify";
import { prisma } from "@/lib/db";
import { updateBundle, deleteBundle } from "../bundle-actions";
import { BundleForm, type BundleFormData } from "../bundle-form";

export const dynamic = "force-dynamic";

export default async function EditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bundle, products] = await Promise.all([
    prisma.bundle.findUnique({
      where: { id },
      include: { components: { orderBy: { sortOrder: "asc" } } },
    }),
    fetchAdminProducts(),
  ]);
  if (!bundle) notFound();

  const data: BundleFormData = {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    price: bundle.price,
    compareAtPrice: bundle.compareAtPrice,
    image: bundle.image,
    badge: bundle.badge,
    category: bundle.category,
    active: bundle.active,
    components: bundle.components.map((c) => ({
      productId: c.productId,
      label: c.label,
      sortOrder: c.sortOrder,
      lockedVariantId: c.lockedVariantId,
      allowedColors: c.allowedColors,
    })),
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Edit bundle</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/bundle/${bundle.slug}`}
            target="_blank"
            className="text-sm text-neutral-400 hover:text-white"
          >
            View on store ↗
          </Link>
          <form action={deleteBundle}>
            <input type="hidden" name="id" value={bundle.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
      <BundleForm
        action={updateBundle}
        products={products}
        bundle={data}
        submitLabel="Save bundle"
      />
    </div>
  );
}
