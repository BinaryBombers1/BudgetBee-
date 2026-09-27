export const LOCALES = { en: "en-US", bn: "bn-BD", ur: "ur-PK" };

export const LANGS = [
  {
    code: "en",
    label: "EN",
    start: "Start voice entry",
    stop: "Stop listening",
    chatStart: "Start voice input",
    chatStop: "Stop voice input",
  },
  {
    code: "bn",
    label: "বাংলা",
    start: "ভয়েস এন্ট্রি শুরু করুন",
    stop: "শোনা বন্ধ করুন",
    chatStart: "ভয়েস ইনপুট শুরু করুন",
    chatStop: "ভয়েস ইনপুট বন্ধ করুন",
  },
  {
    code: "ur",
    label: "اردو",
    start: "وائس اینٹری شروع کریں",
    stop: "سننا بند کریں",
    chatStart: "وائس انپٹ شروع کریں",
    chatStop: "وائس انپٹ بند کریں",
  },
];

export function langMeta(code) {
  return LANGS.find((l) => l.code === code) || LANGS[0];
}

export const PRIVACY_NOTE =
  "Speech is processed by your browser's built-in recognizer — audio never reaches our server";

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
