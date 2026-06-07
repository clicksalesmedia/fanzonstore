import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import {
  metaEventId,
  orderItemsToMetaCustomData,
  sendMetaEvent,
} from "@/lib/meta";
import {
  createPrintifyOrder,
  printifyConfigured,
  type OrderLineItem,
  type ShippingAddress,
} from "@/lib/printify";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function paymentIntentId(session: Stripe.Checkout.Session) {
  const paymentIntent = session.payment_intent;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;
}

async function fulfillPaidCheckout(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const order = await prisma.order.findFirst({
    where: orderId
      ? { id: orderId }
      : { stripeCheckoutSessionId: session.id },
    include: { items: true },
  });

  if (!order) {
    throw new Error(`No local order for Stripe session ${session.id}`);
  }

  if (session.amount_total !== order.total) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAYMENT_FAILED",
        stripePaymentIntentId: paymentIntentId(session) ?? null,
      },
    });
    throw new Error(`Stripe amount mismatch for order ${order.id}`);
  }

  const paidData = {
    stripePaymentIntentId: paymentIntentId(session) ?? null,
    paidAt: new Date(),
  };

  if (!order.paidAt) {
    await sendMetaEvent({
      eventName: "Purchase",
      eventId: metaEventId("Purchase", order.id),
      eventSourceUrl: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://fanzonstore.com"
      }/checkout`,
      userData: {
        email: order.email,
        phone: order.phone,
        firstName: order.firstName,
        lastName: order.lastName,
        city: order.city,
        state: order.region,
        zip: order.zip,
        country: order.country,
      },
      customData: orderItemsToMetaCustomData(order.items, order.total, order.id),
    });
  }

  if (order.printifyOrderId) {
    await prisma.order.update({
      where: { id: order.id },
      data: paidData,
    });
    return;
  }

  if (!printifyConfigured) {
    await prisma.order.update({
      where: { id: order.id },
      data: { ...paidData, status: "PENDING" },
    });
    throw new Error("Printify is not configured");
  }

  const address: ShippingAddress = {
    first_name: order.firstName,
    last_name: order.lastName,
    email: order.email,
    phone: order.phone ?? undefined,
    country: order.country,
    region: order.region ?? undefined,
    address1: order.address1,
    address2: order.address2 ?? undefined,
    city: order.city,
    zip: order.zip,
  };
  // Build Printify line items from the persisted order items. Bundle orders have
  // one OrderItem per component, so they naturally fulfill as multiple line
  // items. Merge any duplicates (same product+variant) so Printify gets a single
  // line with the summed quantity.
  const merged = new Map<string, OrderLineItem>();
  for (const item of order.items) {
    const variantId = Number(item.variantId);
    const key = `${item.productId}-${variantId}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += item.qty;
    } else {
      merged.set(key, {
        product_id: item.productId,
        variant_id: variantId,
        quantity: item.qty,
      });
    }
  }
  const lineItems: OrderLineItem[] = [...merged.values()];

  try {
    const result = await createPrintifyOrder({
      externalId: order.externalId,
      address,
      lineItems,
      shippingMethod: Number(session.metadata?.shippingMethod) || undefined,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        ...paidData,
        printifyOrderId: result.id ? String(result.id) : null,
        status: result.sentToProduction ? "IN_PRODUCTION" : "ON_HOLD",
      },
    });
  } catch (e) {
    await prisma.order.update({
      where: { id: order.id },
      data: { ...paidData, status: "PENDING" },
    });
    throw e;
  }
}

export async function POST(req: Request) {
  if (!stripe || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      WEBHOOK_SECRET,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await fulfillPaidCheckout(event.data.object);
    }

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object;
      await prisma.order.updateMany({
        where: { stripeCheckoutSessionId: session.id },
        data: { status: "PAYMENT_FAILED" },
      });
    }
  } catch (e) {
    console.error("[stripe-webhook]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
