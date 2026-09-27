# Campus Coin — Judge Q&A (every possible question, with answers)

> Format: **Q** → crisp answer (say this out loud), + follow-ups judges usually add.
> Categories: A Project · B Frontend · C Backend/Architecture · D Security · E AI · F Data · G Realtime · H Quality · I Deploy/Scale · J Business · K Team/Honest weaknesses

---

## A. Project & motivation

**Q: What problem does this solve?**
Students have irregular income (allowance, gig money, gifts) and no visibility; existing finance apps are built for salaried adults with bank links. Campus Coin gives a student one daily decision number — *safe to spend today* — plus budgets, alerts, and AI guidance, with zero bank integration.

**Q: Who is it for? Why would students use it?**
College/university students first (campus = distribution), then hostel communities and literacy clubs. They use it because it answers "can I afford this?" in 2 seconds, fits student categories (canteen, transport, recharge), works on any phone, and rewards daily logging with streaks/goals/tips — retention by usefulness, not by notifications.

**Q: Isn't this just another expense tracker?**
The difference is *guidance*, not logging: daily-burn math, category budgets with proactive alerts, AI insights and tips generated from *your own* history, and a BudgetBee chat that answers purchase questions with your real numbers. Logging is table stakes; decisions are the product.

**Q: What's new/innovative?**
The resilient AI layer: Groq → OpenRouter → rule-engine fallback, so AI features work even with no API key — plus "verdict-first" purchase advice grounded in the user's live safe-to-spend figure instead of generic chatbot text.

**Q: What would you improve with more time?**
See 05-future-enhancements.md (voice entry, Bengali/English, PWA push, receipt OCR, wallet-statement import). Be ready to pick your top 3 and justify.

---

## B. Frontend cross-questions

**Q: Why Next.js instead of plain React (Vite/CRA)?**
Next *is* React — we chose the framework for static prerender (landing loads in ~100 ms in prod), file-based routing with layouts (route groups give us one guarded dashboard shell), and built-in `/api/v1` rewrites that proxy to Express so the app runs **same-origin** (cookies work, no CORS pain — in dev, ngrok demo, and prod).

**Q: Why App Router, not Pages Router?**
App Router is Next's current direction: nested layouts, streaming, server components later; route groups `(auth)`/`(dashboard)` map cleanly to our guard structure.

**Q: Why not TypeScript?**
Timeline on a greenfield build; we typed the risky boundaries with **Zod** server-side and enforce a consistent response envelope. Honest trade-off + documented migration path (start with `lib/api.js` + models).

**Q: Why Zustand over Redux/Context?**
Global state (auth/notifications/UI) in ~1 KB with no action/reducer boilerplate; Context would re-render whole trees; Redux is ceremony we don't need at this scale.

**Q: Why Tailwind?**
Speed + consistency + zero naming bugs; config carries our theme (dark mode, fonts); prod CSS is purged and tiny. Not MUI because we wanted our own design language and smaller bundles.

**Q: Why recharts / framer-motion / lucide?**
Declarative charts in React, production-grade animation without CSS-keyframe sprawl, and a consistent free icon set — all tree-shaken.

**Q: How do you handle state after mutations?**
`lib/api.js` calls → store update → targeted refetch; 401 triggers automatic refresh-then-retry, then redirect to login. Errors map to friendly human messages (never raw JSON).

**Q: Is it mobile-friendly / accessible?**
Mobile-first responsive layout (verified at 390×844 and desktop 1440×900 across Chromium/Firefox/WebKit), semantic controls, focus states, contrast-checked dark theme.

---

## C. Backend & architecture

**Q: Why Express?**
One language for UI+API, middleware pipeline perfect for cross-cutting concerns, one process also hosts Socket.io. Not Nest (too much ceremony for ~14 routes), not Django (second language), not Fastify (familiarity > microseconds at our scale).

**Q: Why MVC — isn't that old-fashioned?**
MVC with a **services layer**: routes = wiring, controllers = HTTP glue, services = all business logic (budgets, AI, tips, alerts, mail), models = schemas. It's the structure a judge can follow in one glance, and thin controllers mean logic stays reusable/testable. (Full answer in 02 §5.)

