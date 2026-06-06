import type { Metadata } from "next";
import { LegalLayout, SITE } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: `How returns, replacements, and refunds work for ${SITE.brand} print-on-demand orders.`,
};

export default function ReturnsPage() {
  return (
    <LegalLayout
      title="Returns & Refunds"
      updated="5 June 2026"
      current="/returns"
      intro={
        <>
          We want you to love what you wear. Because {SITE.brand} items are
          custom-made to order, returns work a little differently from a regular
          store — here&rsquo;s exactly how.
        </>
      }
    >
      <h2>1. Made-to-order items</h2>
      <p>
        Each product is printed specifically for you, so we cannot accept returns or
        offer refunds for <strong>buyer&rsquo;s remorse</strong> — for example
        ordering the wrong size, colour, or simply changing your mind. Please use our{" "}
        <a href="/size-guide">Size Guide</a> before ordering.
      </p>

      <h2>2. Damaged, defective, or wrong items</h2>
      <p>
        If your order arrives <strong>damaged, defective, or incorrect</strong>,
        we&rsquo;ll make it right with a free replacement or a full refund. To
        qualify, please contact us within <strong>30 days</strong> of delivery with:
      </p>
      <ul>
        <li>Your order number.</li>
        <li>A description of the issue.</li>
        <li>
          Clear photos of the item and, where relevant, the shipping label and
          packaging.
        </li>
      </ul>
      <p>
        Email these to{" "}
        <a href={`mailto:${SITE.legalEmail}`}>{SITE.legalEmail}</a> and our team will
        respond promptly.
      </p>

      <h2>3. How refunds are issued</h2>
      <p>
        Approved refunds are returned to your original payment method. Once approved,
        please allow several business days for your bank or card provider to process
        and display the refund.
      </p>

      <h2>4. Replacements</h2>
      <p>
        Where a replacement is appropriate, we&rsquo;ll reproduce and ship the
        corrected item at no additional cost to you. You will not normally need to
        return the faulty item, but please keep it until your claim is resolved.
      </p>

      <h2>5. Cancellations &amp; changes</h2>
      <p>
        We begin production quickly. If you need to change or cancel an order, contact
        us immediately — we can only make changes <strong>before the item enters
        production</strong>. Once production starts, the order cannot be cancelled.
      </p>

      <h2>6. Non-delivery</h2>
      <p>
        If your order doesn&rsquo;t arrive within the estimated delivery window (see
        our <a href="/shipping">Shipping Policy</a>), get in touch and we&rsquo;ll
        work with the carrier and print partner to resolve it, including a
        replacement or refund where warranted.
      </p>

      <h2>7. Your statutory rights</h2>
      <p>
        Nothing in this policy affects any statutory rights you may have as a consumer
        under the laws of your country, including rights relating to faulty goods.
      </p>

      <h2>8. Contact</h2>
      <p>
        For any return, replacement, or refund request, email{" "}
        <a href={`mailto:${SITE.legalEmail}`}>{SITE.legalEmail}</a> with your order
        number and we&rsquo;ll take care of you.
      </p>
    </LegalLayout>
  );
}
