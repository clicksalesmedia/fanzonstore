import type { Metadata } from "next";
import { LegalLayout, SITE } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${SITE.brand} uses cookies and similar technologies on ${SITE.domain}.`,
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      updated="5 June 2026"
      current="/cookies"
      intro={
        <>
          This Cookie Policy explains how {SITE.brand} uses cookies and similar
          technologies on {SITE.domain}, and how you can control them. It should be
          read alongside our <a href="/privacy">Privacy Policy</a>.
        </>
      }
    >
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website.
        They help the site work, remember your preferences, keep your cart, and tell
        us how the store is being used. We also use similar technologies such as
        local storage and pixels, which we refer to collectively as
        &ldquo;cookies&rdquo;.
      </p>

      <h2>2. Types of cookies we use</h2>
      <h3>Strictly necessary</h3>
      <p>
        Required for the store to function — for example keeping items in your cart,
        enabling secure checkout, and remembering your session. These cannot be
        switched off.
      </p>
      <h3>Preferences</h3>
      <p>
        Remember choices you make, such as your region, language, or display
        settings, to give you a more personal experience.
      </p>
      <h3>Analytics &amp; performance</h3>
      <p>
        Help us understand how visitors use the store — which pages are popular and
        where issues occur — so we can improve it. This data is aggregated and used
        to measure and enhance performance.
      </p>
      <h3>Marketing</h3>
      <p>
        Used to measure the effectiveness of our campaigns and, where you consent, to
        show you relevant ads on other platforms. These are set only with your
        permission.
      </p>

      <h2>3. Third-party cookies</h2>
      <p>
        Some cookies are set by trusted third parties whose services we use, such as
        payment providers, analytics tools, and social or advertising platforms.
        These providers have their own privacy and cookie policies.
      </p>

      <h2>4. Managing your cookies</h2>
      <ul>
        <li>
          Use our cookie banner or preference settings (where shown) to accept or
          reject non-essential cookies.
        </li>
        <li>
          Adjust your browser settings to block or delete cookies. Most browsers let
          you do this in their privacy or security menu.
        </li>
        <li>
          Note that blocking strictly necessary cookies may stop parts of the store —
          such as the cart and checkout — from working.
        </li>
      </ul>

      <h2>5. Changes to this policy</h2>
      <p>
        We may update this Cookie Policy as our use of cookies changes. The
        &ldquo;last updated&rdquo; date above shows when it was last revised.
      </p>

      <h2>6. Contact</h2>
      <p>
        For any questions about how we use cookies, email{" "}
        <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a>.
      </p>
    </LegalLayout>
  );
}
