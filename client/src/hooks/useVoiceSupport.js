"use client";

import { useEffect, useState } from "react";
import { voiceEnabled } from "@/lib/voice/flag";

export function useVoiceSupport() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(voiceEnabled());
  }, []);
  return supported;
}
