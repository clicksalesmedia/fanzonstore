import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  rating,
  reviews,
  className,
}: {
  rating: number;
  reviews: number;
  className?: string;
}) {
  const rounded = Math.round(rating);

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      aria-label={`Rated ${rating} out of 5 from ${reviews} reviews`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < rounded
                ? "fill-gold-400 text-gold-400"
                : "fill-transparent text-white/20"
            )}
          />
        ))}
      </div>
      <span className="font-sport text-xs tracking-wide text-mist">
        {rating.toFixed(1)}
        <span className="text-white/30"> ({reviews})</span>
      </span>
    </div>
  );
}
