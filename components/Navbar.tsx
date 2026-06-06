"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart, selectCount } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useMounted } from "@/components/useMounted";

const links = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/shop" },
  { label: "Our Story", href: "/our-story" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useMounted();

  const openCart = useCart((s) => s.open);
  const count = useCart(selectCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-white/10 shadow-lg shadow-ink-950/40"
          : "bg-ink-950/20 border-b border-transparent backdrop-blur-sm",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Wordmark */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="group flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          aria-label="Fanzonstore home"
        >
          <Image
            src="/images/brand/websitelogo.png"
            alt="Fanzonstore"
            width={300}
            height={166}
            priority
            className="h-11 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90 md:h-14"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sport rounded-full px-4 py-2 text-xs uppercase tracking-wider text-mist transition-colors duration-200 hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/5 hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:flex"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart${mounted && count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:bg-white/5 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && count > 0 && (
              <span className="font-sport absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pitch-400 px-1 text-[10px] font-bold leading-none text-ink-950 glow-pitch">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-chalk transition-colors duration-200 hover:bg-white/5 hover:text-pitch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 origin-top transition-all duration-300 md:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="min-h-[calc(100svh-4rem)] border-t border-white/10 bg-ink-950 backdrop-blur-xl">
          <div className="container-page flex flex-col gap-1 py-8">
            {links.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${i * 50 + 80}ms` : "0ms" }}
                className={cn(
                  "font-display flex items-center justify-between border-b border-white/5 py-4 text-3xl uppercase tracking-wide text-chalk transition-all duration-300 hover:text-pitch-300 focus-visible:outline-none focus-visible:text-pitch-300",
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                {link.label}
                <span className="font-sport text-xs text-mist">0{i + 1}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
