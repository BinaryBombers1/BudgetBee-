import { api } from "@/lib/api";

const NEURAL_TIMEOUT_MS = 8000;

export function ttsAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let session = 0;
let currentAudio = null;

function stopNeural() {
  if (!currentAudio) return;
  try {
    currentAudio.pause();
    currentAudio.removeAttribute("src");
    currentAudio.load();
  } catch {
    /* already detached */
  }
  currentAudio = null;
}

export function stopSpeaking() {
  session += 1;
  stopNeural();
  if (ttsAvailable()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* nothing queued */
    }
  }
}

/* Local browser voices vary wildly — prefer the good ones when the
   neural engine isn't available (Google/online/neural > plain local). */
function pickVoice(voices, locale) {
  const prefix = String(locale).slice(0, 2).toLowerCase();
  const matching = voices.filter((v) =>
    String(v.lang || "")
      .replace("_", "-")
      .toLowerCase()
      .startsWith(prefix)
  );
  if (!matching.length) return null;
  const score = (v) => {
    const n = String(v.name || "").toLowerCase();
    if (n.includes("google")) return 3;
    if (n.includes("neural") || n.includes("natural")) return 2;
    if (!v.localService) return 1;
    return 0;
  };
  return matching.reduce((best, v) => (score(v) > score(best) ? v : best));
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("tts-timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/* Server-side neural voice (human quality). Returns true if it played. */
async function playNeural(text, locale, my) {
  const res = await withTimeout(api.post("/voice/tts", { text, locale }), NEURAL_TIMEOUT_MS);
  if (my !== session) return false;
  const b64 = res?.data?.audio;
  if (!b64) return false;

  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: res.data.mime || "audio/mpeg" }));
  const audio = new Audio(url);
  currentAudio = audio;
  try {
    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onpause = resolve; /* stopSpeaking() pauses -> settle + clean up */
      audio.onerror = () => reject(new Error("audio-error"));
      audio.play().catch(reject);
    });
    return true;
  } catch {
    return false;
  } finally {
    if (currentAudio === audio) currentAudio = null;
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* already revoked */
    }
  }
}

/* Browser fallback (speechSynthesis). */
function playBrowser(text, locale, finish) {
  if (!ttsAvailable()) {
    finish();
    return false;
  }
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* nothing queued */
  }
  const utterance = new SpeechSynthesisUtterance(String(text));
  const voice = pickVoice(window.speechSynthesis.getVoices(), locale);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = locale;
  }
  utterance.rate = 1;
  utterance.onend = finish;
  utterance.onerror = finish;
  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    finish();
    return false;
  }
}

export function speak(text, locale, { onEnd } = {}) {
  if (!text) {
    onEnd?.();
    return false;
  }
  stopSpeaking();

  const my = session;
  let ended = false;
  const finish = () => {
    /* a stopped/replaced session must never report back */
    if (ended || my !== session) return;
    ended = true;
    removeInterrupt();
    onEnd?.();
  };

  /* any tap interrupts — but the click that started us must not cancel it */
  const onPointer = () => stopSpeaking();
  const interruptTimer = setTimeout(() => document.addEventListener("click", onPointer), 0);
  const removeInterrupt = () => {
    clearTimeout(interruptTimer);
    document.removeEventListener("click", onPointer);
  };

  (async () => {
    let ok = false;
    try {
      ok = await playNeural(text, locale, my);
    } catch {
      ok = false;
    }
    if (my !== session) return; /* stopped while fetching */
    if (ok) {
      finish();
      return;
    }
    playBrowser(text, locale, finish);
  })();

  return true;
}
