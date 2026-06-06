"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  }

  if (done) {
    return (
      <div className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-chalk">
        <CheckCircle2 className="size-5 shrink-0 text-pitch-400" aria-hidden="true" />
        <span>
          You&apos;re on the list. Fanzonstore drops land in your inbox first.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={cn(
          "h-11 flex-1 rounded-xl border border-ink-700 bg-ink-900/80 px-4 text-sm text-chalk",
          "placeholder:text-mist transition-colors duration-200",
          "focus:border-pitch-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400/60",
        )}
      />
      <Button type="submit" variant="primary" size="md" className="shrink-0">
        <Send className="size-4" aria-hidden="true" />
        Subscribe
      </Button>
    </form>
  );
}
