# Voice — Phrase Checklist & Manual Test Matrix

Repeatable gate for the voice feature (plan: [06-voice-feature-plan.md](./06-voice-feature-plan.md)).
The 45 golden phrases below are **asserted automatically** by the Vitest suite — they are
the contract for the trilingual parser.

## Automated gates

```bash
# parser unit tests (45 golden phrases + routing) — run from client/
npm test

# DOM smoke: mic renders, mic tap recovers gracefully, lang chip, flag-off,
# dashboard read-aloud, chat mic + mute toggle — both servers must be up
python e2e/run_e2e.py --only login,voice

# full client gate
npm run lint && npm run build     # stop next dev first (shared .next/)
```

Rollback: `localStorage.cc_voice = "0"` hides every mic/speaker instantly (no redeploy).

## 45 golden phrases (15 per language)

### English (15)

| # | Phrase | Amount | Category | Type |
|---|--------|--------|----------|------|
| 1 | `120 taka for lunch` | 120 | Food | expense |
| 2 | `record 120 expense for dinner` | 120 | Food | expense |
| 3 | `I spent 500 on the bus` | 500 | Transport | expense |
| 4 | `add 350 taka for coffee` | 350 | Food | expense |
| 5 | `one hundred twenty taka for books` | 120 | Academics | expense |
| 6 | `50 tk recharge` | 50 | Subscriptions | expense |
| 7 | `spent 75 on snacks` | 75 | Food | expense |
| 8 | `250 for movie ticket` | 250 | Entertainment | expense |
| 9 | `paid 1000 rent` | 1000 | Hostel/Rent | expense |
| 10 | `groceries 850 taka` | 850 | Food | expense |
| 11 | `20 taka rickshaw` | 20 | Transport | expense |
| 12 | `150 for printing` | 150 | Academics | expense |
| 13 | `spent two hundred on food` | 200 | Food | expense |
| 14 | `give 300 donation` | 300 | Miscellaneous | expense |
| 15 | `I got 5000 as allowance` | 5000 | Allowance | income |

### Bangla (15)

| # | Phrase | Amount | Category | Type |
|---|--------|--------|----------|------|
| 1 | `১২০ টাকা রাতের খাবারের জন্য` | 120 | Food | expense |
| 2 | `খাবারে ৫০০ টাকা খরচ` | 500 | Food | expense |
| 3 | `একশ টাকা বাস ভাড়া` | 100 | Transport | expense |
| 4 | `রিকশায় ২০ টাকা` | 20 | Transport | expense |
| 5 | `চা ৩০ টাকা` | 30 | Food | expense |
| 6 | `২০০ টাকা রিচার্জ` | 200 | Subscriptions | expense |
| 7 | `বাজারে ৮০০ টাকা` | 800 | Food | expense |
| 8 | `১০০০ টাকা মাসিক ভাড়া` | 1000 | Hostel/Rent | expense |
| 9 | `প্রিন্ট কপি ৫০ টাকা` | 50 | Academics | expense |
| 10 | `কফি ৬০ টাকা` | 60 | Food | expense |
| 11 | `১৫০ টাকা বই` | 150 | Academics | expense |
| 12 | `দুইশ টাকা রিচার্জ` | 200 | Subscriptions | expense |
| 13 | `রেস্টুরেন্টে ২৫০ টাকা` | 250 | Food | expense |
| 14 | `৯০ টাকা সিনেমা` | 90 | Entertainment | expense |
| 15 | `পকেট মানি ৩০০০ টাকা` | 3000 | Allowance | income |

### Urdu / Hindi (15)