**Q: Why not the Repository Pattern?**
Mongoose models already abstract storage; repos would double files for one engine. The *benefit* of repos (swappable storage, mock-heavy tests) doesn't pay at this scale — YAGNI — but our services call models only through Mongoose, so extracting repositories later is mechanical.

**Q: REST or GraphQL? Why?**
REST: fixed dashboard payloads, simple caching/testing, envelope convention everywhere. GraphQL's value (client-shaped queries, many consumers) needs multiple frontends we don't have.

**Q: How is the API structured?**
`/api/v1` with 14 route files (auth, transactions, budgets, categories, dashboard, reports, tips, bookmarks, insights/ai, notifications, announcements, admin, users). Every response is `{success, message, data}`; errors go through one central handler that sanitizes 5xx messages.

**Q: Where's business logic? (poke: "isn't your controller fat?")**
No — controllers parse/validate/orchestrate only; `services/` holds `ai/` (provider, chat, insight, categorize), `budgetAlerts`, `tipsEngine`, `recurring`, `mail`, `notify`. Show them `server/src/services/` as proof.

**Q: Why ESM (`"type": "module"`) not CommonJS?**
Modern `import/export`, tree-shaking, aligns with Next and future Node; `--watch` dev reload built in.

**Q: How do you validate input?**
Zod schemas in `validators/` + controller checks; client mirrors with controlled forms. Bad input → structured 400, rendered as friendly text.

---

## D. Security

**Q: How does auth work?**
Register → OTP email verify → login. Access JWT **15 min** kept in `sessionStorage` (auto-refresh on 401), refresh JWT **7 d** in an **HTTP-only, Secure, SameSite=Lax cookie**. Passwords hashed with **bcryptjs**. `protect`/`adminOnly` middleware accept Bearer *or* cookie.

**Q: XSS? CSRF?**
XSS: tokens not in readable cookies, React escapes by default, no `dangerouslySetInnerHTML`, Helmet headers. CSRF: SameSite=Lax cookie + origin allow-list + credentialed CORS limited to `CLIENT_URL`; state-changing routes require the access token (not cookie-only).

**Q: Brute force / abuse?**
Rate limits: auth 30/15 min, API 500/15 min; OTP has attempt counters ("4 attempts left"); JWT expiry rotation.

**Q: Secrets?**
`.env` gitignored, only `.env.example` committed; server validates env at boot (zod) and exits if required vars are missing; prod never falls back to a fake DB.

**Q: What else?**
Helmet headers, CORS allow-list, payload size limit (1 MB), Zod validation on inputs, sanitized production error messages (raw errors logged server-side only), Atlas IP allow-list, no passwords in logs/seed scripts (documented demo creds only).

**Q: Are user payments/PCI data involved?**
No — we never touch money movement or bank credentials; that's a feature (privacy) and answers any payment-security question: **out of scope by design**.

---

## E. AI layer

**Q: Which LLM? Why?**
Groq (fast free tier) primary → OpenRouter secondary → **local rule engine** fallback. Model swappable via env (`GROQ_MODEL` etc.). We're provider-agnostic through `ai/provider.js`.

**Q: What if the API key dies / costs blow up?**
Features degrade, never break: chat → FAQ/rules answers, insights → rule narratives, categorize → category-name rules, tips → rule engine (tips are generated from user stats anyway). Demonstrable by clearing keys.

**Q: What can it do?**
① intent-routed chat (smalltalk instant, purchase-verdict with your safe-to-spend, general finance with light stats) ② auto-categorization of transactions ③ monthly insight narratives ④ personalized tips ⑤ (rules) budget alerts. Context sent = aggregates only (safe-to-spend, top categories) — not your full history.

**Q: Hallucinations / wrong advice?**
Prompts force *verdict-first* answers grounded in computed numbers ("13,997 BDT safe, daily burn 250"); markdown stripped; empty/bad LLM output rejected → rules answer; AI-suggested categories outside the user's list are discarded to rules. We position it as **advice, not financial advice**.

