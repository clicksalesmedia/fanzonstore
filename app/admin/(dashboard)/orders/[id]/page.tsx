import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { updateOrderStatus } from "../../order-actions";

export const dynamic = "force-dynamic";

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to orders
        </Link>
        <h1 className="mt-2 font-mono text-2xl font-bold">
          {order.externalId}
        </h1>
        {order.printifyOrderId && (
          <p className="mt-1 text-sm text-neutral-500">
            Printify ID: {order.printifyOrderId}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3 text-neutral-200">{it.name}</td>
                    <td className="px-4 py-3 text-neutral-400">
                      {it.size} · {it.color}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{it.qty}</td>
                    <td className="px-4 py-3 text-neutral-200">
                      {money(it.price, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-white/10 p-4 text-sm">
            <div className="flex justify-between py-1 text-neutral-400">
              <span>Subtotal</span>
              <span>{money(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between py-1 text-neutral-400">
              <span>Shipping</span>
              <span>{money(order.shipping, order.currency)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
              <span>Total</span>
              <span>{money(order.total, order.currency)}</span>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Status
            </h2>
            <form action={updateOrderStatus} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
              >
                {Object.values(OrderStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
              >
                Update status
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Customer
            </h2>
            <div className="mt-3 space-y-1 text-neutral-300">
              <p>
                {order.firstName} {order.lastName}
              </p>
              <p className="text-neutral-400">{order.email}</p>
              {order.phone && <p className="text-neutral-400">{order.phone}</p>}
            </div>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Ship to
            </h3>
            <address className="mt-2 not-italic text-neutral-300">
              {order.address1}
              {order.address2 ? `, ${order.address2}` : ""}
              <br />
              {order.city}
              {order.region ? `, ${order.region}` : ""} {order.zip}
              <br />
              {order.country}
            </address>
          </div>
        </aside>
      </div>
    </div>
  );
}
