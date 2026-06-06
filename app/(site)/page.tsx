import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { PodFeatures } from "@/components/home/PodFeatures";
import { BigCTA } from "@/components/home/BigCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <TrendingProducts />
      <PodFeatures />
      <BigCTA />
    </>
  );
}
