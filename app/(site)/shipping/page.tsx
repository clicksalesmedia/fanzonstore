import type { Metadata } from "next";
import { LegalLayout, SITE } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `Production times, delivery estimates, and shipping information for ${SITE.brand}.`,
};

export default function ShippingPage() {
  return (
    <LegalLayout
      title="Shipping Policy"
      updated="5 June 2026"
      current="/shipping"
      intro={
        <>
          Every {SITE.brand} item is made to order and shipped from the print
          facility closest to you. Here&rsquo;s what to expect from order to doorstep.
        </>
      }
    >
      <h2>1. Production time</h2>
      <p>
        Because products are printed on demand, each order needs time to be produced
        before it ships. Typical production time is <strong>2–7 business days</strong>.
        Production is separate from delivery time below.
      </p>

      <h2>2. Delivery estimates</h2>
      <p>
        Once produced, your order is handed to the carrier. Estimated delivery times
        after shipping are approximately:
      </p>
      <ul>
        <li><strong>United States:</strong> 3–7 business days</li>
        <li><strong>Europe &amp; UK:</strong> 5–10 business days</li>
        <li><strong>Rest of the world:</strong> 10–20 business days</li>
      </ul>
      <p>
        These are estimates, not guarantees. Carrier delays, customs, weather, and
        peak periods can affect delivery.
      </p>

      <h2>3. Shipping costs</h2>
      <p>
        Shipping is calculated at checkout based on your destination and the items in
        your cart. The total is shown before you pay.
      </p>

      <h2>4. Order tracking</h2>
      <p>
        When your order ships, we email you a confirmation with a tracking link where
        available. You can also use our <a href="/track">Track Order</a> page.
      </p>

      <h2>5. Split shipments</h2>
      <p>
        If your order contains multiple items, they may be produced in different
        facilities and arrive in separate parcels at different times — at no extra
        cost to you.
      </p>

      <h2>6. Customs, duties &amp; taxes</h2>
      <p>
        International orders may be subject to import duties or taxes set by your
        country. These are not included in our prices or shipping charges and are the
        responsibility of the recipient.
      </p>

      <h2>7. Wrong or incomplete address</h2>
      <p>
        Please check your shipping address carefully at checkout. Orders returned to
        sender due to an incorrect or incomplete address may incur a re-shipping fee.
        If your address is wrong, contact us as soon as possible at{" "}
        <a href={`mailto:${SITE.legalEmail}`}>{SITE.legalEmail}</a> — we can only
        amend it before the item enters production.
      </p>

      <h2>8. Lost or delayed parcels</h2>
      <p>
        If your tracking hasn&rsquo;t updated or your parcel is significantly delayed,
        reach out and we&rsquo;ll investigate with the carrier and print partner and
        make it right.
      </p>
    </LegalLayout>
  );
}
