# Campus Coin — Voice Feature: How It Actually Works

The **as-built** reference for the voice layer (companion to the pre-build plan in
[06-voice-feature-plan.md](./06-voice-feature-plan.md)). Everything below describes what is
merged and verified — not a proposal.

**One paragraph:** Campus Coin has a trilingual (English / বাংলা / اردو) voice layer with two
halves. **Input** runs entirely in the browser: the Web Speech API listens, our pure-function
parser (`src/lib/voice/*`) turns the transcript into a transaction draft (amount → category →
note), shows it as chips, and saves through the normal REST endpoint. **Output** speaks with a
*human-quality neural voice* synthesized server-side through Microsoft Edge's free read-aloud
WebSocket service (no API key), with an automatic fall-back to the browser's built-in
`speechSynthesis` if the network is unhappy. Both halves never hard-fail.

---

## 1. What we used (and why)

| Piece | Technology | Why this one |
|---|---|---|
| Speech-to-text (STT) | **Web Speech API** — `window.SpeechRecognition || webkitSpeechRecognition` | Free, built into Chrome/Edge, streams *interim* results for live UX, and **audio never leaves the device** (privacy claim we can keep). No API key, no server cost. |
| Text-to-speech (TTS), primary | **Microsoft Edge read-aloud neural voices**, called server-side over `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud` | Same voices the Edge browser uses (Emma, Nabanita, Uzma) — genuinely human-sounding, **free, no API key**. Proxied through our Express server because the endpoint requires headers/browsers that `fetch()` can't send. |
| WebSocket client on server | **`ws` (^8.18.0)** | Node's built-in WebSocket client can't set HTTP headers, and this endpoint rejects header-less upgrades (verified). `ws` can. |
| TTS, fallback | **Browser `speechSynthesis` + `SpeechSynthesisUtterance`** | Always available offline-ish; voice scoring picks Google/Neural/local non-local voices in that order. Keeps the app demo-safe if the network dies (same philosophy as the AI provider fallback: Groq → OpenRouter → rules). |
| Parsing (speech → transaction) | **Pure JS functions** (`normalize.js`, `parseEntry.js`, `parseIntent.js`, `lexicon.js`) | No model, no server call — deterministic, unit-testable (65 Vitest cases incl. the 45 golden phrases), works identically for all 3 languages. |
| Validation / transport | **zod** route schema + existing `api` client + `{success, message, data}` envelope | Follows the repo's API conventions; text capped at 1000 chars, locale at 12. |
| UI | Existing `Button`, chips, toasts, Zustand UI store | Voice reuses the design system; no parallel components. |
| Tests | **Vitest** (parsers), **Playwright E2E** (`e2e/run_e2e.py` → `voice` phase), manual checklist [07](./07-voice-phrase-checklist.md) | Parsers are pure → fast unit coverage; UI states covered by E2E. |

