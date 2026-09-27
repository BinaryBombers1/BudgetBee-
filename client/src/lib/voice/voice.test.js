import { describe, expect, it } from "vitest";
import { extractAmount, normalizeDigits, stripThousands, wordsToNumber } from "./normalize.js";
import { parseEntry } from "./parseEntry.js";
import { parseIntent } from "./parseIntent.js";

describe("normalizeDigits", () => {
  it("converts Devanagari digits", () => {
    expect(normalizeDigits("१२०")).toBe("120");
  });
  it("converts Bengali digits", () => {
    expect(normalizeDigits("১২০")).toBe("120");
  });
  it("converts Urdu/Eastern digits", () => {
    expect(normalizeDigits("۱۲۰")).toBe("120");
  });
  it("leaves ASCII and words alone", () => {
    expect(normalizeDigits("120 taka")).toBe("120 taka");
  });
  it("strips thousand separators", () => {
    expect(stripThousands("1,200 taka")).toBe("1200 taka");
  });
});

describe("number words", () => {
  it("English composition", () => {
    expect(wordsToNumber(["one", "hundred", "twenty"]).value).toBe(120);
  });
  it("Hindi/Urdu composition", () => {
    expect(wordsToNumber(["barah", "sau"]).value).toBe(1200);
    expect(wordsToNumber(["ek", "sau", "bees"]).value).toBe(120);
  });
  it("thousand scale", () => {
    expect(wordsToNumber(["do", "hazaar"]).value).toBe(2000);
    expect(wordsToNumber(["ek", "hazaar"]).value).toBe(1000);
  });
  it("Bengali combined forms", () => {
    expect(wordsToNumber(["একশ"]).value).toBe(100);
    expect(wordsToNumber(["দুইশ"]).value).toBe(200);
    expect(wordsToNumber(["পাঁচশ"]).value).toBe(500);
  });
  it("extractAmount prefers digits over words", () => {
    expect(extractAmount("50 sau taka").amount).toBe(50);
  });
});

describe("EN golden phrases (15)", () => {
  const cases = [
    ["120 taka for lunch", 120, "Food", "expense"],
    ["record 120 expense for dinner", 120, "Food", "expense"],
    ["I spent 500 on the bus", 500, "Transport", "expense"],
    ["add 350 taka for coffee", 350, "Food", "expense"],
    ["one hundred twenty taka for books", 120, "Academics", "expense"],
    ["50 tk recharge", 50, "Subscriptions", "expense"],
    ["spent 75 on snacks", 75, "Food", "expense"],
    ["250 for movie ticket", 250, "Entertainment", "expense"],
    ["paid 1000 rent", 1000, "Hostel/Rent", "expense"],
    ["groceries 850 taka", 850, "Food", "expense"],
    ["20 taka rickshaw", 20, "Transport", "expense"],
    ["150 for printing", 150, "Academics", "expense"],
    ["spent two hundred on food", 200, "Food", "expense"],
    ["give 300 donation", 300, "Miscellaneous", "expense"],
    ["I got 5000 as allowance", 5000, "Allowance", "income"],
  ];
  for (const [phrase, amount, category, type] of cases) {
    it(`"${phrase}"`, () => {
      const r = parseIntent(phrase);
      expect(r.intent).toBe("entry");
      expect(r.entry.ok).toBe(true);
      expect(r.entry.amount).toBe(amount);
      expect(r.entry.category).toBe(category);
      expect(r.entry.type).toBe(type);
    });
  }
  it('"record 120 expense for dinner" keeps a clean note', () => {
    expect(parseEntry("record 120 expense for dinner").note).toBe("dinner");
  });
});