| # | Phrase | Amount | Category | Type |
|---|--------|--------|----------|------|
| 1 | `१२० रुपये खाने के लिए` | 120 | Food | expense |
| 2 | `एक सौ बीस टका दोपहर के लिए` | 120 | Food | expense |
| 3 | `बस का किराया पचास रुपये` | 50 | Transport | expense |
| 4 | `चाय 25 रुपये` | 25 | Food | expense |
| 5 | `रिचार्ज के लिए 100 रुपये` | 100 | Subscriptions | expense |
| 6 | `100 rupay khane pe` | 100 | Food | expense |
| 7 | `barah sau taka for dinner` | 1200 | Food | expense |
| 8 | `auto ka kharcha 80` | 80 | Transport | expense |
| 9 | `kitab 150 rupees` | 150 | Academics | expense |
| 10 | `۱۲۰ روپیہ کھانے کے لیے` | 120 | Food | expense |
| 11 | `chai 25 taka` | 25 | Food | expense |
| 12 | `movie 250` | 250 | Entertainment | expense |
| 13 | `hostel ka kiraya 2000` | 2000 | Hostel/Rent | expense |
| 14 | `ek hazaar taka books` | 1000 | Academics | expense |
| 15 | `5000 scholarship mila` | 5000 | Scholarship | income |

## Intent routing cases

| Phrase | Expected route | Why |
|--------|----------------|-----|
| `how much can i spend today` / `aaj kitna kharch…` / `আজ কত খরচ করতে পারি` | **dailyburn → BudgetBee chat** | daily-burn patterns fire before entry |
| `should i buy a laptop for 40000` | **chat** | purchase question wins over the amount |
| `why what are you doing` / `hello` / `কি করছো?` | **chat (smalltalk recovery)** | no amount + conversational |
| `dinner` (no amount) | **local recovery** | category word only → *"I heard: …"* + editable field |
| `asdfgh` | **local recovery** | gibberish → never a red error |

Recovery rules: chat route gets a spoken reply + one suggestion chip
(`Try: record 120 taka for dinner` / বলুন: রাতের খাবারে ১২০ টাকা / کہیں: کھانے میں 120 روپیہ),
**one suggestion round max**, then focus the text field. Chat unreachable → identical local recovery.

## Manual browser matrix (half a day)

Surfaces: **F1** entry mic (`/transactions/new`), **F1r** recovery, **F2** chat mic + spoken
reply, **F3** dashboard read-aloud.

| Check | Chrome desktop | Android Chrome | Edge | Safari | Firefox |
|---|---|---|---|---|---|
| 3-way chip switches EN · বাংলা · اردو | ☐ | ☐ | ☐ | ☐ | mic hidden ✓ |
| EN phrase → chips fill → Confirm saves | ☐ | ☐ | ☐ | ☐ | n/a |
| Bangla phrase (১২০ টাকা রাতের খাবারের জন্য) | ☐ | ☐ | ☐ | ☐ | n/a |
| Urdu/Hindi phrase (barah sau taka for dinner) | ☐ | ☐ | ☐ | ☐ | n/a |
| Off-topic speech → BudgetBee reply **spoken** + chip | ☐ | ☐ | ☐ | ☐ | n/a |
| Gibberish → "I heard: …" editable, no red error | ☐ | ☐ | ☐ | ☐ | n/a |
| F2: chat mic sends, reply spoken, mute toggles | ☐ | ☐ | ☐ | ☐ | n/a |
| F2: tap anywhere **interrupts** speech | ☐ | ☐ | ☐ | ☐ | n/a |
| F3: dashboard speaker reads snapshot | ☐ | ☐ | ☐ | ☐ | n/a |
| Permission denied → friendly banner, no loop | ☐ | ☐ | ☐ | ☐ | n/a |
| `cc_voice=0` → all voice UI gone | ☐ | ☐ | ☐ | ☐ | ☐ |

Notes:
- Chrome/Edge ASR is cloud-based (needs internet) — this is disclosed in the mic button's
  tooltip; **audio never reaches the Campus Coin server**.
- Safari exposes partial ASR — verify the graceful paths (banner + text fallback).
- Firefox has no `SpeechRecognition` → mic buttons never mount (progressive enhancement).

## What is *not* tested automatically

Speech itself (mic audio → ASR) can't run headless — the E2E phase proves the UI state
machine (listening → recovery banner → idle) never crashes; the table above is the
speak-it-yourself pass for the defense demo.
