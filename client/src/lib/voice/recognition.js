const ERROR_MESSAGES = {
  "not-allowed": "Mic blocked — allow the microphone for this site, then try again.",
  "service-not-allowed": "Mic blocked — allow the microphone for this site, then try again.",
  network: "Voice needs internet — type it instead.",
  "audio-capture": "No microphone found on this device.",
  "no-speech": "Didn't catch that.",
};

const QUIET_MS = 6000;
const SILENCE_MS = 1500;

export function createRecognition({ lang, onInterim, onFinal, onError }) {
  const SR =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  let rec = null;
  let quietTimer = null;
  let silenceTimer = null;
  let finals = [];
  let interim = "";
  let canceled = false;
  let hadError = false;

  function clearTimers() {
    clearTimeout(quietTimer);
    clearTimeout(silenceTimer);
    quietTimer = null;
    silenceTimer = null;
  }

  function transcript() {
    return [...finals, interim]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  }

  function armQuiet() {
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => stop(), QUIET_MS);
  }

  function armSilence() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => stop(), SILENCE_MS);
  }

  function stop() {
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  }

  return {
    supported: !!SR,

    start() {
      if (!SR) return false;
      rec = new SR();
      rec.lang = lang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      finals = [];
      interim = "";
      canceled = false;
      hadError = false;
      armQuiet();

      rec.onresult = (event) => {
        clearTimeout(quietTimer);
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const r = event.results[i];
          const text = (r[0] && r[0].transcript) || "";
          if (r.isFinal) finals.push(text);
          else interim = text;
        }
        onInterim?.(transcript());
        armSilence();
      };

      rec.onerror = (event) => {
        if (event.error === "aborted") return;
        hadError = true;
        onError?.(ERROR_MESSAGES[event.error] || "Voice didn't work — type it instead.", event.error);
        if (event.error === "no-speech" || event.error === "network") stop();
      };

      rec.onend = () => {
        clearTimers();
        const wasCanceled = canceled;
        const final = transcript();
        rec = null;
        canceled = false;
        if (!wasCanceled && !final && !hadError) {
          onError?.(ERROR_MESSAGES["no-speech"], "empty");
        }
        onFinal?.(wasCanceled ? null : final);
      };

      try {
        rec.start();
      } catch {
        rec = null;
        onError?.("Couldn't start the microphone — check if it's in use.", "start");
        onFinal?.(null);
        return false;
      }
      return true;
    },

    stop,

    cancel() {
      if (!rec) {
        onFinal?.(null);
        return;
      }
      canceled = true;
      try {
        rec.abort();
      } catch {
        /* already gone */
      }
    },
  };
}
