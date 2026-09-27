# Campus Coin — Technical Stack & Design Decisions

> Every "why" behind the stack, written so you can answer cross-questions confidently.
> Companion files: 01 Business · 03 Packages · 04 Judge Q&A · 05 Future UX

---

## 0. The stack at a glance

| Layer | Choice | One-line why |
|---|---|---|
| Frontend | **Next.js 14 (App Router) + React 18**, plain JavaScript (JSX) | SSR for the landing page, file-based routing, one framework for UI + API proxying, fast builds |
| Styling | **Tailwind CSS 3** | utility-first speed, zero CSS-scope bugs, tiny purged CSS in prod |
| State | **Zustand** | 1 KB global store without Redux ceremony |
| Realtime | **Socket.io** (client + server) | live notifications/budget alerts with auto-reconnect + polling fallback |
| Backend | **Node.js + Express 4** (ESM) | same language as frontend, middleware ecosystem, perfect for REST + websockets in one process |
| Database | **MongoDB Atlas + Mongoose 8** | schema-flexible documents match varied student transactions; JSON-native; free managed tier |
| Architecture | **MVC + services layer** | thin controllers, testable business logic, clear folders a judge can navigate |
| Auth | **JWT** (access 15 m in memory/sessionStorage + refresh 7 d in HTTP-only cookie), **bcryptjs** | stateless scaling, XSS-resistant refresh, no session store needed |
| AI | **Groq → OpenRouter → local rule engine** | fast/free LLMs with a zero-dependency fallback — the feature never dies |
| Email | **Nemailer (SMTP)** + dev console fallback | real OTP/reset emails; still demo-able with no SMTP configured |
| Validation | **Zod** (server) | one schema = parse + error messages, consistent 400s |
| Tooling | ESLint (next/core-web-vitals), Prettier (present), custom **Python + Playwright E2E runner** | practical quality gates on a no-TS codebase |

---

## 1. "Why Next.js — why not just React?" *(most likely cross-question)*

**Clarify first:** Next.js *is* React. The real question is **Next.js vs a plain React SPA (Vite/CRA)**.

| Concern | Plain React SPA | Our Next.js choice |
|---|---|---|
| Landing page SEO/speed | Client-rendered, slower first paint | Landing/auth pages are **statically prerendered** (measured 23–135 ms TTFB in prod) |
| Routing | Add react-router, hand-wire code-splitting | **File-based routing** with built-in code-splitting per route |
| API→same-origin issues | CORS + separate origins always | `next.config` **rewrites proxy `/api/v1`** → Express = single origin in prod and in our ngrok demo (cookies just work) |
| Build/perf | Manual optimization | Built-in image/font/JS optimization, route-level bundles (first load JS ≈ 88 KB shared) |
| Future | — | Can move pages to server components/API routes incrementally |

**Why not Pages Router?** Next 14's App Router is the future line (layouts, streaming, RSC); route groups `(auth)` / `(dashboard)` gave us layout-level guards (one dashboard shell instead of per-page checks). **Why not Next 15?** We pinned the stable 14.2.x line our code was built and E2E-tested on — no framework upgrades days before delivery.

**Why not Vue/Angular/Svelte?** Team skill + React ecosystem (recharts, framer-motion, socket.io-client) — the question is about fit, not religion.

---

## 2. "Why plain JavaScript and not TypeScript?"

