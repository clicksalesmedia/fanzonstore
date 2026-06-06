import { NextResponse } from "next/server";
import {
  createPrintifyOrder,
  getShippingCost,
  printifyConfigured,
  SHIPPING_METHOD,
  type ShippingAddress,
} from "@/lib/printify";
import { qualifiesForFreeShipping } from "@/lib/pricing";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

interface CheckoutItem {
  productId: string;
  variantId: string | number;
  qty: number;
  name?: string;
  image?: string;
  price?: number; // dollars
  size?: string;
  color?: string;
}

const toCents = (dollars: number) => Math.round((Number(dollars) || 0) * 100);

/**
 * Live order submission to Printify.
 *
 * Creates a real order in the Printify shop from the cart + shipping address.
 * It is NOT sent to production (i.e. not charged/printed) unless the server has
 * PRINTIFY_AUTO_PRODUCTION=true — wire this to fire only AFTER a successful
 * payment (e.g. Stripe webhook) before enabling auto-production.
 */
export async function POST(req: Request) {
  if (!printifyConfigured) {
    return NextResponse.json(
      { error: "Printify is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { items?: CheckoutItem[]; address?: ShippingAddress };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, address } = body;
  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const required: (keyof ShippingAddress)[] = [
    "first_name",
    "last_name",
    "email",
    "country",
    "address1",
    "city",
    "zip",
  ];
  const missing = required.filter((k) => !address?.[k]);
  if (!address || missing.length) {
    return NextResponse.json(
      { error: `Missing address fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const lineItems = items.map((i) => ({
    product_id: String(i.productId),
    variant_id: Number(i.variantId),
    quantity: Math.max(1, Number(i.qty) || 1),
  }));

  if (lineItems.some((l) => !l.product_id || !Number.isFinite(l.variant_id))) {
    return NextResponse.json(
      { error: "One or more cart items are not Printify products." },
      { status: 422 },
    );
  }

  const externalId = `fanzonstore-${Date.now()}`;
  const subtotalCents = items.reduce(
    (sum, i) => sum + toCents(i.price ?? 0) * Math.max(1, Number(i.qty) || 1),
    0,
  );

  // Authoritative shipping: recompute from Printify server-side (never trust a
  // client-sent shipping number). getShippingCost returns CENTS already.
  // On failure, fall back to 0 so an order is never blocked — flag for review.
  let shippingCents = 0;
  let shippingMethod: number = SHIPPING_METHOD.standard;
  try {
    if (!qualifiesForFreeShipping(subtotalCents)) {
      const rates = await getShippingCost({ lineItems, address });
      if (typeof rates.standard === "number") {
        shippingCents = rates.standard;
        shippingMethod = SHIPPING_METHOD.standard;
      }
    }
  } catch (e) {
    console.error(
      "[checkout] shipping quote failed, defaulting to 0:",
      e instanceof Error ? e.message : e,
    );
  }
  const totalCents = subtotalCents + shippingCents;

  // Persist a PENDING order before talking to Printify so we always have a
  // record (even if fulfillment fails). The order is updated after Printify
  // responds.
  const order = await prisma.order.create({
    data: {
      externalId,
      status: "PENDING",
      email: String(address.email),
      firstName: String(address.first_name),
      lastName: String(address.last_name),
      phone: address.phone ? String(address.phone) : null,
      country: String(address.country),
      region: address.region ? String(address.region) : null,
      address1: String(address.address1),
      address2: address.address2 ? String(address.address2) : null,
      city: String(address.city),
      zip: String(address.zip),
      subtotal: subtotalCents,
      shipping: shippingCents,
      total: totalCents,
      items: {
        create: items.map((i) => ({
          productId: String(i.productId),
          variantId: String(i.variantId),
          name: i.name ?? "Item",
          image: i.image ?? "",
          size: i.size ?? "",
          color: i.color ?? "",
          qty: Math.max(1, Number(i.qty) || 1),
          price: toCents(i.price ?? 0),
        })),
      },
    },
  });

  try {
    const result = await createPrintifyOrder({
      externalId,
      address,
      lineItems,
      shippingMethod,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: {
        printifyOrderId: result.id ? String(result.id) : null,
        status: result.sentToProduction ? "IN_PRODUCTION" : "ON_HOLD",
      },
    });
    return NextResponse.json({
      ok: true,
      orderId: result.id,
      sentToProduction: result.sentToProduction,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Order failed";
    console.error("[checkout] Printify order error:", message);
    // Keep the PENDING order on record for manual follow-up.
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
