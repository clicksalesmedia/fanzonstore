import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Cache the optimized bytes at the framework/CDN layer for a year.
export const revalidate = 31536000;

/**
 * Image proxy + optimizer for remote Printify/S3 mockups.
 *
 * Why this exists: serving Printify's full-size S3 JPGs directly (the old
 * `images.unoptimized:true`) is slow. Next.js's built-in optimizer was disabled
 * because it blocks hosts that resolve to private IPs on some dev networks
 * (NAT64). This route does the fetch itself with Node's fetch (not the
 * optimizer's restricted resolver), resizes/recompresses to WebP via `sharp`
 * when available, and serves the result with a long immutable cache. The custom
 * image loader (`lib/image-loader.ts`) points every <Image> here.
 *
 * SSRF-safe: only https Printify / amazonaws hosts are allowed.
 */
const ALLOW = [/(^|\.)printify\.com$/i, /(^|\.)amazonaws\.com$/i];

export async function GET(req: Request) {
  const u = new URL(req.url);
  const target = u.searchParams.get("url");
  const w = Number(u.searchParams.get("w")) || undefined;
  const q = Math.min(100, Math.max(1, Number(u.searchParams.get("q")) || 75));

  if (!target) return new NextResponse("missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  if (parsed.protocol !== "https:" || !ALLOW.some((r) => r.test(parsed.hostname))) {
    return new NextResponse("host not allowed", { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed, {
      headers: { "User-Agent": "fanzonstore" },
      next: { revalidate: 31536000 },
    });
  } catch {
    return new NextResponse("upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok) {
    return new NextResponse(`upstream ${upstream.status}`, { status: 502 });
  }

  const original = Buffer.from(await upstream.arrayBuffer());
  let body: Buffer = original;
  let contentType = upstream.headers.get("content-type") ?? "image/jpeg";

  // Resize + WebP when sharp is installed; otherwise pass the original bytes
  // through (still benefits from the immutable cache below).
  try {
    const sharp = (await import("sharp")).default;
    let img = sharp(original);
    if (w) img = img.resize({ width: w, withoutEnlargement: true });
    body = await img.webp({ quality: q }).toBuffer();
    contentType = "image/webp";
  } catch {
    // sharp absent or failed — serve original
  }

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      // The S3 object at a given URL never changes; freshness is handled by the
      // product's image URL changing on re-sync, so this can be immutable.
      "Cache-Control":
        "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
