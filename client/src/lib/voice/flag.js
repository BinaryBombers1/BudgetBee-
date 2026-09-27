export function speechSupported() {
  return (
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function voiceEnabled() {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("cc_voice") === "0") return false;
  } catch {
    /* blocked storage: ignore, use capability check */
  }
  return speechSupported();
}
