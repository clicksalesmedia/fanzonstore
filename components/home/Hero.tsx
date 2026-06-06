"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ButtonLink } from "@/components/ui/Button";
import { Flame, Heart, Sparkles } from "lucide-react";

gsap.registerPlugin(useGSAP);

const HEADLINE = ["WEAR", "THE", "FEELING"];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        tl.from(".hero-eyebrow", { opacity: 0, y: 18, duration: 0.6 })
          .from(
            ".hero-word",
            { opacity: 0, yPercent: 110, duration: 0.9, stagger: 0.1 },
            "-=0.2",
          )
          .from(
            ".hero-sub",
            { opacity: 0, y: 20, duration: 0.7 },
            "-=0.45",
          )
          .from(
            ".hero-cta",
            { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 },
            "-=0.4",
          )
          .from(
            ".hero-trust",
            { opacity: 0, y: 16, duration: 0.6 },
            "-=0.35",
          );

        gsap.to(".hero-glow", {
          y: -24,
          x: 16,
          duration: 6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        gsap.to(".hero-glow-2", {
          y: 28,
          x: -18,
          duration: 7.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // Reduced-motion: ensure everything is visible (no animation)
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".hero-eyebrow",
            ".hero-word",
            ".hero-sub",
            ".hero-cta",
            ".hero-trust",
          ],
          { opacity: 1, y: 0, yPercent: 0 },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden"
    >
      {/* Background image */}
      <Image
        src="/images/brand/hero.webp"
        alt="Floodlit stadium on a summer tournament night"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />

      {/* Darkening + tint overlays for legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/70 via-ink-950/80 to-ink-950" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/90 via-ink-950/40 to-transparent" />

      {/* Floating glow accents */}
      <div className="hero-glow pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-pitch-500/25 blur-[120px]" />
      <div className="hero-glow-2 pointer-events-none absolute bottom-10 right-0 -z-10 h-80 w-80 rounded-full bg-gold-500/20 blur-[130px]" />

      <div className="container-page py-28 md:py-32">
        <div className="max-w-3xl">
          <p className="hero-eyebrow font-sport text-xs text-pitch-300 sm:text-sm">
            THE SUMMER THE WHOLE WORLD STOPS · 2026
          </p>

          <h1 className="font-display mt-5 text-[clamp(3rem,11vw,7.5rem)] text-chalk">
            {HEADLINE.map((word) => (
              <span key={word} className="block overflow-hidden">
                <span className="hero-word inline-block">
                  {word === "FEELING" ? (
                    <span className="text-gradient-pitch">{word}</span>
                  ) : (
                    word
                  )}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero-sub mt-6 max-w-xl text-base text-mist sm:text-lg">
            That roar when the net ripples. The goosebumps before kickoff. This is
            how you carry it — colors that say{" "}
            <span className="text-chalk">I was here, I believed, I belonged.</span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href="/shop" variant="primary" size="lg" className="hero-cta">
              Claim your colors
            </ButtonLink>
            <ButtonLink
              href="#why"
              variant="outline"
              size="lg"
              className="hero-cta"
            >
              Feel the summer
            </ButtonLink>
          </div>

          <ul className="hero-trust mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 font-sport text-[0.7rem] text-mist sm:text-xs">
            <li className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-pitch-400" aria-hidden />
              For the believers
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pitch-400" aria-hidden />
              Made for the moment
            </li>
            <li className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pitch-400" aria-hidden />
              Yours to keep
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
