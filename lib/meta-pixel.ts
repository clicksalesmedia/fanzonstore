"use client";

import type { CartLine } from "@/lib/types";
import type { MetaCustomData, MetaEventName } from "@/lib/meta-types";

declare global {
  interface Window {
    fbq?: (
      command: "track",
      eventName: MetaEventName,
      params?: MetaCustomData,
      options?: { eventID?: string },
    ) => void;
  }
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function rounded(value: number) {
  return Number(value.toFixed(2));
}

export function createMetaEventId(eventName: MetaEventName) {
  return `${eventName}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export function lineToMetaCustomData(line: CartLine): MetaCustomData {
  const contents = line.bundle
    ? line.bundle.components.map((component) => ({
        id: component.productId,
        quantity: line.qty,
        item_price: rounded(line.price / line.bundle!.components.length),
      }))
    : [
        {
          id: line.productId,
          quantity: line.qty,
          item_price: rounded(line.price),
        },
      ];

  return {
    currency: "USD",
    value: rounded(line.price * line.qty),
    content_name: line.name,
    content_type: "product",
    content_ids: contents.map((content) => content.id),
    contents,
    num_items: contents.reduce((sum, content) => sum + content.quantity, 0),
  };
}

export function linesToMetaCustomData(
  lines: CartLine[],
  value?: number,
): MetaCustomData {
  const contents = lines.flatMap((line) =>
    line.bundle
      ? line.bundle.components.map((component) => ({
          id: component.productId,
          quantity: line.qty,
          item_price: rounded(line.price / line.bundle!.components.length),
        }))
      : [
          {
            id: line.productId,
            quantity: line.qty,
            item_price: rounded(line.price),
          },
        ],
  );

  return {
    currency: "USD",
    value: rounded(value ?? lines.reduce((sum, line) => sum + line.price * line.qty, 0)),
    content_type: "product",
    content_ids: [...new Set(contents.map((content) => content.id))],
    contents,
    num_items: contents.reduce((sum, content) => sum + content.quantity, 0),
  };
}

export function trackMetaPixelEvent(
  eventName: MetaEventName,
  customData: MetaCustomData = {},
  eventId = createMetaEventId(eventName),
) {
  if (typeof window === "undefined" || !META_PIXEL_ID) return eventId;
  window.fbq?.("track", eventName, customData, { eventID: eventId });
  return eventId;
}

export function trackMetaEvent(
  eventName: MetaEventName,
  customData: MetaCustomData = {},
  eventId = createMetaEventId(eventName),
) {
  trackMetaPixelEvent(eventName, customData, eventId);

  if (typeof window !== "undefined" && META_PIXEL_ID) {
    void fetch("/api/meta/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        customData,
        sourceUrl: window.location.href,
      }),
    }).catch(() => undefined);
  }

  return eventId;
}