**Deliberately NOT used:** paid TTS keys (ElevenLabs/OpenAI), any LLM for parsing (the LLM keys
we have — Groq/OpenRouter — don't do TTS anyway), server-side STT (privacy + cost).

---

## 2. End-to-end architecture

```
                       VOICE INPUT (browser only — audio never uploaded)
 ┌─────────┐   sound waves    ┌──────────────────────────────┐
 │  Micro  │ ───────────────► │ Web Speech API (Chrome/Edge) │  lang: en-US / bn-BD / ur-PK
 └─────────┘                  │  continuous + interimResults │
                              └──────────────┬───────────────┘
                                             │ interim text  ──► live transcript bubble
                                             │ final text
                              ┌──────────────▼───────────────┐
                              │  normalize.js                │  script digits → ASCII, strip
                              │  (Bengali/Urdu/Arabic/Hindi) │  thousands, word-numbers
                              ├──────────────────────────────┤
                              │  parseEntry.js               │  amount → category (lexicon
                              │  parseIntent.js              │  scoring) → note → intent
                              └──────────────┬───────────────┘
                                             │ { amount, category, type, note }
                              ┌──────────────▼───────────────┐
                              │  <VoiceChips> preview        │  🍔 Food  ৳250  "canteen"
                              │  Confirm / Edit / Discard    │
                              └──────────────┬───────────────┘
                                             │ POST /api/v1/transactions  (normal REST)
                              ┌──────────────▼───────────────┐
                              │  Express + MongoDB           │  same route as typed entry
                              └──────────────────────────────┘


                       VOICE OUTPUT (text → human neural voice)
  Dashboard "read-aloud"  ─┐
  Chat spoken-reply toggle ─┼─► useVoiceTts.say(text, locale)
  Entry confirmations      ─┘            │
                              ┌──────────▼──────────┐  client/src/lib/voice/tts.js
                              │ speak(): session++,  │
                              │ interrupt guard,     │
                              │ try NEURAL first     │──── 8s timeout
                              └──────────┬───────────┘
                    POST /api/v1/voice/tts {text, locale}   (protect + zod)
                              ┌──────────▼───────────┐  server/src/services/tts.service.js
                              │ LRU cache (100)      │──► hit? return cached mp3 (≈0ms)
                              │ XML-escape + chunk   │      (≤4096 bytes, entity-safe cuts)
                              │ ws → Edge read-aloud │──► Sec-MS-GEC signing, SSML frame,
                              │    9s hard timeout   │      binary Path:audio frames → mp3
                              └──────────┬───────────┘
                     200 {audio: base64 mp3}      or      502 (engine unreachable)
                              ┌──────────▼───────────┐
                              │ Blob → <audio> play  │  fallback: speechSynthesis
                              └──────────────────────┘
```

---

## 3. Voice INPUT in detail

### 3.1 Where it lives

| Surface | Component | What voice does there |
|---|---|---|
| Add transaction | `components/voice/MicButton.jsx` on `/transactions/new` | Tap mic → speak ("today food expense 250 taka") → chips preview → Confirm saves |
| AI chat | `components/ai/ChatWidget.jsx` | Mic in the chat input; "spoken reply" toggle speaks the AI answer |
| Language switcher | `components/voice/VoiceChips.jsx` language chips | EN / বাংলা / اردو switch recognition locale + mic labels |
| Global flag | `lib/voice/flag.js` | `localStorage cc_voice = "0"` hides the mic everywhere (rollback switch) |

### 3.2 Recognition engine (`lib/voice/recognition.js`)

A tiny wrapper around `SpeechRecognition` with the state machine judges care about:

- `continuous = true`, `interimResults = true`, `maxAlternatives = 1`.
- **Finals + interim** are accumulated; the UI shows a live transcript while you speak.
- **Two timers** end the utterance naturally so the user never hunts for a "stop":
  - `SILENCE_MS = 1500` — no new result for 1.5 s → stop.
  - `QUIET_MS = 6000` — nothing at all for 6 s → stop.
- **Friendly errors** (a curated map, not raw codes): mic blocked → *"Mic blocked — allow the microphone…"*,
  `network` → *"Voice needs internet — type it instead."*, `no-speech` → *"Didn't catch that."*.
  The UI always recovers to a tappable state — no dead ends, never a crash (asserted by E2E).
- `cancel()` aborts silently (returns `null` final) vs `stop()` which delivers the transcript.

Hooks: `useVoiceRecognition` (React state: `listening / interim / error`) and `useVoiceTts`
(`speaking / say / stop`).

### 3.3 Trilingual parsing pipeline (the actual hard part)

**Stage 1 — `normalize.js`**
- `normalizeDigits()`: maps Bengali (০-৯), Urdu/Arabic (۰-۹, ٠-٩), Devanagari (०-९) digits → ASCII.
- `stripThousands()` — `"1,250"` → `"1250"`.
- `extractAmount()`:
  1. first numeric literal wins (`250`, `250.50`, `৳250`);
  2. else **number-words** — English (`twenty five`, `hundred`, `thousand`), romanized Bangla
     (*dui, panchas, hazaar, eksho…*), Hindi (*do, paanch, sau, hazaar…*), Bengali script
     (*পাঁচশ, হাজার…*) with a `mul/big/add` accumulator (`two hundred fifty` = 250).
- Tokenizer splits on whitespace/punctuation (Unicode-aware for scripts without spaces).

**Stage 2 — `parseEntry.js`**
- `matchCategory(tokens)` scores every category in `lexicon.js` by keyword hits
  (English + Bangla + Urdu + romanized forms; multi-word keywords phrase-matched;
  non-Latin keywords use substring match since those scripts don't tokenize the same way).
  Highest score wins → `type` (income/expense) follows the category.
- Note = leftover tokens minus stop-words and currency words (`taka`, `bdt`, `tk`…).
- `ok = amount > 0` — no amount, no entry (recovery UI takes over).

**Stage 3 — `parseIntent.js`** routes the transcript:

| Match order | Result |
|---|---|
| daily-burn patterns ("how much did I spend today") | `intent: dailyburn` → spoken answer |
| purchase/chat patterns, any `?`, question patterns | `intent: chat` → AI chat |
| valid entry (has amount) | `intent: entry` → VoiceChips preview |
| greeting | `intent: chat` |
| nothing matched | `intent: unknown` → friendly "try again" recovery |

### 3.4 Confirm → save (and the duplicate bug we killed)

`<VoiceChips>` renders the draft (amount pill, category pill, note pill) with **Confirm / Edit /
Discard**. Saving goes through the normal `POST /api/v1/transactions` — no special API.

Hardening shipped with this feature (`ebf35d1`):
- every button inside forms is explicitly `type="button"` (a Confirm that defaulted to
  `submit` fired **twice** — one click, two identical transactions);
- `savingRef` re-entrancy guard in `/transactions/new`'s `submitWith`;
- `busy` state disables Confirm while the POST is in flight;
- UI store de-dupes identical toasts (HTTP budget alert + socket twin).

### 3.5 Preferences & privacy

- `localStorage`: `cc_voice_lang` (`en|bn|ur`), `cc_voice` (mic visibility flag),
  `cc_voice_tts` (chat spoken-reply on/off).
- UI copy (`PRIVACY_NOTE`): *"Speech is processed by your browser's built-in recognizer —
  audio never reaches our server."* True: STT is 100 % local to the browser vendor's engine.

---

## 4. Voice OUTPUT in detail (the "human voice")

### 4.1 Entry points → `useVoiceTts.say(text, locale)`

1. **Dashboard read-aloud** — `SpeakButton` (aria-label *"Read my money snapshot aloud"* /
   *"Stop…"*) speaks the monthly snapshot (`voiceBrief` on `dashboard/page.js`).
2. **Chat spoken replies** — `ChatWidget` toggle (`cc_voice_tts`); speaks the AI reply when
   it was requested by voice.
3. **Voice-entry confirmations** — `MicButton` speaks recognition results/confirmations.

### 4.2 Client (`lib/voice/tts.js`) — neural first, browser fallback

```
speak(text, locale, {onEnd}):
  1. stopSpeaking()            // bumps session, pauses audio, cancels synth
  2. session counter captured  // any stop/replacement invalidates this run
  3. try playNeural():
       POST /voice/tts  (8s timeout, withTimeout)
       base64 → bytes → Blob → <audio>.play()
       waits on ended/pause/error; revokes object URL in finally
  4. neural failed/timeout/502 → playBrowser(): speechSynthesis + pickVoice()
       pickVoice scores: google=3 > neural/natural=2 > non-local=1 > local=0
  5. onEnd → clears the "speaking" state (button flips back)
```

- **Interruptible:** any click after the starting one stops the speech
  (`click` listener armed on a 0 ms timer so the initiating click can't cancel itself).
- **Session guard:** a `stopSpeaking()` or a second `say()` bumps `session`; stale async
  continuations (`my !== session`) bail — no zombie audio, no `onEnd` from a dead run.
- `useVoiceTts.say()` no longer gates on `ttsAvailable()` — the neural path works even in
  browsers without `speechSynthesis`.

### 4.3 Server (`services/tts.service.js`) — Edge read-aloud protocol

No API key. The service speaks the exact protocol the Edge browser's read-aloud feature uses:

1. **Voice pick:** `en → en-US-EmmaMultilingualNeural`, `bn → bn-BD-NabanitaNeural`,
   `ur → ur-PK-UzmaNeural` (falls back to Emma).
2. **Cache:** LRU `Map` of 100 entries keyed `voice|escapedText` — re-clicks and repeated
   chat phrases return in ~0–25 ms instead of seconds.
3. **Text prep:** strip control chars the service rejects → XML-escape (`& < >`) →
   `chunkEscaped()` splits >4096-byte payloads on spaces and never cuts an `&…;` entity in half.
4. **Per chunk — one WebSocket:**
   - URL: `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1`
     + `TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4` + per-connection `ConnectionId`
     + **`Sec-MS-GEC`** = `sha256(nowTicks + token)` uppercased, ticks quantized to 5 minutes,
     with `Sec-MS-GEC-Version: 1-143.0.3650.75`.
   - Headers: Edge UA, `Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold`,
     random `muid` cookie — i.e. we present as the legitimate Edge client.
   - On open → send `Path:speech.config` (requests `audio-24khz-48kbitrate-mono-mp3`),
     then the SSML frame (`Path:ssml`, `<voice name=…><prosody …>text</prosody></voice>`).
   - **Binary frames:** 2-byte little-endian header length → header must contain
     `Path:audio` → body bytes are mp3 fragments.
   - **Text frames:** `Path:turn.end` → done; no audio → error.
   - Hard **9 s timeout** per chunk; errors are normalized (`tts-timeout`, `tts-no-audio`,
     `tts-closed`, `tts-http-xxx`).
5. **Never hard-fails:** the route (`routes/voice.routes.js`, `protect` + zod
   `text ≤ 1000`) catches everything and answers **502 "Neural voice is unavailable right
   now"** → the client silently falls back to browser TTS. Mirrors the AI-layer rule
   (Groq → OpenRouter → local rules): a missing/failing engine degrades, it doesn't break.

### 4.4 Endpoints

| Method | Path | Auth | Body → Response |
|---|---|---|---|
| `POST` | `/api/v1/voice/tts` | `protect` | `{text ≤1000, locale ≤12}` → `{audio: base64, mime, voice, engine:"neural"}` (or 502) |
| `GET` | `/api/v1/voice/status` | `protect` | `{engine:"neural", voices, keyRequired:false}` |

`GET /voice/status` is how the UI (and judges) can prove which engine is live.

### 4.5 Privacy (output side)

Only the **text** of a reply/snapshot is sent to our server; **audio is never uploaded or
downloaded from a third party by the user** — it is synthesized for the session and played.
The privacy page was updated to say exactly that (no over-claiming).

---

## 5. Resilience matrix (what happens when things break)

| Failure | Behaviour |
|---|---|
| Mic permission denied / no mic / no speech | Curated friendly message; UI returns to tappable state (E2E-asserted, never a crash) |
| No amount in the phrase | Chips don't appear → conversational "try again" recovery |
| Browser without Web Speech API | "Voice input isn't supported in this browser." — typing still works |
| Edge TTS hangs / network blip (observed ~1/3 on bad days, 9 s cap) | Route → 502; client falls back to `speechSynthesis` within 8 s; UI state always clears |
| Repeated phrase | Server LRU cache → near-instant audio |
| Double-tap Confirm | `busy` + `savingRef` + `type="button"` → exactly one transaction |
| TTS muted / unsupported | Chat toggle off (`cc_voice_tts`), read-aloud still guarded by `ttsAvailable()` |
| Anything at all | Mic flag `cc_voice=0` hides voice UI entirely (roll-back switch) |

---

## 6. Testing & verification

| Layer | What | Result |
|---|---|---|
| Unit (`cd client && npm test`) | Vitest — parser golden phrases (45 across en/bn/ur), normalize, intent routing, lexicon | **65/65 passing** |
| E2E (`python e2e/run_e2e.py`) | `voice` phase: chips render, tap-mic listening/recovery, language chip switch, flag hides mic, read-aloud button, chat mic + spoken-reply | **passing** (part of the 77-step suite) |
| Manual | [07-voice-phrase-checklist.md](./07-voice-phrase-checklist.md) — 45 phrases + browser matrix | judge/demo script |
| Server smoke | `GET /voice/status` → `engine:"neural"`; live `/voice/tts` round-trips ≈1–7 s cold, ms warm | verified |

**Known limitation (honest):** Microsoft's free endpoint occasionally stalls (~9 s) on a bad
network — users then hear the browser fallback voice for that one utterance. Fix path if we
ever pay: swap `tts.service.js` internals for a key-based TTS; route + client are already
engine-agnostic.

---

## 7. File map

**Client (`client/src/`)**

| File | Role |
|---|---|
| `lib/voice/recognition.js` | SpeechRecognition wrapper (timers, errors, cancel) |
| `lib/voice/normalize.js` | Digit/script/number-word normalization → amount extraction |
| `lib/voice/lexicon.js` | Trilingual categories, currency words, stop-words, patterns |
| `lib/voice/parseEntry.js` | amount + category + note draft |
| `lib/voice/parseIntent.js` | entry / chat / dailyburn / unknown routing |
| `lib/voice/lang.js` | Locales, labels, `PRIVACY_NOTE`, stored language |
| `lib/voice/flag.js` | Global mic visibility (`cc_voice`) |
| `lib/voice/tts.js` | Neural-first `speak()` + browser fallback + session/interrupt |
| `lib/voice/voice.test.js` | The 65 golden tests |
| `hooks/useVoiceRecognition.js` | React bridge for STT |
| `hooks/useVoiceTts.js` | React bridge for TTS (`say/stop/speaking`) |
| `hooks/useVoiceSupport.js` | Capability detection |
| `components/voice/MicButton.jsx` | Transaction mic + chips save flow |
| `components/voice/VoiceChips.jsx` | Preview + Confirm/Edit/Discard (all `type="button"`) |
| `components/voice/SpeakButton.jsx` | Dashboard read-aloud |
| `components/voice/VoiceWave.jsx` | Listening animation |
| `components/ai/ChatWidget.jsx` | Voice input + spoken replies |

**Server (`server/src/`)**

| File | Role |
|---|---|
| `services/tts.service.js` | Edge read-aloud WebSocket client, chunking, cache, voices |
| `routes/voice.routes.js` | `POST /tts`, `GET /status` (protect + zod + 502 fallback) |
| `routes/index.js` | Mounts `/voice` |
| `package.json` | Adds `ws` (only new runtime dep) |

---

*Everything above is covered by the repo's gates: `npm run lint` + `npm run build` (client),
`npm test` (65), `python e2e/run_e2e.py` (77 steps). See AGENTS.md.*
