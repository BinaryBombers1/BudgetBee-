"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useVoiceTts } from "@/hooks/useVoiceTts";
import { getStoredLang, LOCALES } from "@/lib/voice/lang";

export function SpeakButton({ text, label = "Read aloud", className }) {
  const { speaking, say, stop } = useVoiceTts();
  return (
    <button
      type="button"
      aria-label={speaking ? `Stop ${label}` : label}
      title={label}
      onClick={() => (speaking ? stop() : say(text, LOCALES[getStoredLang()]))}
      className={
        className ||
        "rounded-lg border border-zinc-300 p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }
    >
      {speaking ? (
        <VolumeX className="h-4 w-4 animate-pulse text-rose-500" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}
