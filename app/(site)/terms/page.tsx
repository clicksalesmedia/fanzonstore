import type { Metadata } from "next";
import { LegalLayout, SITE } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms that govern your use of ${SITE.brand} and any purchase you make.`,
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      updated="5 June 2026"
      current="/terms"
      intro={
        <>
          These Terms &amp; Conditions govern your access to and use of{" "}
          {SITE.domain} and any order you place with {SITE.brand}. By using the site
          or buying from us, you agree to these terms. Please read them carefully.
        </>
      }
    >
      <h2>1. About us</h2>
      <p>
        {SITE.domain} is an independent fan store operated under the {SITE.brand}{" "}
        brand by {SITE.company}, a company registered in {SITE.companyLocation}. We
        sell apparel and accessories on a print-on-demand basis. You can contact us
        at <a href={`mailto:${SITE.legalEmail}`}>{SITE.legalEmail}</a>.
      </p>

      <h2>2. Not an official / affiliated store</h2>
      <p>
        {SITE.brand} is an independent retailer. We are not affiliated with,
        endorsed by, licensed by, or sponsored by FIFA, any national football
        association, team, or tournament organiser. All team names, country names,
        and related references are used descriptively for fan products only, and all
        trademarks remain the property of their respective owners.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 18 years old (or have the consent of a parent or
        guardian) and able to form a binding contract to place an order.
      </p>

      <h2>4. Products &amp; print-on-demand</h2>
      <p>
        Items are made to order by our print partners. Because each product is
        produced individually:
      </p>
      <ul>
        <li>
          Colours shown on screen may differ slightly from the finished product due
          to display settings and the printing process.
        </li>
        <li>
          Small variations in print placement and sizing are normal and are not
          considered defects.
        </li>
        <li>Production time is required before an item ships (see our <a href="/shipping">Shipping Policy</a>).</li>
      </ul>

      <h2>5. Pricing &amp; payment</h2>
      <p>
        All prices are shown in the currency indicated at checkout and may exclude
        taxes, duties, or shipping, which are added before payment. We may correct
        pricing errors and cancel affected orders, refunding any amount paid. Payment
        is taken at the time you place your order through our secure payment
        providers.
      </p>

      <h2>6. Orders &amp; acceptance</h2>
      <p>
        Your order is an offer to buy. A contract is formed only when we send an
        order confirmation. We may refuse or cancel an order — for example if an item
        is unavailable, there is a pricing error, or we suspect fraud — and will
        refund you in that case.
      </p>

      <h2>7. Cancellations, returns &amp; refunds</h2>
      <p>
        Because items are custom-made for you, cancellation and return rights are
        limited. Full details, including how we handle damaged, defective, or
        incorrect items, are set out in our{" "}
        <a href="/returns">Returns &amp; Refunds Policy</a>, which forms part of
        these terms.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        All content on this site — including designs, graphics, logos, text, and
        photographs — is owned by or licensed to {SITE.brand} and is protected by
        intellectual property laws. You may not copy, reproduce, or resell our
        designs or content without our written permission.
      </p>

      <h2>9. Acceptable use</h2>
      <p>
        You agree not to misuse the site, attempt to gain unauthorised access,
        interfere with its operation, or use it for any unlawful purpose.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE.brand} is not liable for
        indirect, incidental, or consequential losses. Nothing in these terms limits
        liability that cannot be excluded by law, including your statutory consumer
        rights. Where we are liable, our total liability is limited to the amount you
        paid for the relevant order.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of {SITE.companyLocation}, the place of
        business of {SITE.company}, and any disputes will be subject to the courts of
        that jurisdiction, without affecting any mandatory consumer protections
        available to you locally.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The version in force is the one
        published on this page at the time you place your order.
      </p>
    </LegalLayout>
  );
}
