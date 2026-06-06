import Link from "next/link";
import { ShoppingBag, Package, Clock, DollarSign } from "lucide-react";
import { prisma } from "@/lib/db";
import { fetchAdminProducts, printifyConfigured } from "@/lib/printify";

export const dynamic = "force-dynamic";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );

export default async function AdminDashboardPage() {
  const [agg, pending, recent, products] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _count: true }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { items: true } } },
    }),
    printifyConfigured ? fetchAdminProducts().catch(() => []) : [],
  ]);

  const stats = [
    {
      label: "Revenue",
      value: money(agg._sum.total ?? 0),
      icon: DollarSign,
      accent: "text-emerald-400",
    },
    {
      label: "Orders",
      value: String(agg._count),
      icon: ShoppingBag,
      accent: "text-sky-400",
      href: "/admin/orders",
    },
    {
      label: "Pending",
      value: String(pending),
      icon: Clock,
      accent: "text-amber-400",
      href: "/admin/orders",
    },
    {
      label: "Products",
      value: String(products.length),
      icon: Package,
      accent: "text-violet-400",
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Store overview · synced with Printify
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Card = (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {s.label}
                </span>
                <s.icon className={`size-4 ${s.accent}`} aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{s.value}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {Card}
            </Link>
          ) : (
            <div key={s.label}>{Card}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-emerald-400 hover:underline"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-500">
              No orders yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/5">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs text-emerald-400 hover:underline"
                      >
                        {o.externalId}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-neutral-300">
                      {o.firstName} {o.lastName}
                    </td>
                    <td className="px-3 py-3 text-neutral-400">
                      {o._count.items} item{o._count.items === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-200">
                      {money(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 p-5">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 space-y-2">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-neutral-200 transition hover:bg-white/5"
            >
              <ShoppingBag className="size-4 text-sky-400" aria-hidden />
              Manage orders
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-neutral-200 transition hover:bg-white/5"
            >
              <Package className="size-4 text-violet-400" aria-hidden />
              Manage products &amp; prices
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-neutral-200 transition hover:bg-white/5"
            >
              <span className="text-base leading-none">↗</span>
              View storefront
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
