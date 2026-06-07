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
import { orderItemsToMetaCustomData, sendMetaEvent } from "@/lib/meta";
import { stripe, stripeConfigured } from "@/lib/stripe";
import type { BundleComponentSelection } from "@/lib/types";

export const runtime = "nodejs";

interface CheckoutItem {
  productId: string;
  variantId: string | number;
  qty: number;
  name?: string;
  image?: string;
  price?: number; // dollars (ignored server-side)
  size?: string;
  color?: string;
  /** present for bundle lines — carries the chosen component variants */
  bundle?: {
    bundleId: string;
    components: BundleComponentSelection[];
  };
}

/** A row to persist as OrderItem (prices in cents). */
interface BuiltOrderItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  price: number; // unit price in cents
  bundleId?: string;
  bundleLabel?: string;
}

interface StripeLine {
  quantity: number;
  price_data: {
    currency: "usd";
    unit_amount: number;
    product_data: {
      name: string;
      images?: string[];
      metadata?: Record<string, string>;
    };
  };
}

interface BuiltCheckout {
  orderItems: BuiltOrderItem[];
  /** every physical item for the Printify shipping quote (bundles flattened) */
  printifyLineItems: OrderLineItem[];
  stripeLines: StripeLine[];
  subtotalCents: number;
}

function siteOrigin(req: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.headers.get("origin") ||
    new URL(req.url).origin
  );
}

/**
 * Validate ONE Printify product variant against the live admin API. Returns the
 * authoritative name/image/price (cents)/size/color, or throws if unavailable.
 */
async function validateComponent(productId: string, variantId: number) {
  if (!productId || !Number.isFinite(variantId)) {
    throw new Error("One or more cart items are not Printify products.");
  }
  const product = await fetchPrintifyProductForAdmin(productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant || !variant.isEnabled || !variant.isAvailable) {
    throw new Error("One or more cart items are no longer available.");
  }
  return {
    name: product.title,
    image: product.image,
    price: variant.price, // cents
    size: variant.size,
    color: variant.color,
  };
}

/**
 * Turn the raw cart items into everything checkout needs. Singles are priced
 * from Printify; bundles are priced from the DB (the FIXED set price, never the
 * client) and expanded into one OrderItem per component so the webhook fulfills
 * them as separate Printify line items. The fixed price is split across the
 * components (floor + remainder-to-first) so the OrderItem prices sum EXACTLY to
 * the bundle price — keeping `Stripe amount_total === order.total`.
 */
async function buildCheckout(items: CheckoutItem[]): Promise<BuiltCheckout> {
  const orderItems: BuiltOrderItem[] = [];
  const printifyLineItems: OrderLineItem[] = [];
  const stripeLines: StripeLine[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const qty = Math.max(1, Number(item.qty) || 1);

    if (item.bundle) {
      const { bundleId, components } = item.bundle;
      if (!bundleId || !components?.length) {
        throw new Error("Invalid bundle in cart.");
      }

      const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        include: { components: true },
      });
      if (!bundle || !bundle.active) {
        throw new Error("This set is no longer available.");
      }

      // Anti-tamper: submitted components must match the configured set.
      const configured = new Map(
        bundle.components.map((c) => [c.productId, c]),
      );
      if (components.length !== bundle.components.length) {
        throw new Error("This set has changed. Please rebuild it.");
      }

      // Split the fixed bundle price (cents) across components.
      const n = components.length;
      const base = Math.floor(bundle.price / n);
      const remainder = bundle.price - base * n;

      for (let idx = 0; idx < components.length; idx++) {
        const comp = components[idx];
        const cfg = configured.get(comp.productId);
        if (!cfg) {
          throw new Error("This set has changed. Please rebuild it.");
        }
        const variantId = Number(comp.variantId);
        if (cfg.lockedVariantId != null && cfg.lockedVariantId !== variantId) {
          throw new Error("This set has changed. Please rebuild it.");
        }

        const v = await validateComponent(comp.productId, variantId);
        const unitPrice = base + (idx === 0 ? remainder : 0);

        orderItems.push({
          productId: comp.productId,
          variantId: String(variantId),
          name: v.name,
          image: v.image,
          size: v.size,
          color: v.color,
          qty,
          price: unitPrice,
          bundleId: bundle.id,
          bundleLabel: cfg.label,
        });
        printifyLineItems.push({
          product_id: comp.productId,
          variant_id: variantId,
          quantity: qty,
        });
      }

      // ONE Stripe line at the fixed set price (shopper sees a single price).
      stripeLines.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: bundle.price,
          product_data: {
            name: bundle.name,
            images: bundle.image.startsWith("http") ? [bundle.image] : undefined,
            metadata: { bundleId: bundle.id },
          },
        },
      });
      subtotalCents += bundle.price * qty;
      continue;
    }

    // Single product.
    const productId = String(item.productId);
    const variantId = Number(item.variantId);
    const v = await validateComponent(productId, variantId);

    orderItems.push({
      productId,
      variantId: String(variantId),
      name: v.name,
      image: v.image,
      size: v.size,
      color: v.color,
      qty,
      price: v.price,
    });
    printifyLineItems.push({
      product_id: productId,
      variant_id: variantId,
      quantity: qty,
    });
    stripeLines.push({
      quantity: qty,
      price_data: {
        currency: "usd",
        unit_amount: v.price,
        product_data: {
          name: v.name,
          images: v.image.startsWith("http") ? [v.image] : undefined,
          metadata: { productId, variantId: String(variantId) },
        },
      },
    });
    subtotalCents += v.price * qty;
  }

  return { orderItems, printifyLineItems, stripeLines, subtotalCents };
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

  let body: {
    items?: CheckoutItem[];
    address?: ShippingAddress;
    metaEventId?: string;
  };
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

  let built: BuiltCheckout;
  try {
    built = await buildCheckout(items);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid cart item" },
      { status: 422 },
    );
  }

  const { orderItems, printifyLineItems, stripeLines, subtotalCents } = built;
  const externalId = `fanzonstore-${Date.now()}`;

  // Authoritative shipping: recompute from Printify server-side (never trust a
  // client-sent shipping number). getShippingCost returns CENTS already.
  let shippingCents = 0;
  let shippingMethod: number = SHIPPING_METHOD.standard;
  if (!qualifiesForFreeShipping(subtotalCents)) {
    try {
      const rates = await getShippingCost({
        lineItems: printifyLineItems,
        address,
      });
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
        create: orderItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: i.price,
          bundleId: i.bundleId ?? null,
          bundleLabel: i.bundleLabel ?? null,
        })),
      },
    },
  });

  await sendMetaEvent(
    {
      eventName: "InitiateCheckout",
      eventId: body.metaEventId || `InitiateCheckout:${order.id}`,
      eventSourceUrl: `${siteOrigin(req)}/checkout`,
      userData: {
        email: String(address.email),
        phone: address.phone ? String(address.phone) : null,
        firstName: String(address.first_name),
        lastName: String(address.last_name),
        city: String(address.city),
        state: address.region ? String(address.region) : null,
        zip: String(address.zip),
        country: String(address.country),
      },
      customData: orderItemsToMetaCustomData(
        orderItems,
        totalCents,
        order.id,
      ),
    },
    req,
  );

  try {
    const origin = siteOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: String(address.email),
      submit_type: "pay",
      line_items: [
        ...stripeLines,
        ...(shippingCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd" as const,
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
