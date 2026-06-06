/**
 * Custom Next.js image loader.
 *
 * Local bundled assets (`/images/...`) are already sized — pass them through
 * untouched. Remote Printify/S3 mockups are routed through our cached,
 * resizing `/api/img` proxy so the browser gets a right-sized WebP instead of a
 * full-size S3 JPG.
 *
 * Must be a pure, default-exported function (Next serializes it for the client).
 */
export default function printifyImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!/^https?:\/\//.test(src)) return src; // local/static asset
  return `/api/img?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
