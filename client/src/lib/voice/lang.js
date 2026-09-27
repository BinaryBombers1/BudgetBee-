export const LOCALES = { en: "en-US", bn: "bn-BD", ur: "ur-PK" };

export function getStoredLang() {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("cc_voice_lang");
    if (saved && LOCALES[saved]) return saved;
  } catch {
    /* storage blocked — default */
  }
  return "en";
}

export function setStoredLang(code) {
  if (typeof window === "undefined" || !LOCALES[code]) return;
  try {
    localStorage.setItem("cc_voice_lang", code);
  } catch {
    /* storage blocked — session-only */
  }
}
