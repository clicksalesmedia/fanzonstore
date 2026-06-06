import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type BadgeKind = NonNullable<Product["badge"]>;

const variants: Record<BadgeKind, string> = {
  Bestseller: "bg-gold-400 text-ink-950 border-transparent",
  New: "bg-pitch-400 text-ink-950 border-transparent",
  Limited: "bg-ink-950/70 text-gold-300 border border-gold-400/60",
  "Host Nation": "bg-sky-500/15 text-sky-300 border border-sky-400/50",
};

export function Badge({
  badge,
  className,
}: {
  badge: BadgeKind;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-sport text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
        variants[badge],
        className
      )}
    >
      {badge}
    </span>
  );
}
