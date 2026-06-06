import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { toggleBundleActive } from "./bundle-actions";

export const dynamic = "force-dynamic";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );

export default async function AdminBundlesPage() {
  const bundles = await prisma.bundle.findMany({
    include: { _count: { select: { components: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bundles</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {bundles.length} bundle{bundles.length === 1 ? "" : "s"} · matching
            sets sold as one product, fulfilled as separate Printify items
          </p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
        >
          + New bundle
        </Link>
      </div>

      {bundles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-400">
          No bundles yet. Create a matching set (e.g. a Father &amp; Son set) to
          sell two products as one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Bundle</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bundles.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                        {b.image && (
                          <Image
                            src={b.image}
                            alt={b.name}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/bundles/${b.id}`}
                          className="line-clamp-1 font-medium text-neutral-100 hover:text-emerald-400"
                        >
                          {b.name}
                        </Link>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          /{b.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {money(b.price)}
                    {b.compareAtPrice != null && (
                      <span className="ml-2 text-xs text-neutral-500 line-through">
                        {money(b.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {b._count.components} products
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        b.active
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-neutral-500/15 text-neutral-400"
                      }`}
                    >
                      {b.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={toggleBundleActive}>
                        <input type="hidden" name="id" value={b.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={(!b.active).toString()}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-neutral-300 transition hover:bg-white/5"
                        >
                          {b.active ? "Hide" : "Show"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/bundles/${b.id}`}
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
