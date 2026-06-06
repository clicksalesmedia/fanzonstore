import { NextResponse } from "next/server";
import {
  getShippingCost,
  printifyConfigured,
  type ShippingAddress,
  type OrderLineItem,
} from "@/lib/printify";

export const runtime = "nodejs";

interface QuoteItem {
  productId: string;
  variantId: string | number;
  qty: number;
}

/**
 * Live shipping quote for the checkout page (a client component that can't
 * import the server-only Printify client). Returns rates in CENTS.
 * Best-effort: returns { rates: {} } when Printify can't quote yet so the UI can
 * show "calculated at checkout" without erroring.
 */
export async function POST(req: Request) {
  if (!printifyConfigured) {
    return NextResponse.json({ rates: {} });
  }

  let body: { items?: QuoteItem[]; address?: Partial<ShippingAddress> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, address } = body;
  if (!items?.length || !address?.country || !address?.zip) {
    return NextResponse.json({ rates: {} });
  }

  const lineItems: OrderLineItem[] = items.map((i) => ({
    product_id: String(i.productId),
    variant_id: Number(i.variantId),
    quantity: Math.max(1, Number(i.qty) || 1),
  }));
  if (lineItems.some((l) => !l.product_id || !Number.isFinite(l.variant_id))) {
    return NextResponse.json({ rates: {} });
  }

  try {
    const rates = await getShippingCost({
      lineItems,
      address: {
        first_name: address.first_name || "Customer",
        last_name: address.last_name || "Customer",
        email: address.email || "customer@example.com",
        country: String(address.country).toUpperCase(),
        region: address.region,
        address1: address.address1 || "1 Main St",
        address2: address.address2,
        city: address.city || "City",
        zip: String(address.zip),
      },
    });
    return NextResponse.json({ rates });
  } catch (e) {
    console.error("[shipping] quote failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ rates: {} });
  }
}
