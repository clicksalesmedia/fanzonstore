import { fetchAdminProducts, printifyConfigured } from "@/lib/printify";
import { createBundle } from "../bundle-actions";
import { BundleForm } from "../bundle-form";

export const dynamic = "force-dynamic";

export default async function NewBundlePage() {
  if (!printifyConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-400">
        Printify isn&apos;t configured, so there are no products to bundle. Set
        PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID first.
      </div>
    );
  }

  const products = await fetchAdminProducts();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New bundle</h1>
      <BundleForm
        action={createBundle}
        products={products}
        submitLabel="Create bundle"
      />
    </div>
  );
}
