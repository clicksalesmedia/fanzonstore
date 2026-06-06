import Link from "next/link";
import type { AdminProductSummary } from "@/lib/printify";
import { SaveButton } from "../products/save-button";

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

export interface BundleFormComponent {
  productId: string;
  label: string;
  sortOrder: number;
  lockedVariantId: number | null;
  allowedColors: string | null;
}

export interface BundleFormData {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  compareAtPrice: number | null; // cents
  image: string;
  badge: string | null;
  category: string;
  active: boolean;
  components: BundleFormComponent[];
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

export function BundleForm({
  action,
  products,
  bundle,
  submitLabel = "Save bundle",
}: {
  action: (formData: FormData) => void | Promise<void>;
  products: AdminProductSummary[];
  bundle?: BundleFormData;
  submitLabel?: string;
}) {
  const rowCount = Math.max(4, (bundle?.components.length ?? 0) + 1);
  const rows = Array.from({ length: rowCount }, (_, i) => bundle?.components[i]);

  return (
    <form action={action} className="space-y-8">
      {bundle && <input type="hidden" name="id" value={bundle.id} />}

      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/bundles"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to bundles
        </Link>
        <SaveButton label={submitLabel} />
      </div>

      {/* Details */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Set details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm text-neutral-300">Name</span>
            <input
              name="name"
              defaultValue={bundle?.name}
              placeholder="Father & Son USA Matching Set"
              required
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm text-neutral-300">
              Description
            </span>
            <textarea
              name="description"
              defaultValue={bundle?.description}
              rows={3}
              placeholder="One shirt for the memory. One shirt for the moment."
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm text-neutral-300">
              Hero image URL
            </span>
            <input
              name="image"
              defaultValue={bundle?.image}
              placeholder="https://images-api.printify.com/…"
              required
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-neutral-500">
              Paste a product mockup URL (right-click a component image →
              &ldquo;Copy image address&rdquo;), or any hosted image.
            </span>
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-300">
              Set price (USD)
            </span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={bundle ? (bundle.price / 100).toFixed(2) : ""}
              placeholder="44.99"
              required
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-300">
              Compare-at &ldquo;was&rdquo; price (USD, optional)
            </span>
            <input
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                bundle?.compareAtPrice != null
                  ? (bundle.compareAtPrice / 100).toFixed(2)
                  : ""
              }
              placeholder="59.98"
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-neutral-300">Category</span>
            <select
              name="category"
              defaultValue={bundle?.category ?? "tees"}
              className={inputClass}
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
              defaultValue={bundle?.badge ?? ""}
              className={inputClass}
            >
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b || "None"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              name="active"
              defaultChecked={bundle ? bundle.active : true}
              className="size-4 accent-emerald-500"
            />
            <span className="text-sm text-neutral-300">
              Active (visible in the shop)
            </span>
          </label>
        </div>
      </section>

      {/* Components */}
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Components — pick 2+ products
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Each chosen product becomes a separate Printify item fulfilled in one
          order. Leave a row&rsquo;s product empty to skip it.
        </p>

        <div className="mt-4 space-y-4">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-[2fr_1fr_5rem]"
            >
              <label className="sm:col-span-3">
                <span className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                  Product {i + 1}
                </span>
                <select
                  name={`component_${i}_productId`}
                  defaultValue={row?.productId ?? ""}
                  className={inputClass}
                >
                  <option value="">— none —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                  Label
                </span>
                <input
                  name={`component_${i}_label`}
                  defaultValue={row?.label ?? ""}
                  placeholder="Dad"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                  Allowed colors (CSV, optional)
                </span>
                <input
                  name={`component_${i}_allowedColors`}
                  defaultValue={row?.allowedColors ?? ""}
                  placeholder="Black, White"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                  Order
                </span>
                <input
                  name={`component_${i}_sortOrder`}
                  type="number"
                  defaultValue={row?.sortOrder ?? i}
                  className={inputClass}
                />
              </label>
              <input
                type="hidden"
                name={`component_${i}_lockedVariantId`}
                defaultValue={row?.lockedVariantId ?? ""}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <SaveButton label={submitLabel} />
      </div>
    </form>
  );
}
