import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

const statusStyles: Record<string, string> = {
  PAYMENT_PENDING: "bg-yellow-500/15 text-yellow-300",
  PAYMENT_FAILED: "bg-red-500/15 text-red-300",
  PENDING: "bg-amber-500/15 text-amber-300",
  ON_HOLD: "bg-sky-500/15 text-sky-300",
  IN_PRODUCTION: "bg-violet-500/15 text-violet-300",
  FULFILLED: "bg-emerald-500/15 text-emerald-300",
  CANCELED: "bg-red-500/15 text-red-300",
};

export default async function AdminOrdersPage() {
  const [orders, totals] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
      take: 100,
    }),
    prisma.order.aggregate({
      where: { paidAt: { not: null } },
      _sum: { total: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {orders.length} order{orders.length === 1 ? "" : "s"} ·{" "}
            {money(totals._sum.total ?? 0)} paid revenue
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-400">
          No orders yet. They&apos;ll appear here once a checkout completes.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-emerald-400 hover:underline"
                    >
                      {o.externalId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-neutral-200">
                      {o.firstName} {o.lastName}
                    </div>
                    <div className="text-xs text-neutral-500">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {o._count.items}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {money(o.total, o.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[o.status] ?? "bg-white/10 text-neutral-300"
                      }`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {o.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