**Q: Prompt injection?**
System prompts are fixed server-side; user input is one message field with length cap (500 chars); no tools/execution — worst case it returns odd text inside the chat box.

**Q: Why not fine-tuning/RAG?**
Scale doesn't justify it; structured context (computed stats) gives 90% of grounding at 0% training cost.

---

## F. Data & database

**Q: ER/model overview?**
User, Transaction, Category (system vs custom), Budget, Notification, Tip, Bookmark, Insight, Announcement, PendingRegistration — drawn in 02 §9.

**Q: Why MongoDB again? (if not covered)**
JSON-native documents, schema velocity, Atlas free tier; honest SQL trade-off answer in 02 §4.

**Q: How do joins/population work?**
`populate` for category refs; aggregation pipelines compute monthly stats server-side (client never downloads 600+ rows to render one chart).

**Q: Indexes?**
Lookups are keyed on `userId`/`email` — at demo scale default indexes suffice; production plan = compound indexes `(userId, date)` on transactions, unique index on email (Mongoose), TTL on pending registrations/resets. *(Honest: some of these are "planned", unique email enforced in code.)*

**Q: Where does demo data come from? Is it fake?**
`npm run seed:reset` builds 6 months × 3 students (602 transactions, budgets, notifications, tips) with a **deterministic PRNG** → identical every judging run; system categories re-seed each boot. Same data in prod Atlas.

**Q: Money as floats?**
Amounts are single-currency (BDT) numbers at app scale; acknowledged limitation — production hardening would use integer minor units + stricter decimal validation.

---

## G. Realtime

**Q: How do live notifications work?**
Socket.io: server verifies JWT at handshake, joins `user:{id}` room; budget alerts/announcements/transaction events `emitToUser` → client hook pushes toasts + notification store. Second tab updates live (demo-able).

**Q: Why Socket.io over raw WebSocket?**
Handshake auto-upgrades from polling (proxy/tunnel-safe — our ngrok demo rides on it) with reconnect/heartbeat built in; raw WS would need that by hand.

**Q: What if websockets are blocked?**
Polling fallback keeps the app fully functional (REST does all real work; socket is enhancement).

---

## H. Quality & testing

**Q: What tests do you have? (dangerous — answer honestly)**
Our gates: ESLint (`next lint`) + production build as compile-check + a **custom Python/Playwright E2E suite** (login, registration+OTP, chat, transactions, cross-browser Chromium/Firefox/WebKit, mobile viewport) + API smoke scripts. We do **not** yet have unit tests — that's the top process improvement (Jest/Vitest for `services/` first, since services are pure logic precisely to make that easy).

**Q: How do you verify changes?**
Documented order: client `lint → build` (dev server stopped first), server boot + health + E2E `--only` phases. Rate-limit-aware test runner (no flaky 429s).

**Q: CI/CD?**
No CI yet (single-repo, two packages); deploy target does build-time checks (Vercel/Render), and adding GitHub Actions (lint+build on PR) is a 30-minute follow-up.

**Q: Biggest bugs you hit and how you fixed them?**
Great story: (1) ngrok tunnel 404s on `/socket.io` — traced Next's trailing-slash 308 → fixed with exact-path rewrite; (2) prod silent empty-DB fallback — added hard guard that exits if Atlas is down in production; (3) "Invalid response" raw errors — layered friendly-error mapping client+server. Shows debugging discipline.

---

## I. Deployment & scaling

**Q: Where does it run?**
Current judging demo: local Express+Next behind an **ngrok tunnel** (same-origin proxying identical to prod). Deploy config prepared: **Vercel** (client) + **Render** (server, `render.yaml` blueprint) + **Atlas** (data) — hosting account constraints deferred, all config committed.

**Q: What breaks first at 10k users?**
Honest ladder: ① free-tier Atlas/Render limits (easy plan bumps) ② single-process Socket.io → **Redis adapter** + sticky/instance count ③ read-heavy dashboards → caching + more indexes ④ LLM quotas → provider chain already mitigates. Auth is stateless (JWT) so horizontal scaling of API is straightforward.

