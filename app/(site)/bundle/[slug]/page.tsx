import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundleDetail } from "@/lib/bundles";
import { BundleDetail } from "@/components/bundle/BundleDetail";

// Bundles are admin-driven content, so keep this route dynamic (no
// generateStaticParams); bundle-actions revalidate the relevant paths on save.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getBundleDetail(slug);
  if (!detail) return { title: "Bundle not found" };
  const { bundle } = detail;
  return {
    title: bundle.name,
    description: bundle.description,
    openGraph: {
      title: bundle.name,
      description: bundle.description,
      images: bundle.image ? [{ url: bundle.image }] : undefined,
    },
  };
}

export default async function BundlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getBundleDetail(slug);
  if (!detail) notFound();

  const { bundle, components } = detail;

  return (
    <main className="container-page py-12 sm:py-16">
      <BundleDetail
        bundle={{
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          image: bundle.image,
          price: bundle.price / 100,
          compareAtPrice:
            bundle.compareAtPrice != null ? bundle.compareAtPrice / 100 : null,
          badge: bundle.badge,
        }}
        components={components.map((c) => ({
          label: c.label,
          lockedVariantId: c.lockedVariantId,
          product: c.product,
        }))}
      />
    </main>
  );
}
