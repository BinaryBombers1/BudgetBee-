export const CATEGORIES = [
  {
    name: "Food",
    type: "expense",
    keywords: [
      "food", "lunch", "dinner", "breakfast", "snack", "snacks", "meal", "eat",
      "grocery", "groceries", "supermarket", "bazar", "market", "restaurant",
      "chai", "tea", "coffee", "cafe", "latte", "canteen", "mess", "tiffin",
      "pizza", "burger", "biryani", "rice", "roti", "fish", "meat", "chicken",
      "vegetables", "milk", "khana", "khane", "khan", "khawa", "khowar",
      "khabar", "nashta", "khajna",
      "खान", "भोजन", "नाश्ता", "चाय", "कैफे", "कैंटीन", "दोपहर",
      "ক্যান্টিন", "খাবার", "ভাত", "খাওয়া", "নাস্তা", "চা", "কফি", "বাজার",
      "মার্কেট", "রেস্টুরেন্ট", "ভাত",
      "کھانا", "کھانے", "ناشتہ", "چائے", "دوپہر",
    ],
  },
  {
    name: "Transport",
    type: "expense",
    keywords: [
      "transport", "bus", "train", "metro", "auto", "rickshaw", "uber", "taxi",
      "cab", "fare", "travel", "commute", "petrol", "fuel", "cng", "savari",
      "rickshaw-wala",
      "বাস", "ট্রেন", "রিকশা", "অটো", "মেট্রো", "যাত্রা",
      "बस", "रिक्शा", "ऑटो", "सफर", "किराया",
      "سفر", "سواری", "رکشہ",
    ],
  },
  {
    name: "Hostel/Rent",
    type: "expense",
    keywords: [
      "hostel", "rent", "lodging", "dorm", "monthly", "basha", "kiraya",
      "kiraaya", "house rent",
      "ভাড়া", "হোস্টেল", "বাসা", "মাসিক",
      "किराया", "मकान", "हॉस्टल",
      "کرایہ", "مکان",
    ],
  },
  {
    name: "Academics",
    type: "expense",
    keywords: [
      "academic", "academics", "book", "books", "study", "tuition", "fee",
      "exam", "printing", "print", "photocopy", "stationery", "pen",
      "notebook", "assignment", "library", "kitab", "kitaab", "course",
      "বই", "প্রিন্ট", "কপি", "ক্লাস", "পড়া", "ফি", "পরীক্ষা",
      "किताब", "पढ़ाई", "फ़ीस", "प्रिन्ट", "परीक्षा",
      "کتاب", "فیس",
    ],
  },
  {
    name: "Subscriptions",
    type: "expense",
    keywords: [
      "subscription", "subscriptions", "netflix", "spotify", "recharge",
      "internet", "wifi", "data plan", "mobile plan",
      "রিচার্জ", "ইন্টারনেট", "ওয়াইফাই", "প্যাক",
      "रिचार्ज", "इंटरनेट", "वाईफाई",
      "ریچارج", "انٹرنیٹ",
    ],
  },
  {
    name: "Entertainment",
    type: "expense",
    keywords: [
      "movie", "movies", "cinema", "film", "game", "gaming", "concert",
      "show", "party", "match", "cricket", "fun",
      "সিনেমা", "মুভি", "খেলা", "কনসার্ট",
      "फ़िल्म", "मूवी", "खेल", "मनोरंजन",
      "فلم", "تفریح",
    ],
  },
  {
    name: "Miscellaneous",
    type: "expense",
    keywords: [
      "other", "misc", "donation", "zakat", "charity", "medicine",
      "doctor", "health", "laundry", "haircut", "gift money",
      "অন্যান্য", "দান", "ওষুধ", "চিকিৎসা",
      "अन्य", "दान", "दवाई", "इलाज",
      "دیگر", "صدقہ",
    ],
  },
  {
    name: "Allowance",
    type: "income",
    keywords: [
      "allowance", "pocket money", "monthly allowance", "stipend",
      "আলাউয়েন্স", "এলাউয়েন্স", "পকেট মানি", "ভাতা",
      "आलाउंस", "पॉकेट मनी", "भत्ता",
      "جیب خرچ",
    ],
  },
  {
    name: "Part-time Job",
    type: "income",
    keywords: [
      "part-time", "part time", "job", "salary", "work pay", "gig",
      "freelance", "tuition income",
      "চাকরি", "বেতন", "কাজ",
      "नौकरी", "तनख्वाह", "जॉब", "पार्ट टाइम",
      "نوکری",
    ],
  },
  {
    name: "Scholarship",
    type: "income",
    keywords: [
      "scholarship", "grant",
      "বৃত্তি", "স্কলারশিপ",
      "छात्रवृत्ति", "स्कॉलरशिप",
      "ضریبہ",
    ],
  },
  {
    name: "Gift",
    type: "income",
    keywords: ["gift", "bonus", "reward", "উপহার", "बोनस", "उपहार", "تحفہ"],
  },
  {
    name: "Other Income",
    type: "income",
    keywords: [
      "income", "refund", "cashback", "other income",
      "আয়", "রিফান্ড", "অন্যান্য আয়",
      "आय", "रिफंड",
      "آمدنی",
    ],
  },
];

