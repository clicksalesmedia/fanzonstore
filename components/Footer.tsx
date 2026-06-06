import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  AtSign,
  Video,
  MessageCircle,
  Flame,
  Heart,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { categoryLabels } from "@/lib/products";
import Marquee from "@/components/Marquee";
import NewsletterForm from "@/components/NewsletterForm";

const helpLinks = [
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Track Order", href: "/track" },
  { label: "FAQ", href: "/faq" },
];

const companyLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Collections", href: "/collections" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com", Icon: Camera },
  { label: "X (Twitter)", href: "https://twitter.com", Icon: AtSign },
  { label: "YouTube", href: "https://youtube.com", Icon: Video },
  { label: "Community", href: "https://discord.com", Icon: MessageCircle },
];

const linkClass =
  "inline-block text-sm text-mist transition-colors duration-200 hover:text-pitch-400 focus-visible:outline-none focus-visible:text-pitch-400";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-ink-800 bg-ink-950">
      <Marquee />

      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand + newsletter */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex rounded transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400/60"
              aria-label="Fanzonstore home"
            >
              <Image
                src="/images/brand/websitelogo.png"
                alt="Fanzonstore"
                width={300}
                height={166}
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">
              Fanzonstore is for the fans who feel every kick. Wear your colors,
              carry the moment, and belong to the summer the whole world will
              remember.
            </p>

            <div className="mt-6">
              <p className="font-sport text-xs text-pitch-400">
                Join the squad
              </p>
              <p className="mt-1 mb-3 text-sm text-mist">
                Early drops, restocks &amp; matchday discounts.
              </p>
              <NewsletterForm />
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="glass flex size-10 items-center justify-center rounded-xl text-mist transition-colors duration-200 hover:text-pitch-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400/60"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Shop" className="lg:col-span-1">
            <h2 className="font-sport text-xs text-chalk">Shop</h2>
            <ul className="mt-4 space-y-3">
              {Object.entries(categoryLabels).map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/shop/${slug}`} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help */}
          <nav aria-label="Help" className="lg:col-span-1">
            <h2 className="font-sport text-xs text-chalk">Help</h2>
            <ul className="mt-4 space-y-3">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company" className="lg:col-span-1">
            <h2 className="font-sport text-xs text-chalk">Company</h2>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Trust line */}
        <div className="mt-14 flex flex-col gap-4 border-t border-ink-800 pt-8 text-sm text-mist sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
          <span className="flex items-center gap-2">
            <Flame className="size-4 text-pitch-400" aria-hidden="true" />
            Made for the believers
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-pitch-400" aria-hidden="true" />
            Secure checkout
          </span>
          <span className="flex items-center gap-2">
            <Heart className="size-4 text-pitch-400" aria-hidden="true" />
            Yours to keep forever
          </span>
          <span className="flex items-center gap-2 sm:ml-auto">
            <CreditCard className="size-4 text-gold-400" aria-hidden="true" />
            <span className="font-sport text-xs text-mist">
              Visa · Mastercard · Amex · Apple Pay · PayPal
            </span>
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-800 bg-ink-900/60">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Fanzonstore. All rights reserved.</p>
          <p className="text-mist/80">
            Independent fan store. Not affiliated with, endorsed by, or
            sponsored by FIFA.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className={linkClass}>
              Privacy
            </Link>
            <Link href="/terms" className={linkClass}>
              Terms
            </Link>
            <Link href="/cookies" className={linkClass}>
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
