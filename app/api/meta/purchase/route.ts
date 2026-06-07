import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { metaEventId, orderItemsToMetaCustomData } from "@/lib/meta";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    eventId: metaEventId("Purchase", order.id),
    customData: orderItemsToMetaCustomData(order.items, order.total, order.id),
  });
}

