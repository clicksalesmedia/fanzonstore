"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** delay in seconds */
  delay?: number;
  /** stagger direct children instead of the wrapper itself */
  stagger?: boolean;
  y?: number;
  as?: ElementType;
}

/**
 * Scroll-triggered fade/rise reveal. Respects prefers-reduced-motion via
 * gsap.matchMedia — motion only runs when the user allows it.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = false,
  y = 28,
  as,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger
          ? ref.current?.children
          : ref.current;
        if (!targets) return;
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.8,
          ease: "power3.out",
          delay,
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
