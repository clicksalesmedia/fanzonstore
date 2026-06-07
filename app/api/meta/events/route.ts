import { NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta";
import type { MetaCustomData, MetaEventName } from "@/lib/meta-types";

export const runtime = "nodejs";

const allowedEvents = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
]);

export async function POST(req: Request) {
  let body: {
    eventName?: string;
    eventId?: string;
    sourceUrl?: string;
    customData?: MetaCustomData;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.eventName || !allowedEvents.has(body.eventName)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  if (!body.eventId) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  await sendMetaEvent(
    {
      eventName: body.eventName as MetaEventName,
      eventId: body.eventId,
      eventSourceUrl: body.sourceUrl,
      customData: body.customData,
    },
    req,
  );

  return NextResponse.json({ ok: true });
}