export const CURRENCY_WORDS = new Set([
  "taka", "tk", "rupees", "rupee", "rs", "rupaye", "rupay", "bucks",
  "টাকা", "রুপি",
  "रुपये", "रुपया", "रुपए", "टका", "रूपये",
  "روپیہ", "تکا",
]);

export const STOPWORDS = new Set([
  "i", "a", "an", "the", "for", "on", "of", "to", "and", "my", "me",
  "please", "add", "record", "log", "spent", "spend", "expense", "expenses",
  "pay", "paid", "got", "receive", "received", "today", "some", "was", "is",
  "are", "be", "it", "that", "this", "with", "from", "at", "in", "just",
  "now", "again", "here",
  "ka", "ki", "ke", "liye", "pe", "mein", "karo", "kar", "diya", "kiya",
  "tha", "thi", "se", "ko", "ne", "wala", "kharcha", "kharche", "kitna",
  "wala", "ho", "gaya", "liya", "mila",
  "এর", "জন্য", "করে", "করা", "খরচ", "নিয়ে", "দিয়ে", "আজ", "আমি",
  "আমার", "পেয়েছি", "হয়", "করেছি", "নেওয়া",
]);

export const DAILY_BURN = [
  "how much can i spend",
  "can i spend",
  "spend today",
  "safe to spend",
  "left to spend",
  "kitna kharch",
  "kitna spend",
  "aaj kitna",
  "kitna kar sakte",
  "কত খরচ",
  "কতটা খরচ",
  "খরচ করতে পারি",
  "কত টাকা খারচ",
];

export const PURCHASE = [
  "should i buy",
  "can i buy",
  "shall i buy",
  "will i be able to buy",
  "afford",
  "worth it",
  "worth buying",
  "kharid",
  "khareed",
  "khareedna",
  "কিনতে পারি",
  "কিনবো",
  "কেনা উচিত",
  "খরিদ",
];

export const QUESTION_PATTERNS = [
  /\b(why|what|what's|whats|who|where|when|how|are you|tell me)\b/i,
  "kya kar",
  "kyun",
  "kyu ",
  "kaun ho",
  "কেন",
  "কি কর",
  "কী কর",
];

export const GREETINGS = [
  /\b(hi|hey|hello|salam|salam|assalam|assalamualaikum|namaste|hola|yo)\b/i,
  "আসসালাম",
  "হ্যালো",
  "নমস্কার",
  "সালাম",
];

export const SUGGESTION_EXAMPLES = {
  en: "Try: record 120 taka for dinner",
  bn: "বলুন: রাতের খাবারে ১২০ টাকা",
  ur: "کہیں: کھانے میں 120 روپیہ",
};