Honest answer (don't dodge):
1. **Scope & speed** — full-stack build with AI/realtime/auth in a hackathon timeline; TS types would have slowed iteration on a 100% greenfield app.
2. **Runtime safety already present** — the *boundaries* are typed with **Zod** (every API request is parsed/validated server-side) and the response envelope is consistent (`{success, message, data}`). Most TS value comes at module boundaries — we validated those instead.
3. **Zero friction to run** — no compile step confusion for reviewers; `npm run dev` just works.
4. **Migration path** — Next + Mongoose both support gradual typing; we'd rename `.js → .tsx/.ts` incrementally starting with `lib/api.js` and models. (Say this — judges love "we know the trade-off" answers.)

---

## 3. "Why that backend?" — Express, not Django/Nest/Fastify/Laravel

- **One language across the stack** (JS) → shared JSON shapes, faster dev, one ecosystem for UI+API+websocket.
- **Express** = industry-standard minimalism: middleware composition fits our cross-cutting concerns (helmet → cors → rate-limit → routes → error handler), huge hiring/教程 base.
- **Why not NestJS?** Nest's DI/decorators shine in large teams; for ~14 routes it's ceremony. Our "services" folder already delivers the testable-business-logic benefit Nest would give.
- **Why not Fastify?** Faster raw throughput, but Express's ecosystem and our team's familiarity won; at our scale (demo users) the difference is microseconds.
- **Why not Django/Laravel?** Would split the codebase into two languages; requires ORM/template rewrites of everything the frontend already does.
- **Why REST, not GraphQL?** Fixed, dashboard-shaped data needs; REST + our envelope is cacheable, simple to E2E-test; GraphQL adds a server runtime + client cache layer with no gain here.

---

## 4. "Why MongoDB, not SQL/Postgres?" *(expect this hard)*

**For us:**
1. **Data shape** — transactions/budgets/tips/notifications are nested JSON-ish documents; Mongoose schemas map 1:1 to the API envelope; no impedance mismatch.
2. **Iteration speed** — schema evolution (e.g., adding `flags[]`, `aiSuggested` on transactions) is a code change, not migrations, during a fast build.
3. **Managed free tier** — Atlas gives us backups/monitoring/an IP allow-list on day one (this project literally runs on Atlas).
4. **JSON-native app** — the API returns documents; Mongo returns documents; zero transformation layer.

**Honest SQL counter (if pushed):** finances *are* relational (users→transactions→categories→budgets) and SQL gives stronger guarantees (joins, ACID multi-row transactions, stricter types). Our mitigations: Mongoose references + `populate` for joins, integer-ish amounts in one currency (BDT), and we'd add indexes + Mongo multi-doc transactions as data grows. **When we'd switch:** heavy cross-entity reporting/analytics, strict accounting ledgers, or regulatory requirements → Postgres. At student-app scale, Mongo's velocity > SQL's guarantees.

---

## 5. "Why MVC? Why not the Repository Pattern?" *(you specifically asked this)*

**How our MVC actually looks:**

```
HTTP → routes (pure wiring) → middlewares (auth/rate-limit/validate)
     → controllers (HTTP glue: parse req, call service, send envelope)
     → services (ALL business logic: budgets, AI, tips, mail, alerts)
     → models (Mongoose schema + small helpers)
```

**Why MVC:**
1. **Predictable navigation** — a judge can pick any feature and follow one path; folders map to responsibilities.
2. **Thin controllers** (stated project philosophy) — controllers never hold logic, so the same logic is callable from a script (seeds) or a future mobile API.
3. **Right-sized for the team/timeline** — the classic trade: structure that prevents chaos without enterprise ceremony.
4. **Services layer = the good part of DDD** without full DDD: `ai/`, `mail.service`, `tipsEngine`, `budgetAlerts`, `recurring` are pure functions over data → unit-testable in isolation.

**Why not Repository Pattern (and when we would):**
- Repositories wrap *every* model behind an interface (`userRepo.find…`) so storage can swap and tests can mock. With **Mongoose, models already are that abstraction layer** — adding repos would double the file count (Model + Repo) while giving us exactly one storage engine.
- Repo pay-off grows with: multiple data sources, heavy unit-test mocking, teams > 8, or swapping ORM. None applied here → **YAGNI**.
- **But we didn't ignore its spirit**: services depend on models only through Mongoose's query API (not raw driver), so extracting repositories later is mechanical. If asked "show me where you'd add it": `services/*` call sites.

**One-liner:** *"We used MVC with a services layer — the pragmatic 80% of what repository/hexagonal patterns buy, for 20% of the ceremony — because our storage is a single Mongoose-backed database."*

---

## 6. "Why those auth decisions?"

- **JWT access (15 min) + refresh (7 d)**: access token lives in `sessionStorage` (XSS can't easily reach it *and* we auto-rotate), refresh lives in an **HTTP-only cookie** (JS can't read it → refresh theft is hard).
- **Cookie `SameSite=Lax` + `Secure` in prod**: CSRF-resilient for state-changing POSTs from third-party origins; our API only accepts credentialed requests from the `CLIENT_URL` allow-list.
- **bcryptjs (not bcrypt)**: pure-JS build → no native compilation failures on Windows/CI (real friction we avoided).
- **Rate limits**: 30 req/15 min on auth endpoints (OTP/brute-force), 500/15 min globally — prevents hammering in demos and abuse in prod.
- **Why not sessions?** Stateless JWT needs no server-side session store → horizontally scalable later; refresh cookie keeps us revocable-ish (delete refresh / rotate on login).
- **OTP email verification**: proves email ownership with nodemailer; dev fallback prints the code to the console so the demo works with zero SMTP config.

---

## 7. "Why Socket.io, not plain WebSockets or polling?"

- **Auto-upgrade**: starts HTTP-long-polling (works through proxies/tunnels — our ngrok demo proves it) then upgrades to WebSocket.
- **Reconnect + heartbeats** built in — plain `WebSocket` API gives none of this.
- **Rooms by user id** (`user:{id}`) → targeted notifications (budget alerts, announcements, live transaction events) without broadcasting everything.
- **JWT in the handshake** (`auth: {token}`) — same middleware-style verification as REST.
- Why not SSE? One-directional only (we may later command the client), and no fallback story like polling→WS.

---

## 8. "Why that AI design?" (reliability is the selling point)

```
User question → intent routes:
  ├─ smalltalk (hi/thanks/bye) → instant canned reply (no LLM)
  ├─ purchase/safety questions → personalAdvisor (safe-to-spend + daily burn + verdict-first prompt)
  ├─ other finance → general chat with light stats
  ├─ fallback: FAQ / category rule-engine
Provider chain for anything LLM:  Groq (free, fast) → OpenRouter → RULE ENGINE (never throws)
```

- **Why Groq first?** Free-tier speed (tokens/s) makes chat feel instant in demos; OpenRouter = second key = second chance; **local rules = zero-API floor** so judges never see an error (chat, insights, categorization, tips all degrade gracefully).
- **Why not OpenAI-only?** Cost + single point of failure; our abstraction (`ai/provider.js`) swaps models by env var.
- **Guardrails**: prompts cap length, force verdict-first answers with the user's real numbers, strip markdown, and unknown AI-suggested categories fall back to local rules (no "ghost categories").
- **Privacy**: only light aggregates (safe-to-spend, top categories) go into prompts — not the raw transaction list.

---

## 9. Data model (what to draw on the whiteboard)

```
User ──< Transaction >── Category (system: userId=null | custom: userId set)
  │─< Budget (per category/month, alert thresholds)
  │─< Notification / Tip (generated) / Bookmark / Insight
  │─  Profile: academicYear, allowanceBaseline, savingsGoal, currency, streak
Admin ──< Announcement (broadcast → socket → every online user)
PendingRegistration (OTP flow, TTL-expired)
```

- **Categories**: split `income`/`expense`, system-seeded every boot (12 defaults) + user-created — explains how a user's personalization works.
- **Aggregation**: dashboard/monthly stats via Mongoose aggregation pipelines (server-side), so the client never downloads full history (188-tx demo user still loads instantly).
- **Seeding**: deterministic PRNG seed script builds 6 months × 3 users so every demo/judging run is identical.

---

## 10. Request lifecycle (say this when asked "walk me through a request")

1. Browser `fetch('/api/v1/transactions', …)` → Next rewrite → Express (single origin, no CORS preflight).
2. `helmet` (headers) → `cors` (allow-list) → `express-rate-limit` (500/15 m) → JSON parse → route.
3. `protect` middleware: Bearer **or** cookie access token → JWT verify → `req.user`.
4. Zod validator (where present) → controller → **service** (business rules: budget math, AI categorization, alert emission) → Mongoose.
5. Controller wraps `{success, message, data}` → client `api.js` reads `res.data.*`.
6. Side effects (alerts, tips) → `emitToUser` → other connected tabs get live toasts via Socket.io.

---

## 11. Deployment story (prep done, hosting decision pending)

- **Client → Vercel** (root dir `client/`): envs `NEXT_PUBLIC_API_URL=/api/v1`, `API_PROXY_URL=<api>`, `NEXT_PUBLIC_WS_URL=wss://<api>`.
- **Server → Render** (`render.yaml` blueprint: build `npm install`, start `npm start`, health `/api/v1/health`, env placeholders), **MongoDB Atlas** for data.
- **Prod safety rails already coded**: `NODE_ENV=production` ⇒ Atlas-first and **exit(1)** if DB fails (never silently runs empty); `trust proxy` for correct client IPs; rewrites parameterized (no localhost in prod config).
- **Current demo**: local dev servers + **ngrok tunnel** (same-origin proxying, exactly how prod will behave).
- **Future updates**: `git push` → both platforms auto-redeploy; secrets edited in dashboards.