**Q: Why not serverless (Vercel functions) for the API?**
Long-lived websockets + `--watch`-style state (in-process rate limits, socket map) fit a long-running server; Express on a container is the right shape (and Vercel/Netlify can't host Socket.io long-running).

**Q: Uptime/cold starts?**
Render free sleeps after 15 min idle (~30–50 s wake) — noted, with options (paid tier or keep-alive ping). Vercel edge serves the client instantly.

**Q: Database downtime?**
Dev: Local→Atlas→memory (with visible logs). Prod: refuses to run silently on wrong data (exit 1) — better a loud failure than corrupt demos.

---

## J. Business questions

Covered fully in **01-project-and-business.md** — highlights:
- **Worth for students**: daily decision number, no bank link, 2-minute setup, habit mechanics (streaks/goals), BDT + student categories.
- **Competition**: generic apps = salaried/bank-linked; spreadsheets = no guidance; us = student-first + AI decisions on *your* numbers.
- **Making money**: freemium AI, campus partnerships (banks/wallets/MFI literacy programs), sponsored challenges; growth via hostels/clubs.
- **Metrics that matter**: DAU/WAU, streak length, budget-adherence %, AI answer usefulness, month-end retention.
- **Data ethics**: opt-in analytics potential only; no bank data ever; individual data never sold.

---

## K. Team, process & honest-weakness answers

**Q: How was it built/what's your process?**
Two-package monorepo (no workspaces), Git flow to GitHub, docs (`extras/`), phase plans, E2E-gated changes, commits per feature (auth → CRUD → AI → realtime → UX hardening → deploy prep).

**Q: Hardest part?**
Reliability orchestration: keeping AI + DB + auth working in *every* degraded condition (no key, no local DB, tunnel proxies, SMTP off) — the fallback chains are the hidden engineering of this project.

**Q: What would you change?**
1) Add TypeScript incrementally + unit tests for services. 2) Extract repositories when a second data source appears. 3) TanStack Query once mutation count grows. 4) Redis socket adapter before multi-instance.

**Q: Known limitations? (never bluff — use this table)**

| Limitation | Our answer |
|---|---|
| No unit tests yet | E2E + lint/build gates in place; services written as pure logic *for* testability; Jest is sprint-one next |
| Plain JS | Zod-validated boundaries now; documented TS migration path |
| Free-tier host sleeps | Deploy config ready; paid tier or keep-alive when going live |
| Money as floats (BDT) | Fine at app scale; integer minor units on roadmap |
| AI can be wrong | Verdict-first grounded prompts + fallbacks + "advice not financial advice" framing |
| Single currency (BDT) | Scope choice — currency field exists, conversion is future work |
| No CI | GitHub Actions lint+build is a 30-min add-on |

**Q: Is it production-ready?**
Feature-complete and hardened for demo (security headers, rate limits, validation, email, realtime, prod DB guard, deploy blueprints). What remains is ops: choosing hosts, adding tests/monitoring, and paid-tier capacity — a normal 1–2 week hardening sprint.

---

## Rapid-fire 10 (one-liners)

1. **Languages?** JavaScript (ESM) everywhere; JSX; SQL-free.
2. **Framework versions?** Next 14.2 / React 18 / Express 4 / Mongoose 8 / Tailwind 3.
3. **Auth in one line?** bcrypt + 15 m access JWT (storage) + 7 d refresh JWT (HTTP-only cookie) + OTP email.
4. **State?** Zustand (auth/ui/notifications).
5. **API style?** REST `/api/v1`, envelope `{success,message,data}`.
6. **DB?** MongoDB Atlas, Mongoose models, seeded deterministically.
7. **Realtime?** Socket.io rooms per user, JWT handshake, polling fallback.
8. **AI?** Groq → OpenRouter → rules; never fails.
9. **Biggest deploy artifact?** `render.yaml` + parameterized rewrites; Vercel root=`client`.
10. **One thing you'd add first?** Unit tests for `server/src/services`.
