# Campus Coin — Voice Feature Plan (EN + Urdu/Hindi)

> **Goal:** an extra "wow" layer on top of the completed SRS/EQ scope — voice makes Campus Coin *accessible*, not just impressive.
> **Golden rule:** additive only — new files behind a flag; the core app must keep working even if voice is turned off or reverted.

---

## 1. The vision (30-second pitch)

> "Two taps to log a expense becomes **one sentence**: *'120 taka for lunch'* — and BudgetBee doesn't just answer, it **speaks the verdict back** — in English, **Bangla**, or Urdu/Hindi. It's built on the browser's native Speech API, so it's free, private, and works on the phone already in the student's pocket — accessibility for hands-busy, low-typing, and motor-impaired users alike."

**Target languages (v1) — three primary languages:**
1. **English** (`en-US` / `en-GB`)
2. **Bengali / Bangla** (`bn-BD`) — digits ০-৯, keywords in Bangla script + Roman-Bangla
3. **Urdu / Hindi** — spoken Hindustani via `hi-IN` (+ `ur-PK` used automatically if the browser offers it)

The **UI stays English** (SRS is frozen) — only the **voice input/output layer** is trilingual. No screens get translated; nothing in the SRS scope moves.

**Handling unclear speech (required behavior):** if what the user says isn't a real command (*"why what are you doing"* instead of *"record 120 expense for dinner"*), we **never show an error** — it routes to BudgetBee chat (whose smalltalk layer already answers such messages), speaks the reply, and offers a suggestion chip with a correct example. Full flow in §5.1.

---

## 2. Feature set

| # | Feature | Wow moment | Backend change |
|---|---|---|---|
| **F1** | **Voice Quick-Entry** — mic on *New Transaction*: speak amount + what it was → chips fill amount/category/note → confirm | *"120 taka for lunch"* → ৳120 · Food · "lunch" prefilled | **None** (uses existing POST /transactions) |
| **F2** | **Voice BudgetBee** — mic in chat; BudgetBee *speaks* the answer back | *"Can I buy a laptop for 40,000?"* → hears *"Wait — you have 13,997 taka safe…"* | None for F2; optional 1-line prompt tweak (§7) so replies match the input language |
| **F3** | **Spoken Dashboard** — speaker button reads the daily brief | *"You can spend 450 taka today. Food is 80% used."* | None (reads existing dashboard state) |
| **F4** *(stretch)* | **Voice commands** — *"new transaction", "open budgets", "monthly report"* | Instant navigation from the same mic | None |

**Non-goals v1:** full UI translation, background listening/wake-word (needs always-on mic = privacy + battery no), offline ASR (browser limitation), voice biometrics.

---

## 3. Architecture — how it works

**All client-side.** Recognition (ASR) and synthesis (TTS) run in the browser; the server doesn't even know voice exists. That's what makes it safe to add post-SRS.

```
                    ┌─────────────────── CLIENT (all new files) ───────────────────┐
 Mic tap ──▶ SpeechRecognition ──▶ raw transcript (interim shown live)
              (lang: en-* | hi-IN)          │
                                            ▼
                                  ┌─ normalizer ─┐  Devanagari/Urdu digits → ASCII,
                                  │              │  "hazaar/sau/taka" → numbers
                                  └──────┬───────┘
                                         ▼
                                  intent parser (pure)
                    ┌───────────────┬────┴────────┬───────────────┐
                    ▼               ▼             ▼               ▼
              ENTRY intent     CHAT intent   DAILY-BURN      unrecognized
                    │               │             │                │
        form chips (amount,    POST /ai/chat   read dashboard   "Here's what
        category, note)        (existing API)  state (local)    I heard → edit"
                    │               │             │
              user confirms    response ──▶ speechSynthesis (TTS)
              POST /transactions            lang = input language
```

### New files only (safe surface)

