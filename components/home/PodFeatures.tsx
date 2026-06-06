import { Users, Flame, Palette, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const features = [
  {
    icon: Users,
    title: "You belong here",
    blurb:
      "Millions will feel it at once. When you pull this on, you're not watching from the outside — you're one of us.",
  },
  {
    icon: Flame,
    title: "Wear the feeling",
    blurb:
      "The roar. The heartbreak. The last-minute winner. Carry the emotion of the summer long after the whistle.",
  },
  {
    icon: Palette,
    title: "Your colors, your story",
    blurb:
      "Show up as exactly who you are — loud, proud, unmistakable. Everyone should know which side your heart is on.",
  },
  {
    icon: Star,
    title: "Memories you can hold",
    blurb:
      "Years from now this is the piece you reach for and remember exactly where you were. Some moments deserve to last.",
  },
];

export function PodFeatures() {
  return (
    <section id="why" className="container-page scroll-mt-24 py-14 md:py-28">
      <Reveal className="mb-8 max-w-2xl md:mb-12">
        <p className="font-sport text-xs text-pitch-300">More than merch</p>
        <h2 className="font-display mt-3 text-4xl text-chalk sm:text-5xl">
          This is how it feels to belong
        </h2>
      </Reveal>

      <Reveal
        stagger
        className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
      >
        {features.map(({ icon: Icon, title, blurb }) => (
          <div
            key={title}
            className="glass flex flex-col gap-3 rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 sm:gap-4 sm:p-6"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-pitch-400/30 bg-pitch-400/10 text-pitch-300 sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-lg text-chalk sm:text-xl">{title}</h3>
              <p className="mt-2 text-sm text-mist">{blurb}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
