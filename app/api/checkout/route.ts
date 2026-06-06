import { NextResponse } from "next/server";
import {
  fetchPrintifyProductForAdmin,
  getShippingCost,
  printifyConfigured,
  SHIPPING_METHOD,
  type ShippingAddress,
  type OrderLineItem,
} from "@/lib/printify";
import { qualifiesForFreeShipping } from "@/lib/pricing";
import { prisma } from "@/lib/db";
import { stripe, stripeConfigured } from "@/lib/stripe";

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

interface ValidatedItem {
  productId: string;
  variantId: number;
  qty: number;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
}

function siteOrigin(req: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.headers.get("origin") ||
    new URL(req.url).origin
  );
}

async function validateItems(items: CheckoutItem[]): Promise<ValidatedItem[]> {
  const validated = await Promise.all(
    items.map(async (item) => {
      const productId = String(item.productId);
      const variantId = Number(item.variantId);
      const qty = Math.max(1, Number(item.qty) || 1);

      if (!productId || !Number.isFinite(variantId)) {
        throw new Error("One or more cart items are not Printify products.");
      }

      const product = await fetchPrintifyProductForAdmin(productId);
      const variant = product?.variants.find((v) => v.id === variantId);
      if (!product || !variant || !variant.isEnabled || !variant.isAvailable) {
        throw new Error("One or more cart items are no longer available.");
      }

      return {
        productId,
        variantId,
        qty,
        name: product.title,
        image: product.image,
        price: variant.price,
        size: variant.size,
        color: variant.color,
      };
    }),
  );

  return validated;
}

/**
 * Stripe Checkout session creation.
 *
 * This creates our local order as PAYMENT_PENDING and sends the shopper to
 * Stripe. Printify fulfillment happens only from the Stripe webhook after
 * payment succeeds.
 */
export async function POST(req: Request) {
  if (!stripeConfigured || !stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 503 },
    );
  }

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
    "region",
    "zip",
  ];
  const missing = required.filter((k) => !address?.[k]);
  if (!address || missing.length) {
    return NextResponse.json(
      { error: `Missing address fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  let validatedItems: ValidatedItem[];
  try {
    validatedItems = await validateItems(items);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid cart item" },
      { status: 422 },
    );
  }

  const lineItems: OrderLineItem[] = validatedItems.map((i) => ({
    product_id: i.productId,
    variant_id: i.variantId,
    quantity: i.qty,
  }));

  const externalId = `fanzonstore-${Date.now()}`;
  const subtotalCents = validatedItems.reduce(
    (sum, i) => sum + i.price * i.qty,
    0,
  );

  // Authoritative shipping: recompute from Printify server-side (never trust a
  // client-sent shipping number). getShippingCost returns CENTS already.
  // On failure, fall back to 0 so an order is never blocked — flag for review.
  let shippingCents = 0;
  let shippingMethod: number = SHIPPING_METHOD.standard;
  if (!qualifiesForFreeShipping(subtotalCents)) {
    try {
      const rates = await getShippingCost({ lineItems, address });
      if (typeof rates.standard === "number") {
        shippingCents = rates.standard;
        shippingMethod = SHIPPING_METHOD.standard;
      } else {
        throw new Error("No standard shipping rate returned.");
      }
    } catch (e) {
      console.error(
        "[checkout] shipping quote failed:",
        e instanceof Error ? e.message : e,
      );
      return NextResponse.json(
        { error: "Could not calculate shipping for this address." },
        { status: 422 },
      );
    }
  }
  const totalCents = subtotalCents + shippingCents;

  // Persist before creating the Stripe session so the webhook has a stable
  // local order to fulfill after payment.
  const order = await prisma.order.create({
    data: {
      externalId,
      status: "PAYMENT_PENDING",
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
        create: validatedItems.map((i) => ({
          productId: i.productId,
          variantId: String(i.variantId),
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: i.price,
        })),
      },
    },
  });

  try {
    const origin = siteOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: String(address.email),
      submit_type: "pay",
      line_items: [
        ...validatedItems.map((item) => ({
          quantity: item.qty,
          price_data: {
            currency: "usd",
            unit_amount: item.price,
            product_data: {
              name: item.name,
              images: item.image.startsWith("http") ? [item.image] : undefined,
              metadata: {
                productId: item.productId,
                variantId: String(item.variantId),
              },
            },
          },
        })),
        ...(shippingCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  unit_amount: shippingCents,
                  product_data: { name: "Standard shipping" },
                },
              },
            ]
          : []),
      ],
      metadata: {
        orderId: order.id,
        externalId,
        shippingMethod: String(shippingMethod),
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          externalId,
        },
      },
      success_url: `${origin}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: session.id,
      },
    });
    return NextResponse.json({
      ok: true,
      checkoutUrl: session.url,
      orderId: order.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    console.error("[checkout] Stripe session error:", message);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_FAILED" },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
