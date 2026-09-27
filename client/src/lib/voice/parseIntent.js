import { parseEntry } from "./parseEntry.js";
import { DAILY_BURN, GREETINGS, PURCHASE, QUESTION_PATTERNS } from "./lexicon.js";
import { normalizeDigits } from "./normalize.js";

function hit(patterns, text) {
  return patterns.some((p) =>
    p instanceof RegExp ? p.test(text) : text.includes(p)
  );
}

export function parseIntent(raw) {
  const text = normalizeDigits(raw)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (hit(DAILY_BURN, text)) return { intent: "dailyburn" };
  if (hit(PURCHASE, text)) return { intent: "chat" };
  if (text.includes("?")) return { intent: "chat" };
  if (hit(QUESTION_PATTERNS, text)) return { intent: "chat" };
  const entry = parseEntry(raw);
  if (entry.ok) return { intent: "entry", entry };
  if (hit(GREETINGS, text)) return { intent: "chat" };
  return { intent: "unknown", entry };
}