```
client/src/lib/voice/
  recognition.js     # wrapper: lang, interim results, silence timeout, error mapping
  tts.js             # wrapper: voice selection per lang, rate, cancel-on-listen
  parseEntry.js      # transcript → {amount, category, note}   ← PURE
  parseIntent.js     # transcript → entry | chat | dailyburn | unknown  ← PURE
  lexicon.js         # trilingual keyword/number/currency tables  ← PURE
  normalize.js       # digit/script normalization (०→0, ۰→0, words→int) ← PURE
client/src/hooks/useVoiceRecognition.js
client/src/hooks/useVoiceTts.js
client/src/components/voice/MicButton.jsx   # states: idle/listening/busy/error
client/src/components/voice/VoiceWave.jsx   # animated wave (framer-motion)
client/src/components/voice/VoiceChips.jsx  # parsed amount/category/note preview
```

**Integration points (3 small, guarded edits):**
1. `transactions/new/page.js` — `<MicButton />` next to the amount field
2. `ChatWidget.jsx` — mic on the input row + speak-reply toggle
3. `dashboard/page.js` — speaker button on the "safe to spend" card

Each integration is wrapped in `voiceEnabled()` (§9) → if the flag is off, the component never mounts.

---

## 4. Handling Urdu/Hindi + English (the hard part, done right)

### 4.1 Recognition locale strategy
- Preference order: **explicit user pick → chosen chip's locale → browser default**.
- **UI:** one language chip beside the mic: **`EN | বাংলা | اردو`**. It sets `recognition.lang` **and** the TTS voice — no guesswork, no surprise language switches.
- Chrome's `hi-IN` model recognizes **spoken Hindustani** (Hindi & Urdu are mutually intelligible spoken); if a browser exposes `ur-PK`, we prefer it when the Urdu chip is active. `bn-BD` recognition is supported in Chrome/Edge; if a browser lacks it, the Bangla chip degrades to text input with a tooltip (feature still usable via the other two languages).

### 4.2 Script & number normalization (`normalize.js`)
Recognition output may arrive in **three shapes** — all must parse:

| Input form | Example | Rule |
|---|---|---|
| ASCII digits | `120 taka lunch` | pass-through |
| Devanagari digits | `१२० टका दोपहर का खाना` | `०-९` (U+0966…) → offset −0x0966 |
| **Bengali digits** | **`১২০ টাকা রাতের খাবার`** | **`০-৯` (U+09E6…) → offset −0x09E6** |
| Urdu (Eastern) digits | `۱۲۰ روپیہ` | `۰-۹` (U+06F0…) → offset −0x06F0 |
| Roman-Urdu / Banglish / Hinglish | `120 rupay khane pe` · `120 taka khowar pocche` | lexicon match (below) |
| Number words (multi-language) | `one hundred twenty` · `একশ বিশ` (ekosh bish) · `ek sau bees` · `barah sau` | word→int with hundred/thousand composition |

**Word-number support (v1):** en (one…twenty, hundred, thousand) + hi/ur common words (ek, do, teen, das, sau, hazaar + Devanagari/Urdu spellings) + **bn (ek, dui, tin, pach, dosh, ekosh, hajar + বাংলা script: এক, দুই, পাঁচ, দশ, একশ, হাজার)**. Unparsed amounts → **never guess**: show the raw transcript in an editable field (user fixes digits by hand — 2 keystrokes).

### 4.3 Category lexicon (`lexicon.js`) — trilingual + Roman forms
Keyword → category maps for the 12 system categories, in **English, Bangla script, Devanagari, Urdu script, and Roman forms (Banglish/Roman-Urdu/Hinglish)**:

