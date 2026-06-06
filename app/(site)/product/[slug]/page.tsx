import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import {
  getCatalog,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(slug);

  return (
    <main className="container-page pb-16 pt-28 sm:pb-20 sm:pt-32">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 font-sport text-xs uppercase tracking-wider text-mist">
          <li>
            <Link
              href="/"
              className="cursor-pointer transition-colors duration-200 hover:text-pitch-300 focus-visible:outline-none focus-visible:text-pitch-300"
            >
              Home
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
          <li>
            <Link
              href="/shop"
              className="cursor-pointer transition-colors duration-200 hover:text-pitch-300 focus-visible:outline-none focus-visible:text-pitch-300"
            >
              Shop
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
          <li aria-current="page" className="min-w-0 truncate text-chalk">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} />

      {/* You may also like */}
      {related.length > 0 && (
        <section className="mt-16 sm:mt-24 lg:mt-28">
          <Reveal>
            <h2 className="font-display text-3xl text-chalk sm:text-4xl">
              You may also <span className="text-gradient-pitch">like</span>
            </h2>
          </Reveal>
          <Reveal
            stagger
            className="mt-8 grid grid-cols-2 auto-rows-fr gap-4 sm:gap-6 lg:grid-cols-4"
          >
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </Reveal>
        </section>
      )}
    </main>
  );
}
