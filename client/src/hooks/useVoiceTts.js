"use client";

import { useCallback, useState } from "react";
import { speak, stopSpeaking, ttsAvailable } from "@/lib/voice/tts";

export function useVoiceTts() {
  const [speaking, setSpeaking] = useState(false);

  const say = useCallback((text, locale) => {
    if (!ttsAvailable() || !text) return false;
    const started = speak(text, locale, { onEnd: () => setSpeaking(false) });
    setSpeaking(started);
    return started;
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  return { speaking, say, stop, available: ttsAvailable() };
}
