import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * On-demand store sync. Refreshes the Printify-backed catalog immediately
 * instead of waiting for the 60s cache window.
 *
 * Use it manually:
 *   curl -X POST "http://localhost:3217/api/revalidate?secret=YOUR_SECRET"
 *
 * Or point a Printify webhook (product:published / product:updated /
 * product:deleted) at this URL. Set REVALIDATE_SECRET in .env.local to require
 * the secret; if it's unset, the endpoint is open (fine for local dev).
 */
function handle(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const provided =
      url.searchParams.get("secret") ?? req.headers.get("x-revalidate-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  revalidateTag("printify", "max");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product/[slug]", "page");

  return NextResponse.json({ revalidated: true, at: Date.now() });
}

export async function POST(req: Request) {
  return handle(req);
}

// allow GET too, so you can trigger a refresh straight from the browser
export async function GET(req: Request) {
  return handle(req);
}
