import { Asterisk } from "lucide-react";

const PHRASES = [
  "WEAR YOUR BELONGING",
  "FOR THE BELIEVERS",
  "THIS IS OUR HOUSE",
  "ONE SUMMER · ONE FEELING",
  "GOOSEBUMPS INCLUDED",
  "COLORS THAT MEAN SOMETHING",
];

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {PHRASES.map((phrase, i) => (
        <div key={i} className="flex items-center">
          <span className="font-display whitespace-nowrap px-6 text-2xl tracking-wide text-ink-950 sm:text-3xl">
            {phrase}
          </span>
          <Asterisk
            className="size-5 shrink-0 text-ink-900/70"
            strokeWidth={2.5}
          />
        </div>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative w-full overflow-hidden border-y border-pitch-600/40 bg-pitch-400 py-3 select-none">
      <div className="flex w-max animate-marquee">
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </div>
  );
}
