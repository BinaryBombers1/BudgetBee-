"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRecognition } from "@/lib/voice/recognition";

export function useVoiceRecognition({ lang, onFinal }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const handleRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const start = useCallback(() => {
    if (handleRef.current) return false;
    setError(null);
    setInterim("");
    const handle = createRecognition({
      lang,
      onInterim: (text) => setInterim(text),
      onError: (msg) => setError(msg),
      onFinal: (text) => {
        handleRef.current = null;
        setListening(false);
        setInterim("");
        onFinalRef.current?.(text);
      },
    });
    if (!handle.supported) {
      setError("Voice input isn't supported in this browser.");
      return false;
    }
    handleRef.current = handle;
    setListening(true);
    handle.start();
    return true;
  }, [lang]);

  const stop = useCallback(() => handleRef.current?.stop(), []);
  const cancel = useCallback(() => handleRef.current?.cancel(), []);
  const dismissError = useCallback(() => setError(null), []);

  useEffect(
    () => () => {
      handleRef.current?.cancel();
    },
    []
  );

  return { listening, interim, error, dismissError, start, stop, cancel };
}
