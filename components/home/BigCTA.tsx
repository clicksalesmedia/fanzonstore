import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";

export function BigCTA() {
  return (
    <section className="container-page pb-24 pt-4 md:pb-32">
      <Reveal className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-24">
        <Image
          src="/images/brand/grid-texture.webp"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover opacity-30"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pitch-600/30 via-ink-950/80 to-gold-500/25" />
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-pitch-500/30 blur-[120px]" />

        <p className="font-sport text-xs text-pitch-300">One summer. One chance.</p>
        <h2 className="font-display mx-auto mt-5 max-w-3xl text-5xl text-chalk sm:text-7xl">
          Don&apos;t just watch history.{" "}
          <span className="text-gradient-pitch">Belong to it.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-mist sm:text-base">
          When they look back on 2026, where were you standing? Find your colors
          now — and wear the moment you&apos;ll never forget.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/shop" variant="gold" size="lg">
            Claim your colors
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
