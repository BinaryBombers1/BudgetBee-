import { CATEGORIES, CURRENCY_WORDS, STOPWORDS } from "./lexicon.js";
import { extractAmount, normalizeDigits, tokenize } from "./normalize.js";

const NON_LATIN = /[^\x00-\x7F]/;

function keywordMatches(keyword, token) {
  if (token === keyword) return true;
  if (token.startsWith(keyword)) return true;
  if (keyword.length >= 3 && NON_LATIN.test(keyword) && token.includes(keyword)) return true;
  return false;
}

function lower(token) {
  return String(token).toLowerCase();
}

export function matchCategory(tokens) {
  const lowered = tokens.map(lower);
  const phrase = lowered.join(" ");
  let best = null;
  let bestScore = 0;
  for (const cat of CATEGORIES) {
    const keywords = [...new Set(cat.keywords.map(lower))];
    let score = 0;
    for (const kw of keywords) {
      let matched;
      if (kw.includes(" ")) {
        matched =
          phrase === kw ||
          phrase.startsWith(`${kw} `) ||
          phrase.includes(` ${kw} `) ||
          phrase.endsWith(` ${kw}`);
      } else {
        matched = lowered.some((token) => keywordMatches(kw, token));
      }
      if (matched) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return best;
}

export function parseEntry(raw) {
  const normalized = normalizeDigits(raw);
  const { amount, cleaned } = extractAmount(normalized);
  const tokens = tokenize(cleaned);
  const category = matchCategory(tokens);
  const note = tokens
    .filter((t) => !STOPWORDS.has(lower(t)) && !CURRENCY_WORDS.has(lower(t)))
    .join(" ");
  const hasAmount = Number.isFinite(amount) && amount > 0;
  return {
    ok: hasAmount,
    amount: hasAmount ? amount : null,
    category: category ? category.name : null,
    type: category && category.type === "income" ? "income" : "expense",
    note,
    raw: String(raw ?? "").trim(),
  };
}
