export function ttsAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(voices, locale) {
  const prefix = String(locale).slice(0, 2).toLowerCase();
  const matching = voices.filter((v) =>
    String(v.lang || "")
      .replace("_", "-")
      .toLowerCase()
      .startsWith(prefix)
  );
  if (!matching.length) return null;
  return matching.find((v) => v.localService) || matching[0];
}

export function stopSpeaking() {
  if (!ttsAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* nothing queued */
  }
}

export function speak(text, locale, { onEnd } = {}) {
  if (!ttsAvailable() || !text) {
    onEnd?.();
    return false;
  }
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(String(text));
  const voice = pickVoice(window.speechSynthesis.getVoices(), locale);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = locale;
  }
  utterance.rate = 1;

  let interruptTimer = null;
  const onPointer = () => stopSpeaking();
  const cleanup = () => {
    clearTimeout(interruptTimer);
    document.removeEventListener("click", onPointer);
  };
  const finish = () => {
    cleanup();
    onEnd?.();
  };
  utterance.onend = finish;
  utterance.onerror = finish;

  // any tap interrupts — but the click that started us must not cancel it
  interruptTimer = setTimeout(() => document.addEventListener("click", onPointer), 0);

  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    finish();
    return false;
  }
  return true;
}
