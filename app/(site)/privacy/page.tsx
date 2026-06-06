import type { Metadata } from "next";
import { LegalLayout, SITE } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.brand} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="5 June 2026"
      current="/privacy"
      intro={
        <>
          {SITE.brand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
          respects your privacy. This policy explains what personal information we
          collect when you visit or shop at {SITE.domain}, how we use it, who we
          share it with, and the rights you have over it.
        </>
      }
    >
      <h2>1. Who we are</h2>
      <p>
        {SITE.brand} is a brand owned and operated by {SITE.company}, a company
        registered in {SITE.companyLocation}. {SITE.company} runs the online store
        at <a href={SITE.url}>{SITE.domain}</a>, selling fan apparel and accessories
        on a print-on-demand basis. For any privacy question you can reach us at{" "}
        <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a>. {SITE.company}{" "}
        is the data controller responsible for your personal information.
      </p>

      <h2>2. Information we collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Order &amp; contact details</strong> — name, email address,
          phone number, billing and shipping address. We need these to fulfil and
          deliver your order.
        </li>
        <li>
          <strong>Payment information</strong> — processed securely by our payment
          providers (e.g. Stripe, PayPal). We do not store full card numbers on our
          servers.
        </li>
        <li>
          <strong>Account information</strong> — if you create an account, your
          login credentials and saved preferences.
        </li>
        <li>
          <strong>Communications</strong> — messages you send us, newsletter
          sign-ups, and support requests.
        </li>
        <li>
          <strong>Usage &amp; device data</strong> — IP address, browser type,
          pages viewed, and similar analytics data collected via cookies (see our{" "}
          <a href="/cookies">Cookie Policy</a>).
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To process, produce, and ship your orders, and to send order updates.</li>
        <li>To provide customer support and respond to your enquiries.</li>
        <li>To send marketing emails where you have opted in (you can unsubscribe at any time).</li>
        <li>To detect and prevent fraud, and to keep our store secure.</li>
        <li>To measure and improve our website, products, and service.</li>
        <li>To comply with our legal and tax obligations.</li>
      </ul>

      <h2>4. Legal bases (for EEA/UK visitors)</h2>
      <p>
        Where the GDPR or UK GDPR applies, we process your data on the basis of:
        performance of a contract (to fulfil your order), your consent (for
        marketing and non-essential cookies), our legitimate interests (to improve
        and secure the store), and compliance with legal obligations.
      </p>

      <h2>5. Sharing with third parties</h2>
      <p>
        We are a print-on-demand store, so fulfilment is carried out by trusted
        partners. We share only the data necessary to deliver your order with:
      </p>
      <ul>
        <li>
          <strong>Printify</strong> and its connected print providers — to produce
          and ship your items.
        </li>
        <li>
          <strong>Payment processors</strong> — to take payment securely.
        </li>
        <li>
          <strong>Shipping carriers</strong> — to deliver your parcel and provide
          tracking.
        </li>
        <li>
          <strong>Analytics, email, and hosting providers</strong> — to operate and
          improve the service.
        </li>
      </ul>
      <p>
        We never sell your personal information. Some of these partners may process
        data outside your country; where that happens we rely on appropriate
        safeguards such as Standard Contractual Clauses.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We keep order and transaction records for as long as needed to fulfil the
        order and to meet legal, accounting, and tax requirements. Marketing data is
        kept until you unsubscribe or ask us to delete it.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        delete, or port your data; to object to or restrict processing; and to
        withdraw consent. California residents have rights under the CCPA/CPRA,
        including the right to know and to opt out of any &ldquo;sale&rdquo; or
        &ldquo;sharing&rdquo; of personal information (we do not sell your data). To
        exercise any right, email{" "}
        <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a>.
      </p>

      <h2>8. Children</h2>
      <p>
        Our store is not directed at children under 16, and we do not knowingly
        collect their personal information. If you believe a child has provided us
        data, please contact us and we will delete it.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard measures (encryption in transit, access controls,
        and trusted processors) to protect your data. No method of transmission over
        the internet is 100% secure, but we work hard to safeguard your information.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;last updated&rdquo;
        date above reflects the latest version, and significant changes will be
        highlighted on this page.
      </p>
    </LegalLayout>
  );
}
