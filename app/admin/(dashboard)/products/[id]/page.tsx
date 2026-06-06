import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  fetchPrintifyProductForAdmin,
  type AdminVariant,
} from "@/lib/printify";
import { updateProduct } from "../product-actions";
import { SaveButton } from "../save-button";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "tees",
  "hoodies",
  "headwear",
  "accessories",
  "drinkware",
  "prints",
  "jerseys",
];
const BADGES = ["", "Bestseller", "New", "Limited", "Host Nation"];

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchPrintifyProductForAdmin(id);
  if (!product) notFound();

  // Group variants by color for the table.
  const groups = new Map<string, AdminVariant[]>();
  for (const v of product.variants) {
    const arr = groups.get(v.color) ?? [];
    arr.push(v);
    groups.set(v.color, arr);
  }
  const variantIds = product.variants.map((v) => v.id).join(",");

  return (
    <form action={updateProduct} className="space-y-8">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="variantIds" value={variantIds} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div>
            <Link
              href="/admin/products"
              className="text-sm text-neutral-400 hover:text-white"
            >
              ← Back to products
            </Link>
            <h1 className="mt-1 text-2xl font-bold">{product.title}</h1>
            {product.isLocked && (
              <p className="mt-1 text-xs text-amber-300">
                This product is locked by Printify (art/mockups generating).
                Price, availability and text edits still save; artwork edits are
                blocked until it unlocks.
              </p>
            )}
          </div>
        </div>
        <SaveButton />
      </div>

      {/* Metadata */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm text-neutral-300">Title</span>
            <input
              name="title"
              defaultValue={product.title}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm text-neutral-300">
              Description
            </span>
            <textarea
              name="description"
              defaultValue={product.description}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-300">Category</span>
            <select
              name="category"
              defaultValue={product.category}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-300">Badge</span>
            <select
              name="badge"
              defaultValue={product.badge ?? ""}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            >
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b || "None"}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Variants — price &amp; availability
          </h2>
          <span className="text-xs text-neutral-500">
            {product.variants.filter((v) => v.isEnabled).length} of{" "}
            {product.variants.length} enabled
          </span>
        </div>

        <div className="mt-4 space-y-6">
          {[...groups.entries()].map(([color, variants]) => (
            <div key={color}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block size-4 rounded-full border border-white/20"
                  style={{ backgroundColor: variants[0].hex }}
                />
                <span className="text-sm font-medium text-neutral-200">
                  {color}
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Size</th>
                      <th className="px-3 py-2 font-medium">Cost</th>
                      <th className="px-3 py-2 font-medium">Price (USD)</th>
                      <th className="px-3 py-2 font-medium">Enabled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {variants.map((v) => (
                      <tr
                        key={v.id}
                        className={v.isAvailable ? "" : "opacity-50"}
                      >
                        <td className="px-3 py-2 text-neutral-200">{v.size}</td>
                        <td className="px-3 py-2 text-neutral-500">
                          {v.cost ? `$${(v.cost / 100).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-neutral-500">$</span>
                            <input
                              type="number"
                              name={`price_${v.id}`}
                              defaultValue={(v.price / 100).toFixed(2)}
                              step="0.01"
                              min="0"
                              className="w-24 rounded-md border border-white/10 bg-neutral-900 px-2 py-1 text-sm text-white outline-none focus:border-emerald-400"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {v.isAvailable ? (
                            <input
                              type="checkbox"
                              name={`enabled_${v.id}`}
                              defaultChecked={v.isEnabled}
                              className="size-4 accent-emerald-500"
                            />
                          ) : (
                            <span className="text-xs text-neutral-500">
                              unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}