describe("Bangla golden phrases (15)", () => {
  const cases = [
    ["১২০ টাকা রাতের খাবারের জন্য", 120, "Food", "expense"],
    ["খাবারে ৫০০ টাকা খরচ", 500, "Food", "expense"],
    ["একশ টাকা বাস ভাড়া", 100, "Transport", "expense"],
    ["রিকশায় ২০ টাকা", 20, "Transport", "expense"],
    ["চা ৩০ টাকা", 30, "Food", "expense"],
    ["২০০ টাকা রিচার্জ", 200, "Subscriptions", "expense"],
    ["বাজারে ৮০০ টাকা", 800, "Food", "expense"],
    ["১০০০ টাকা মাসিক ভাড়া", 1000, "Hostel/Rent", "expense"],
    ["প্রিন্ট কপি ৫০ টাকা", 50, "Academics", "expense"],
    ["কফি ৬০ টাকা", 60, "Food", "expense"],
    ["১৫০ টাকা বই", 150, "Academics", "expense"],
    ["দুইশ টাকা রিচার্জ", 200, "Subscriptions", "expense"],
    ["রেস্টুরেন্টে ২৫০ টাকা", 250, "Food", "expense"],
    ["৯০ টাকা সিনেমা", 90, "Entertainment", "expense"],
    ["পকেট মানি ৩০০০ টাকা", 3000, "Allowance", "income"],
  ];
  for (const [phrase, amount, category, type] of cases) {
    it(`"${phrase}"`, () => {
      const r = parseIntent(phrase);
      expect(r.intent).toBe("entry");
      expect(r.entry.ok).toBe(true);
      expect(r.entry.amount).toBe(amount);
      expect(r.entry.category).toBe(category);
      expect(r.entry.type).toBe(type);
    });
  }
});

describe("Urdu/Hindi golden phrases (15)", () => {
  const cases = [
    ["१२० रुपये खाने के लिए", 120, "Food", "expense"],
    ["एक सौ बीस टका दोपहर के लिए", 120, "Food", "expense"],
    ["बस का किराया पचास रुपये", 50, "Transport", "expense"],
    ["चाय 25 रुपये", 25, "Food", "expense"],
    ["रिचार्ज के लिए 100 रुपये", 100, "Subscriptions", "expense"],
    ["100 rupay khane pe", 100, "Food", "expense"],
    ["barah sau taka for dinner", 1200, "Food", "expense"],
    ["auto ka kharcha 80", 80, "Transport", "expense"],
    ["kitab 150 rupees", 150, "Academics", "expense"],
    ["۱۲۰ روپیہ کھانے کے لیے", 120, "Food", "expense"],
    ["chai 25 taka", 25, "Food", "expense"],
    ["movie 250", 250, "Entertainment", "expense"],
    ["hostel ka kiraya 2000", 2000, "Hostel/Rent", "expense"],
    ["ek hazaar taka books", 1000, "Academics", "expense"],
    ["5000 scholarship mila", 5000, "Scholarship", "income"],
  ];
  for (const [phrase, amount, category, type] of cases) {
    it(`"${phrase}"`, () => {
      const r = parseIntent(phrase);
      expect(r.intent).toBe("entry");
      expect(r.entry.ok).toBe(true);
      expect(r.entry.amount).toBe(amount);
      expect(r.entry.category).toBe(category);
      expect(r.entry.type).toBe(type);
    });
  }
});

describe("parseIntent routing", () => {
  it("daily burn (EN)", () => {
    expect(parseIntent("how much can i spend today").intent).toBe("dailyburn");
  });
  it("daily burn (Hindi/Roman)", () => {
    expect(parseIntent("aaj kitna kharch kar sakte ho").intent).toBe("dailyburn");
  });
  it("daily burn (Bangla)", () => {
    expect(parseIntent("আজ কত খরচ করতে পারি").intent).toBe("dailyburn");
  });
  it("purchase question with amount stays a chat", () => {
    expect(parseIntent("should i buy a laptop for 40000").intent).toBe("chat");
  });
  it("unclear speech routes to chat, not entry", () => {
    expect(parseIntent("why what are you doing").intent).toBe("chat");
  });
  it("greeting routes to chat", () => {
    expect(parseIntent("hello").intent).toBe("chat");
  });
  it("category word without amount is unknown (recovery path)", () => {
    expect(parseIntent("dinner").intent).toBe("unknown");
    expect(parseEntry("dinner").ok).toBe(false);
  });
  it("gibberish is unknown", () => {
    expect(parseIntent("asdfgh").intent).toBe("unknown");
  });
  it("unrelated blabber is unknown", () => {
    expect(parseIntent("purple elephant dancing").intent).toBe("unknown");
  });
});