| Category | Keywords (sample) |
|---|---|
| Food | lunch, dinner, food · **খাবার, ভাত, খাওয়া, রান্না** · खाना · کھانا · khana, khowar, nashta |
| Transport | bus, rickshaw, uber, fare · **রিকশা, বাস, ভাড়া** · सवारी · سفر · savari, auto |
| Mobile Recharge | recharge, balance, sim · **রিচার্জ, ব্যালেন্স** · रिचार्ज · بالانس |
| Cafe & Snacks | coffee, chai, latte, cafe · **চা, কফি, নাস্তা** · चाय · چائے · cha, cha-wa |
| … | (all 12 system + any custom category name is also matched — we reuse the AI-categorize keyword idea client-side) |

Priority: **exact amount+keyword > keyword > none** (leave category unset → user picks; never wrong-save).

### 4.4 Language of the *reply* (TTS + chat)
- TTS voice picked by the input language: `speechSynthesis.getVoices()` filtered by `lang.startsWith("hi")` / `"ur"` / `"en"` (async — listen for `voiceschanged`).
- BudgetBee replies: today the LLM answers roughly in the asker's language; we make it deterministic with **one optional server line** (§7): *"If the user writes in Urdu/Hindi, reply in the same language."* → then TTS speaks it back in the matching voice.
- `stripMarkdown` already runs server-side → TTS never reads asterisks.

---

## 5. UX design (next-level means *thoughtful*, not flashy)

### 5.1 Unclear / off-topic speech → conversational recovery (MANDATORY)

The mic is **one surface for commands and conversation** — nothing ever fails, errors, or goes silent:

```
                       transcript
                            │
            ┌───────────────▼───────────────┐
            │ parseEntry: amount found?      │
            └──────┬───────────────┬────────┘
                 YES               NO
                   │                │
                   ▼                ▼
          [F1 entry chips]   conversational? (greetings, questions,
                                  "why what are you doing")
                            ┌──────┴──────┐
                           YES            NO / gibberish
                            │               │
                            ▼               ▼
                  [F2 → existing       [LOCAL recovery]
                   /ai/chat — its       "I heard: '…'"
                   smalltalk layer      + example chip:
                   already answers      "Try: record 120 taka
                   this gracefully →    for dinner" (localized)
                   spoken reply]        + editable text field
```

**Rules:**
1. **"Why what are you doing"** (no amount, conversational) → routed to BudgetBee's **existing chat + smalltalk layer** (already handles greetings/off-topic/jokes) → the reply is **spoken aloud** in the input language, plus a suggestion chip: *"Try: record 120 taka for dinner"* — localized per language chip (EN/বাংলা/اردو examples).
2. **Genuine gibberish / empty transcript** → local recovery only: echo `I heard: "…"`, one example chip, hand the keyboard over. **Never a red error.**
3. **Max one suggestion round** → then focus the text input (no infinite loops, no frustration).
4. **Chat API unreachable** (offline) → identical local recovery — the safety net itself needs no network.
5. **Zero server changes** — stage-2 reuses `POST /api/v1/ai/chat` and the smalltalk answers already shipped.

### F1 Voice Quick-Entry states
```
[idle] ──tap──▶ [listening] wave animates + live interim transcript
                    │ silence 1.5s / tap stop
                    ▼
                 [parsing → chips:  ৳120 · 🍽 Food · "lunch" ]
                    │
        ┌───────────┴───────────┐
     [Confirm ✓]            [Edit ✎]  (chips editable; raw transcript stays visible)
        │
        ▼ existing submit → success toast + confetti (existing lib)
```
- **Always confirm — voice never auto-saves money actions.** (Accuracy + trust.)
- Aria-live announcements for each state; mic button has `aria-label` in all three languages; full keyboard path (Esc cancels, Enter confirms).
- Listening is **push-to-talk style**: one tap starts, auto-stops on 1.5 s silence or second tap.

### F2 Voice BudgetBee
Mic → transcript shown in bubble → send through **existing chat flow** → reply rendered as text **and** spoken (speaker toggle, default ON when voice was used). Tap anywhere → `speechSynthesis.cancel()` (interruption works — judges love interrupting the AI mid-sentence).
**Known browser quirk handled:** stop TTS *before* starting ASR and vice-versa (they fight over the audio channel).

