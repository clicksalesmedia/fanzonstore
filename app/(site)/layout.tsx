import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

/**
 * Storefront chrome (navbar / footer / cart drawer). Lives in the (site) route
 * group so it wraps the public shop pages only — the /admin dashboard has its
 * own isolated shell and does NOT inherit this.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
