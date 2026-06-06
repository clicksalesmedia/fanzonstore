"use client";

import { useFormStatus } from "react-dom";

export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
