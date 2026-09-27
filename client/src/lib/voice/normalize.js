const DIGIT_BLOCKS = [
  [0x0966, 0x096f],
  [0x09e6, 0x09ef],
  [0x06f0, 0x06f9],
  [0x0660, 0x0669],
];

export function normalizeDigits(text) {
  return String(text ?? "").replace(
    /[\u0966-\u096f\u09e6-\u09ef\u06f0-\u06f9\u0660-\u0669]/g,
    (ch) => {
      const code = ch.codePointAt(0);
      for (const [start, end] of DIGIT_BLOCKS) {
        if (code >= start && code <= end) return String(code - start);
      }
      return ch;
    }
  );
}

export function stripThousands(text) {
  return String(text).replace(/(\d+(?:,\d+)+)/g, (m) => m.replace(/,/g, ""));
}

export function tokenize(text) {
  return String(text ?? "")
    .split(/[\s,.;:!?"'()[\]{}…]+/)
    .filter(Boolean);
}

const NUMBER_WORDS = {
  zero: { k: "add", v: 0 },
  one: { k: "add", v: 1 },
  two: { k: "add", v: 2 },
  three: { k: "add", v: 3 },
  four: { k: "add", v: 4 },
  five: { k: "add", v: 5 },
  six: { k: "add", v: 6 },
  seven: { k: "add", v: 7 },
  eight: { k: "add", v: 8 },
  nine: { k: "add", v: 9 },
  ten: { k: "add", v: 10 },
  eleven: { k: "add", v: 11 },
  twelve: { k: "add", v: 12 },
  thirteen: { k: "add", v: 13 },
  fourteen: { k: "add", v: 14 },
  fifteen: { k: "add", v: 15 },
  sixteen: { k: "add", v: 16 },
  seventeen: { k: "add", v: 17 },
  eighteen: { k: "add", v: 18 },
  nineteen: { k: "add", v: 19 },
  twenty: { k: "add", v: 20 },
  thirty: { k: "add", v: 30 },
  forty: { k: "add", v: 40 },
  fifty: { k: "add", v: 50 },
  sixty: { k: "add", v: 60 },
  seventy: { k: "add", v: 70 },
  eighty: { k: "add", v: 80 },
  ninety: { k: "add", v: 90 },
  hundred: { k: "mul", v: 100 },
  thousand: { k: "big", v: 1000 },
  million: { k: "big", v: 1000000 },

  ek: { k: "add", v: 1 },
  do: { k: "add", v: 2 },
  teen: { k: "add", v: 3 },
  char: { k: "add", v: 4 },
  panch: { k: "add", v: 5 },
  paanch: { k: "add", v: 5 },
  chhe: { k: "add", v: 6 },
  saat: { k: "add", v: 7 },
  aath: { k: "add", v: 8 },
  nau: { k: "add", v: 9 },
  das: { k: "add", v: 10 },
  barah: { k: "add", v: 12 },
  bees: { k: "add", v: 20 },
  tees: { k: "add", v: 30 },
  chalis: { k: "add", v: 40 },
  panchas: { k: "add", v: 50 },
  pachas: { k: "add", v: 50 },
  pachis: { k: "add", v: 25 },
  saath: { k: "add", v: 60 },
  sattar: { k: "add", v: 70 },
  assi: { k: "add", v: 80 },
  nabbe: { k: "add", v: 90 },
  sau: { k: "mul", v: 100 },
  hazaar: { k: "big", v: 1000 },

  dui: { k: "add", v: 2 },
  tin: { k: "add", v: 3 },
  chhoy: { k: "add", v: 6 },
  sat: { k: "add", v: 7 },
  aat: { k: "add", v: 8 },
  noy: { k: "add", v: 9 },
  dosh: { k: "add", v: 10 },
  bish: { k: "add", v: 20 },
  vish: { k: "add", v: 20 },
  trish: { k: "add", v: 30 },
  chollish: { k: "add", v: 40 },
  panchash: { k: "add", v: 50 },
  shoit: { k: "add", v: 60 },
  shattor: { k: "add", v: 70 },
  asshi: { k: "add", v: 80 },
  nobboi: { k: "add", v: 90 },
  eksho: { k: "add", v: 100 },
  hajar: { k: "big", v: 1000 },

  "एक": { k: "add", v: 1 },
  "दो": { k: "add", v: 2 },
  "तीन": { k: "add", v: 3 },
  "चार": { k: "add", v: 4 },
  "पाँच": { k: "add", v: 5 },
  "पांच": { k: "add", v: 5 },
  "छह": { k: "add", v: 6 },
  "सात": { k: "add", v: 7 },
  "आठ": { k: "add", v: 8 },
  "नौ": { k: "add", v: 9 },
  "दस": { k: "add", v: 10 },
  "बारह": { k: "add", v: 12 },
  "बीस": { k: "add", v: 20 },
  "पच्चीस": { k: "add", v: 25 },
  "पचास": { k: "add", v: 50 },
  "सौ": { k: "mul", v: 100 },
  "हज़ार": { k: "big", v: 1000 },
  "हजार": { k: "big", v: 1000 },

  "এক": { k: "add", v: 1 },
  "দুই": { k: "add", v: 2 },
  "তিন": { k: "add", v: 3 },
  "চার": { k: "add", v: 4 },
  "পাঁচ": { k: "add", v: 5 },
  "ছয়": { k: "add", v: 6 },
  "সাত": { k: "add", v: 7 },
  "আট": { k: "add", v: 8 },
  "নয়": { k: "add", v: 9 },
  "দশ": { k: "add", v: 10 },
  "বিশ": { k: "add", v: 20 },
  "ত্রিশ": { k: "add", v: 30 },
  "চল্লিশ": { k: "add", v: 40 },
  "পঞ্চাশ": { k: "add", v: 50 },
  "ষাট": { k: "add", v: 60 },
  "সত্তর": { k: "add", v: 70 },
  "আশি": { k: "add", v: 80 },
  "নব্বই": { k: "add", v: 90 },
  "একশ": { k: "add", v: 100 },
  "দুইশ": { k: "add", v: 200 },
  "পাঁচশ": { k: "add", v: 500 },
  "হাজার": { k: "big", v: 1000 },
};

export function isNumberWord(token) {
  return !!NUMBER_WORDS[String(token ?? "").toLowerCase()];
}

export function wordsToNumber(tokens) {
  let total = 0;
  let current = 0;
  let used = 0;
  for (const token of tokens) {
    const w = NUMBER_WORDS[String(token).toLowerCase()];
    if (!w) break;
    used += 1;
    if (w.k === "mul") current = (current || 1) * w.v;
    else if (w.k === "big") {
      total += (current || 1) * w.v;
      current = 0;
    } else current += w.v;
  }
  if (used === 0) return { value: null, used: 0 };
  return { value: total + current, used };
}

export function extractAmount(rawText) {
  const text = stripThousands(normalizeDigits(rawText));
  const digitMatch = text.match(/\d+(?:[.,]\d+)?/);
  if (digitMatch) {
    const amount = parseFloat(digitMatch[0].replace(",", "."));
    if (Number.isFinite(amount)) {
      const cleaned = (
        text.slice(0, digitMatch.index) +
        " " +
        text.slice(digitMatch.index + digitMatch[0].length)
      )
        .replace(/\s+/g, " ")
        .trim();
      return { amount, cleaned, matched: digitMatch[0] };
    }
  }
  const tokens = tokenize(text);
  for (let i = 0; i < tokens.length; i += 1) {
    if (isNumberWord(tokens[i])) {
      const { value, used } = wordsToNumber(tokens.slice(i));
      if (value !== null && used > 0) {
        const rest = [...tokens.slice(0, i), ...tokens.slice(i + used)];
        return { amount: value, cleaned: rest.join(" "), matched: tokens.slice(i, i + used).join(" ") };
      }
    }
  }
  return { amount: null, cleaned: text, matched: null };
}
