"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Layers, LogOut } from "lucide-react";
import { logoutAction } from "../auth-actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/bundles", label: "Bundles", icon: Layers },
];

export function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="block px-5 py-5">
        <span className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
          FANZONSTORE
        </span>
        <span className="mt-0.5 block text-xs text-neutral-500">
          Admin panel
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-emerald-500/15 font-medium text-emerald-300"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <l.icon className="size-4" aria-hidden />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {email && (
          <p className="px-3 pb-2 text-xs text-neutral-500">{email}</p>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
