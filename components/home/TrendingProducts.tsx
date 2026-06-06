import { getCatalog } from "@/lib/catalog";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";

export async function TrendingProducts() {
  const products = await getCatalog();
  const trending = products.slice(0, 8);

  return (
    <section className="container-page py-14 md:py-28">
      <div className="mb-8 flex flex-col gap-4 md:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sport text-xs text-pitch-300">Selling fast</p>
          <h2 className="font-display mt-3 text-4xl text-chalk sm:text-5xl">
            Trending now
          </h2>
        </div>
        <ButtonLink href="/shop" variant="outline" size="md">
          View all
        </ButtonLink>
      </div>

      <Reveal className="grid grid-cols-2 auto-rows-fr gap-4 sm:gap-5 lg:grid-cols-4">
        {trending.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Reveal>
    </section>
  );
}
