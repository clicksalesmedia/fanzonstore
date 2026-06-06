import Link from "next/link";
import Image from "next/image";
import { fetchAdminProducts, printifyConfigured } from "@/lib/printify";
import { toggleVisible } from "./product-actions";

export const dynamic = "force-dynamic";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );

function priceRange(min: number, max: number) {
  if (!min && !max) return "—";
  return min === max ? money(min) : `${money(min)} – ${money(max)}`;
}

export default async function AdminProductsPage() {
  if (!printifyConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-400">
        Printify isn&apos;t configured on the server, so there are no products to
        manage. Set PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID in{" "}
        <code className="text-neutral-300">.env.local</code>.
      </div>
    );
  }

  const products = await fetchAdminProducts();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {products.length} product{products.length === 1 ? "" : "s"} · synced
            with Printify
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-400">
          No products found in the Printify shop.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">Visible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="line-clamp-1 font-medium text-neutral-100 hover:text-emerald-400"
                        >
                          {p.title}
                        </Link>
                        {p.isLocked && (
                          <span className="mt-0.5 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-300">
                            locked
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-300">
                    {p.category}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {priceRange(p.minPrice, p.maxPrice)}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    <span className="text-emerald-400">{p.enabledCount}</span>
                    <span className="text-neutral-500">
                      {" "}
                      / {p.variantCount} on
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.visible
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-neutral-500/15 text-neutral-400"
                      }`}
                    >
                      {p.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={toggleVisible}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="visible"
                          value={(!p.visible).toString()}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-neutral-300 transition hover:bg-white/5"
                        >
                          {p.visible ? "Hide" : "Show"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-neutral-950 transition hover:bg-emerald-400"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
