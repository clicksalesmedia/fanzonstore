import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Flame, Users, Trophy } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The story behind Fanzonstore: emotional World Cup 2026 fan gear made for believers, watch parties, family memories, and the summer supporters will never forget.",
};

const beliefs = [
  {
    icon: Heart,
    title: "Belonging",
    copy: "The shirt matters because of who you become when you wear it: louder, prouder, closer to everyone who believes with you.",
  },
  {
    icon: Flame,
    title: "Feeling",
    copy: "We design for the heartbeat before kickoff, the hands on your head, and the roar that makes a room feel like a stadium.",
  },
  {
    icon: Users,
    title: "Memory",
    copy: "World Cups turn ordinary days into family stories. Our pieces are made to carry those moments long after the final whistle.",
  },
];

const moments = [
  "The kid watching their first tournament with wide eyes.",
  "The parent explaining why one match can stay with you forever.",
  "The friends crowding around one screen, all wearing the same hope.",
  "The supporter who still believes when the clock says there is no time left.",
];

export default function OurStoryPage() {
  return (
    <>
      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden pt-28 sm:pt-32">
        <Image
          src="/images/brand/hero.webp"
          alt="Supporters celebrating under World Cup stadium lights"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/40 via-ink-950/70 to-ink-950" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950 to-transparent" />

        <Reveal as="div" className="container-page pb-16 sm:pb-20 lg:pb-24">
          <p className="font-sport text-xs uppercase tracking-[0.3em] text-pitch-300">
            Fanzonstore · Our Story
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-6xl text-chalk sm:text-7xl lg:text-8xl">
            Made for the fans who feel everything.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-mist sm:text-lg">
            Fanzonstore was built for the people who do not just watch the World
            Cup. They plan their days around it. They call family after every
            match. They remember where they were when belief turned into noise.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href="/shop" size="lg">
              Wear the feeling
            </ButtonLink>
            <ButtonLink href="#why-we-exist" variant="outline" size="lg">
              Read the story
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <section id="why-we-exist" className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <p className="font-sport text-xs text-pitch-300">Why we exist</p>
            <h2 className="mt-4 font-display text-4xl text-chalk sm:text-6xl">
              Because one summer can become part of who you are.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="space-y-5 text-base leading-8 text-mist">
            <p>
              A World Cup is more than fixtures and scores. It is the uncle who
              still talks about 1994. The friend who texts in all caps after a
              late winner. The living room that suddenly feels too small for the
              sound inside it.
            </p>
            <p>
              We make fan gear for that feeling. Not official noise. Not empty
              hype. Just pieces that help supporters say,{" "}
              <span className="text-chalk">
                I was here. I believed. I belonged.
              </span>
            </p>
          </Reveal>
        </div>

        <Reveal
          stagger
          className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {beliefs.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-ink-900/70 p-6"
            >
              <Icon className="size-6 text-pitch-400" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl text-chalk">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-mist">{copy}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="container-page py-10 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <Reveal className="relative min-h-[28rem] overflow-hidden rounded-3xl border border-white/10 bg-ink-900">
            <Image
              src="/images/brand/grid-texture.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-35"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ink-950/20 via-ink-950/65 to-pitch-600/25" />
            <div className="relative flex h-full min-h-[28rem] flex-col justify-end p-6 sm:p-10">
              <Trophy className="size-10 text-gold-300" aria-hidden="true" />
              <p className="mt-6 max-w-md font-display text-4xl text-chalk sm:text-5xl">
                For every believer in every room.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col justify-center">
            <p className="font-sport text-xs text-pitch-300">
              Who we design for
            </p>
            <h2 className="mt-4 font-display text-4xl text-chalk sm:text-5xl">
              The fans who turn matches into memories.
            </h2>
            <ul className="mt-8 space-y-4">
              {moments.map((moment) => (
                <li
                  key={moment}
                  className="border-l-2 border-pitch-400/70 pl-4 text-base leading-7 text-mist"
                >
                  {moment}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-24 pt-10 sm:pb-32 sm:pt-20">
        <Reveal className="border-y border-white/10 py-14 text-center sm:py-20">
          <p className="font-sport text-xs text-pitch-300">
            One summer. One feeling.
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl font-display text-5xl text-chalk sm:text-7xl">
            We are here for the goosebumps.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-mist">
            If 2026 becomes the tournament you never stop talking about, we want
            what you wore to feel like part of the story.
          </p>
          <div className="mt-9 flex justify-center">
            <ButtonLink href="/shop" variant="gold" size="lg">
              Find your colors
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