### F3 Spoken Dashboard
One speaker icon on the safe-to-spend card reads: *"You can spend 450 taka today, with 5 days left. Food budget is 80 percent used."* — assembled from values already on screen (client-only template, not an LLM call → instant, works offline).

---

## 6. Failure & edge handling (what makes it "handled")

| Case | Behavior |
|---|---|
| Browser has no SpeechRecognition (Firefox, some WebViews) | **Mic hidden entirely** — progressive enhancement, UI unchanged |
| Mic permission denied | Toast with one-line fix ("allow microphone for this site") + button returns to idle — no crash, no re-prompt loop |
| No network (Chrome ASR is cloud-based) | Detection via error event → *"Voice needs internet — type it instead"* → text field focused |
| User speaks, nothing parseable | Show **"I heard: …"** editable text prefilled — user salvages instead of retyping |
| Wrong language picked | Chips show raw transcript → user re-taps with the other language chip (hint appears after a failed parse) |
| TTS voices not loaded / no matching voice | Reply shows as text only (silent degradation) |
| Double-tap / double-submit | Button disabled during parse+submit (existing idempotency kept) |
| Silence / ambient noise | 1.5 s silence auto-stop; if transcript empty → gentle *"Didn't catch that"* |
| Loud environment repeats | Confirm step is the safety net — a wrong save is impossible without a tap |
| Privacy question (judge!) | Recognition is browser-native (Chrome sends audio to Google's recognizer — we disclose it in a tooltip); **our server never receives audio, only the confirmed text** |

---

## 7. Server touchpoints (deliberately minimal)

1. **Optional, 1 line** in chat system prompts: *"Reply in the language the user wrote in (English/Urdu/Hindi)."* — makes F2's spoken reply language-perfect. Behind review; chat behavior for English users unchanged.
2. **No schema changes.** Optionally later: `user.voiceLang` preference (fits the existing profile fields pattern) — v1 keeps the choice in `localStorage`.

Nothing else on the server changes → **risk surface ≈ 0 for SRS features.**

---

## 8. Testing (and how this kills our "no unit tests" weakness)

Voice parsers are **pure functions by design** → they become our **first unit-test suite (Vitest)**:
- `normalize.test.js`: ASCII/Devanagari/Urdu digits, word-numbers ("barah sau" → 1200), mixed-script inputs
- `parseEntry.test.js`: **45 golden phrases (15 EN + 15 Bangla + 15 Urdu/Hindi, incl. Roman forms)** → expected `{amount, category, note}`
- `parseIntent.test.js`: entry vs chat vs daily-burn routing

**Judge story:** *"We added our first unit tests with the voice feature — precisely because we'd architected the logic as pure functions."*

**Manual matrix (half a day):** Chrome desktop + Android Chrome (primary targets), Edge, Safari (partial ASR — verify graceful paths), Firefox (verify mic hidden). **Trilingual** phrase checklist (45 phrases) checked into `docs/` for repeatable runs.

---

## 9. Safety & rollback (you asked for this explicitly)

1. **Flag:** `localStorage.cc_voice` (default: ON if capability detected). Flip off → all mic/speaker UI unmounts, app 100% back to normal. No redeploy needed.
2. **Isolation:** every feature lives in new files (`lib/voice/*`, `hooks/useVoice*`, `components/voice/*`); the 3 integration points are single guarded lines (`{voiceEnabled() && <MicButton/>}`).
3. **Git:** each day of work = one commit (`voice: parser+tests`, `voice: entry UX`, …) → `git revert <sha>` removes exactly that slice. Tag before starting: `git tag pre-voice`.
4. **SRS firewall:** no existing component is rewritten; transactions/chat/dashboard keep their current code paths (voice only *feeds* them).

**If we get stuck:** flag off (instant) → revert day-commits → core app untouched. The demo never depends on voice working in a hostile venue Wi-Fi (text path always one tap away).

---

## 10. Build plan (4–5 days, trilingual)

| Day | Deliverable | Gate |
|---|---|---|
| **D1** | `normalize` (ASCII/Devanagari/**Bangla**/Urdu digits, word-numbers ×3) + trilingual `lexicon` + `parseEntry` + `parseIntent` **with Vitest suite** | `npx vitest run` green (**45 golden phrases: 15 per language**) |
| **D2** | `recognition.js` + `useVoiceRecognition` + MicButton/Wave/Chips + **F1 wired into transactions/new** + **§5.1 recovery stage-1** (route to chat) | Manual: entry + "why what are you doing" recovery on Chrome/Android, all 3 languages |
| **D3** | `tts.js` + **F2 chat voice** (spoken smalltalk recovery replies) + **F3 dashboard readout** + interrupt handling | Speak a BudgetBee answer aloud in EN/বাংলা/اردو |
| **D4** | **3-way language chip**, error matrix (§6 pass), Firefox hide, a11y labels, phrase checklist doc, flag-off test | Full manual matrix + `npm run lint && npm run build` green |

**Stretch (only if D1–D4 all green):** F4 voice navigation.
**Estimate:** 4 focused days solo; **~1–2 days elapsed working with me** (D1 ≈ one session). Trilingual + recovery adds ~1 day vs the original two-language plan (lexicon + digit sets scale linearly; recovery reuses shipped chat logic).

---

## 11. Risks & honest answers

| Risk | Mitigation |
|---|---|
| ASR accuracy on accents/regional speech | Confirm-step design + editable transcript; our lexicon tolerates Roman-Urdu variants |
| Chrome ASR needs internet | Disclosed + graceful text fallback (§6); judges demo on venue Wi-Fi which still works |
| `hi-IN` returns mixed scripts (Latin/Devanagari) | Dual-script normalization + keyword maps in 4 forms |
| TTS voice quality robotic | Native voice preferred when available; rate 1.0; text always visible alongside speech |
| Scope creep | F1–F3 are the promise; F4 needs explicit time check on D4 |
| "Did you build the speech model?" (judge trap) | **No — and that's correct:** we *orchestrate* browser ASR/TTS + our own parse layer; the IP is the **trilingual** intent/entry parser + UX. Say this confidently. |

---

## 12. Judge cheat-sheet

- **Q: How does it work?** "Native Web Speech API in the browser — ASR in, our **trilingual** parser (digits/scripts/number-words in English, Bangla, Urdu, Hindi, Roman forms), TTS out. Zero audio touches our server."
- **Q: Why not build/use a paid speech API?** "Browser-native is free, offline-capable for TTS, and privacy-preserving; we'd only move to a paid API if we needed guaranteed offline ASR or server-side processing later."
- **Q: What if it fails?** "Mic disappears if unsupported; failed parses show an editable transcript; the whole feature sits behind a localStorage flag — one line and it's off."
- **Q: Two languages — how?** → **"Three** — English, **Bangla**, and Urdu/Hindi. A language chip sets recognition (`en-*`/`bn-BD`/`hi-IN`) + TTS voice; our parser normalizes Devanagari, **Bengali** *and* Urdu digits and matches category keywords in five script/roman forms."
- **Q: What if the user says something unclear, like *"why what are you doing"*?** "It's not an error — it routes to BudgetBee's chat layer, which already handles conversation like that, and we **speak the answer back** plus show a suggestion: *'Try: record 120 taka for dinner.'* One suggestion round max, then we hand over the keyboard."
- **Demo line:** *(tap mic, EN)* **"One hundred and twenty taka for lunch"** → chips: ৳120 · Food · lunch → **Confirm.** *(বাংলা chip)* **"১২০ টাকা রাতের খাবারের জন্য"** → same chips. *(then off-topic)* **"why what are you doing"** → BudgetBee answers **aloud** + suggestion chip appears.
