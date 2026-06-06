import Link from "next/link";
import type { ReactNode } from "react";

export const SITE = {
  brand: "Fanzonstore",
  domain: "fanzonstore.com",
  url: "https://fanzonstore.com",
  legalEmail: "support@fanzonstore.com",
  privacyEmail: "privacy@fanzonstore.com",
} as const;

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
];

export function LegalLayout({
  title,
  updated,
  intro,
  current,
  children,
}: {
  title: string;
  /** human-readable last-updated date, e.g. "5 June 2026" */
  updated: string;
  intro?: ReactNode;
  /** href of the current page, to highlight it in the policy nav */
  current: string;
  children: ReactNode;
}) {
  return (
    <article className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="font-sport text-xs uppercase tracking-[0.2em] text-pitch-400">
          {SITE.brand} · Legal
        </p>
        <h1 className="mt-3 font-display text-4xl text-chalk sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-mist">Last updated: {updated}</p>

        {intro && (
          <p className="mt-6 max-w-prose leading-relaxed text-mist">{intro}</p>
        )}

        {/* Other policies */}
        <nav
          aria-label="Policies"
          className="mt-8 flex flex-wrap gap-2 border-y border-white/10 py-4"
        >
          {legalLinks.map((l) => {
            const active = l.href === current;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-full bg-pitch-400 px-3 py-1.5 font-sport text-[11px] uppercase tracking-wider text-ink-950"
                    : "rounded-full border border-white/15 px-3 py-1.5 font-sport text-[11px] uppercase tracking-wider text-mist transition-colors duration-200 hover:border-pitch-400/50 hover:text-pitch-300"
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="legal-prose mt-10">{children}</div>

        <p className="mt-14 border-t border-white/10 pt-6 text-sm text-mist">
          Questions about this policy? Email us at{" "}
          <a
            href={`mailto:${SITE.legalEmail}`}
            className="text-pitch-300 underline underline-offset-2 transition-colors hover:text-pitch-400"
          >
            {SITE.legalEmail}
          </a>
          .
        </p>
      </div>
    </article>
  );
}
