import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * True for Printify-served mockups (any remote image in this app). Printify
 * serves mockups from both `*.printify.com` and rotating `*.amazonaws.com`
 * buckets, so we treat every remote URL as a mockup. These are shown with
 * `object-contain` so the full garment/print is visible (never cropped); local
 * bundled photos use `object-cover`.
 */
export function isPrintifyImage(src: string) {
  return (
    /^https?:\/\//.test(src) ||
    src.startsWith("/api/img") ||
    src.startsWith("/images/mirror")
  );
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
