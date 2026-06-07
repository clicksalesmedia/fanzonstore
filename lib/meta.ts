import "server-only";

import { createHash } from "node:crypto";
import type { MetaCustomData, MetaEventName } from "@/lib/meta-types";
export type { MetaCustomData } from "@/lib/meta-types";

interface MetaUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

interface TrackMetaInput {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl?: string | null;
  customData?: MetaCustomData;
  userData?: MetaUserData;
}

interface OrderLikeItem {
  productId: string;
  qty: number;
  price: number;
}

const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v22.0";
const META_PIXEL_ID =
  process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

export const metaConfigured = Boolean(META_PIXEL_ID && META_ACCESS_TOKEN);

function stripEmpty<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    }),
  ) as Partial<T>;
}

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() || undefined;
}

function normalizePhone(value?: string | null) {
  const digits = value?.replace(/\D/g, "");
  return digits || undefined;
}

function hash(value?: string) {
  if (!value) return undefined;
  return createHash("sha256").update(value).digest("hex");
}

function clientIp(req?: Request) {
  if (!req) return undefined;
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    undefined
  );
}

function requestCookie(req: Request | undefined, name: string) {
  const cookie = req?.headers.get("cookie");
  if (!cookie) return undefined;
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function requestUserData(req?: Request, userData?: MetaUserData) {
  return stripEmpty({
    em: hash(normalize(userData?.email)),
    ph: hash(normalizePhone(userData?.phone)),
    fn: hash(normalize(userData?.firstName)),
    ln: hash(normalize(userData?.lastName)),
    ct: hash(normalize(userData?.city)),
    st: hash(normalize(userData?.state)),
    zp: hash(normalize(userData?.zip)),
    country: hash(normalize(userData?.country)),
    client_ip_address: clientIp(req),
    client_user_agent: req?.headers.get("user-agent") || undefined,
    fbp: requestCookie(req, "_fbp"),
    fbc: requestCookie(req, "_fbc"),
  });
}

function requestSourceUrl(req?: Request, fallback?: string | null) {
  return fallback || req?.headers.get("referer") || undefined;
}

export function metaEventId(eventName: MetaEventName, id: string) {
  return `${eventName}:${id}`;
}

export function orderItemsToMetaCustomData(
  items: OrderLikeItem[],
  totalCents: number,
  orderId?: string,
): MetaCustomData {
  const contents = items.map((item) => ({
    id: item.productId,
    quantity: item.qty,
    item_price: Number((item.price / 100).toFixed(2)),
  }));

  return stripEmpty({
    currency: "USD",
    value: Number((totalCents / 100).toFixed(2)),
    content_type: "product",
    content_ids: [...new Set(items.map((item) => item.productId))],
    contents,
    num_items: items.reduce((sum, item) => sum + item.qty, 0),
    order_id: orderId,
  }) as MetaCustomData;
}

export async function sendMetaEvent(input: TrackMetaInput, req?: Request) {
  if (!metaConfigured) return { ok: false, skipped: true };

  const event = stripEmpty({
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: requestSourceUrl(req, input.eventSourceUrl),
    user_data: requestUserData(req, input.userData),
    custom_data: input.customData,
  });

  const payload = stripEmpty({
    data: [event],
    test_event_code: META_TEST_EVENT_CODE,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
        META_ACCESS_TOKEN!,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[meta-capi]", res.status, text);
      return { ok: false, status: res.status };
    }

    return { ok: true };
  } catch (error) {
    console.error("[meta-capi]", error instanceof Error ? error.message : error);
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}
