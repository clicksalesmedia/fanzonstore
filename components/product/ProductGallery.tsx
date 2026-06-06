"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface ProductGalleryProps {
  /** full gallery with per-variant associations (from Printify) */
  images?: ProductImage[];
  /** primary image, used as a fallback when there are no gallery images */
  fallbackImage: string;
  name: string;
  /** the currently-selected variant id — filters the gallery to matching mockups */
  activeVariantId?: number;
  badge?: Product["badge"];
}

function dedupe(images: ProductImage[]): ProductImage[] {
  const seen = new Set<string>();
  return images.filter((im) => {
    if (seen.has(im.src)) return false;
    seen.add(im.src);
    return true;
  });
}

export function ProductGallery({
  images,
  fallbackImage,
  name,
  activeVariantId,
  badge,
}: ProductGalleryProps) {
  // Images for the selected variant; fall back to the whole gallery when the
  // mockups carry no variant association (common for API/disconnected shops),
  // and finally to the single primary image.
  const display = useMemo<ProductImage[]>(() => {
    const all = dedupe(images ?? []);
    if (activeVariantId != null) {
      const matched = all.filter((im) => im.variantIds.includes(activeVariantId));
      if (matched.length) return matched;
    }
    if (all.length) return all;
    return [{ src: fallbackImage, variantIds: [] }];
  }, [images, activeVariantId, fallbackImage]);

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Reset to the first mockup whenever the displayed set changes (e.g. the
  // shopper picks a different color). Adjusting state during render is the
  // React-recommended alternative to a reset effect.
  const firstSrc = display[0]?.src;
  const prevFirst = useRef(firstSrc);
  if (prevFirst.current !== firstSrc) {
    prevFirst.current = firstSrc;
    setIndex(0);
  }

  const clampedIndex = Math.min(index, display.length - 1);
  const active = display[clampedIndex] ?? display[0];
  const hasMultiple = display.length > 1;

  function go(next: number) {
    setLoaded(false);
    setIndex(((next % display.length) + display.length) % display.length);
  }

  // Keep the active thumbnail in view as the slide changes.
  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const el = strip.children[clampedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [clampedIndex]);

  // Touch / swipe support.
  const touchX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) go(clampedIndex + (dx < 0 ? 1 : -1));
    touchX.current = null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="group relative aspect-square overflow-hidden rounded-3xl glass"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
      >
        <Image
          key={active.src}
          src={active.src}
          alt={`${name}${active.position ? ` — ${active.position}` : ""}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover object-center transition-all duration-500 ease-out group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />

        {badge && (
          <div className="absolute left-4 top-4 z-10">
            <Badge badge={badge} />
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent"
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(clampedIndex - 1)}
              className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-ink-950/50 text-chalk backdrop-blur-sm transition-all duration-200 hover:bg-ink-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(clampedIndex + 1)}
              className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-ink-950/50 text-chalk backdrop-blur-sm transition-all duration-200 hover:bg-ink-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <span className="absolute bottom-4 right-4 z-10 rounded-full bg-ink-950/60 px-2.5 py-1 font-sport text-[11px] font-semibold tracking-wide text-chalk backdrop-blur-sm">
              {clampedIndex + 1} / {display.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div
          ref={thumbsRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {display.map((im, i) => {
            const selected = i === clampedIndex;
            return (
              <button
                key={im.src}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`View image ${i + 1}`}
                onClick={() => go(i)}
                className={cn(
                  "relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:w-24",
                  selected
                    ? "ring-2 ring-pitch-400"
                    : "ring-1 ring-white/15 opacity-70 hover:opacity-100 hover:ring-white/40",
                )}
              >
                <Image
                  src={im.src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
