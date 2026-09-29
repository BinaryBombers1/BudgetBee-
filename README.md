# Campus Coin — Student Budget Tracker

**Campus Coin (BudgetBee)** is a full-stack web application that helps students track income,
expenses, budgets and spending habits, with monthly reports (PDF export + email share), AI-powered
insights, voice input, and an admin panel.

It is two independent npm projects in one repository:

| Folder   | What it is                                        | Default port |
| -------- | ------------------------------------------------- | ------------ |
| `server/` | Express 4 + Mongoose REST API (Node.js, ESM)      | `5000`       |
| `client/` | Next.js 14 App Router web app (React, Tailwind)   | `3000`       |

There is **no root `package.json`** and no workspaces — install and run each project separately.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick start](#quick-start)
5. [Environment variables](#environment-variables)
6. [Database](#database)
7. [Seed data & demo accounts](#seed-data--demo-accounts)
8. [Email setup (OTP, password reset, report sharing)](#email-setup)
9. [AI setup (optional)](#ai-setup-optional)
10. [Voice input & read-aloud](#voice-input--read-aloud)
11. [Production build](#production-build)
12. [Deployment](#deployment)
13. [Project structure](#project-structure)
14. [API reference](#api-reference)
15. [npm scripts](#npm-scripts)
16. [Troubleshooting](#troubleshooting)

---

## Features

- **Authentication** — email + password, OTP verification, forgot/reset password, JWT access +
  refresh tokens (auto-refresh on 401), separate admin login.
- **Dashboard** — balance, income vs expense, 6-month trend, daily/weekly summary, recent
  transactions, month switcher.
- **Transactions** — create / edit / delete, search, filter by category/type/date range, bulk import.
- **Categories** — system defaults (seeded on every boot) + custom per-user categories, income and
  expense sides, color + icon.
- **Budgets** — monthly per-category budgets with progress bars and over-budget alerts.
- **Reports** — category breakdown, 6-month trend, daily/weekly summary, custom date-range report,
  linear forecast, **PDF export** (generated in the browser) and **share by email** (the server
  attaches the PDF and sends it through SMTP).
- **Insights & tips** — AI-generated spending insights (Groq / OpenRouter) with a built-in rule
  fallback so it works with **no API keys**; daily tips with streaks.
- **Voice** — accent-tolerant voice input for adding transactions / asking questions, plus
  read-aloud of bot replies (free neural TTS with browser fallback).
- **Notifications, bookmarks, announcements** — in-app notifications, saved/bookmarked insights,
  admin announcements.
- **Admin panel** — user management (activate/deactivate, reset password, delete), system-wide
  stats, category and announcement management.
- **Realtime** — Socket.io for notifications/tips (authenticated handshake).
- **Public pages** — how-it-works, privacy, terms, sitemap.

## Tech stack

| Layer     | Technology |
| --------- | ---------- |
| Frontend  | Next.js 14 (App Router), React 18, plain JS/JSX, Tailwind CSS 3, Zustand, Framer Motion, Recharts |
| PDF       | jsPDF + html2canvas (client-side capture & export) |
| Backend   | Node.js, Express 4, ESM (`"type": "module"`), MVC + service layer |
| Database  | MongoDB via Mongoose 8 — local mongod, MongoDB Atlas, or automatic in-memory fallback |
| Auth      | JWT (access 15m / refresh 7d), bcryptjs, `Authorization: Bearer` or `accessToken` cookie |
| Realtime  | Socket.io 4 (JWT-verified handshake) |
| Mail      | Nodemailer (SMTP, e.g. Gmail app password) with console fallback in development |
| AI        | Groq → OpenRouter → local rule-based fallback (works with no keys) |
| Validation| Zod (request bodies via `validate(...)` middleware) |
| Other     | Helmet, CORS, express-rate-limit, dotenv |

## Prerequisites

- **Node.js 18.17+** (Node 20 LTS recommended) and **npm 9+** — check with `node -v`
- **Git**
- **MongoDB (optional)** — any of:
  - a local MongoDB server (`mongodb://127.0.0.1:27017`), or
  - a MongoDB Atlas cluster (connection string), or
  - **neither** — the server automatically falls back to an ephemeral in-memory MongoDB
    (see [Database](#database))
- A modern browser. Voice input works best in **Chrome / Edge** (Web Speech API).

> Windows, macOS and Linux all work — commands below use plain `bash`/`npm`.

---

## Quick start

### 1. Clone the repository

```bash
git clone <repo-url> campus-coin
cd campus-coin
```

### 2. Set up the server (terminal 1)

```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `server/.env` and set at minimum the three **required** values:

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.mongodb.net/campuscoin
JWT_ACCESS_SECRET=any_random_string_at_least_8_chars
JWT_REFRESH_SECRET=another_random_string_at_least_8_chars
```

- **No Atlas cluster?** Point `MONGODB_URI` at your local MongoDB too
  (`mongodb://127.0.0.1:27017/campuscoin`) — the variable must simply be non-empty.
- **No MongoDB at all?** Use any placeholder URI (e.g. the local one); if every connection attempt
  fails the server boots an in-memory database instead (data resets on every restart).
- All other variables are optional — see [Environment variables](#environment-variables).

Then start it:

```bash
npm run dev          # node --watch src/server.js  → http://localhost:5000
```

Verify:

```bash
curl http://localhost:5000/api/v1/health
# {"success":true,"message":"OK","data":{"status":"up",...}}
```

On boot you should see one of:

```
✅ MongoDB connected (Local): 127.0.0.1
✅ MongoDB connected (Atlas): cluster0.mongodb.net
⚠️  Using ephemeral in-memory MongoDB (data resets on restart)
```

### 3. Set up the client (terminal 2)

```bash
cd client
npm install
```

No environment variables are required for local development — by default the app proxies
`/api/v1` and `/socket.io` to `http://localhost:5000` (see `client/next.config.mjs`).
Optional `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=/api/v1      # relative → proxied by Next
NEXT_PUBLIC_WS_URL=              # empty → same-origin /socket.io
```

Then start it:

```bash
npm run dev          # next dev  →  http://localhost:3000
```

Open **http://localhost:3000** and log in with a demo account (below) or register a new one.

### 4. (Optional) seed demo data

```bash
cd server
npm run seed          # idempotent: admin + demo user + system categories
npm run seed:reset    # DESTRUCTIVE: wipes the Atlas DB and reseeds 4 users with months of data
```

---

## Environment variables

All server variables live in **`server/.env`** (copy `server/.env.example`). The file is validated
with zod **at startup** — on missing/invalid values the server prints the field errors and exits.

### Required

| Variable            | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `MONGODB_URI`       | MongoDB connection string (Atlas, or any non-empty URI)         |
| `JWT_ACCESS_SECRET` | Random string (min 8 chars) for short-lived access tokens       |
| `JWT_REFRESH_SECRET`| Random string (min 8 chars) for refresh tokens                  |

### Optional — server

| Variable              | Default                                    | Description |
| --------------------- | ------------------------------------------ | ----------- |
| `PORT`                | `5000`                                     | API port |
| `NODE_ENV`            | `development`                               | `development` \| `production` \| `test` |
| `CLIENT_URL`          | `http://localhost:3000`                     | CORS origin + reset links |
| `MONGODB_LOCAL_URI`   | `mongodb://127.0.0.1:27017/campuscoin`      | Local fallback URI |
| `MONGODB_TIMEOUT_MS`  | `8000` (use `45000` if Atlas TLS is slow)   | Atlas connection timeout |
| `TRY_ATLAS_FIRST`     | unset (local first in dev)                  | `true` = try Atlas before local |
| `FORCE_ATLAS`         | unset                                       | `true` = never fall back to in-memory DB |
| `JWT_ACCESS_EXPIRES`  | `15m`                                       | Access token lifetime |
| `JWT_REFRESH_EXPIRES` | `7d`                                        | Refresh token lifetime |
| `GROQ_API_KEY` / `GROQ_MODEL`         | empty | AI insights/chat (optional) |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | empty | AI fallback provider (optional) |
| `SMTP_HOST`           | empty                                       | e.g. `smtp.gmail.com` — enables real email |
| `SMTP_PORT`           | `587`                                       | SMTP port (587 = STARTTLS) |
| `SMTP_SECURE`         | `false`                                     | `true` for port 465 |
| `SMTP_USER`           | empty                                       | SMTP login (e.g. your Gmail address) |
| `SMTP_PASS`           | empty                                       | SMTP password (Gmail: app password) |
| `MAIL_FROM`           | `Campus Coin <no-reply@campuscoin.app>`     | From header |

### Optional — client (`client/.env.local`)

| Variable               | Default     | Description |
| ---------------------- | ----------- | ----------- |
| `NEXT_PUBLIC_API_URL`  | `/api/v1`   | API base; relative paths are proxied to the server |
| `NEXT_PUBLIC_WS_URL`   | empty       | Socket.io URL; empty = same origin (proxied) |
| `API_PROXY_URL`        | `http://localhost:5000` | *(server-side only)* rewrite target for `/api/v1` and `/socket.io` |

---

## Database

On every boot the server tries to connect in this order (`server/src/config/db.js`):

1. **Development:** Local → Atlas. **Production (or `TRY_ATLAS_FIRST=true`):** Atlas → Local.
2. The pair is retried **3 times** with a 5-second pause (Atlas TLS can be flaky).
3. If everything fails:
   - **development** → boots an ephemeral **in-memory MongoDB** so the app still runs
     (⚠️ *all data is lost on restart*; re-register or re-seed).
   - **production** (or `FORCE_ATLAS=true`) → refuses to start (`process.exit(1)`).

Always check the startup log to know which database you are on.

**Seeding behaviour**

- System (default) categories are auto-seeded on **every server boot**.
- Registration does **not** create per-user categories — users start with the system defaults and
  can add their own (`POST /api/v1/categories`).
- Money is stored in **BDT**; categories are split into `income` / `expense`.

---

## Seed data & demo accounts

| Command           | Effect |
| ----------------- | ------ |
| `npm run seed`    | Idempotent — creates 1 admin + 1 demo student + system categories |
| `npm run seed:reset` | **Destructive** — wipes the connected Atlas database and rebuilds 1 admin + 3 students with 6 months of transactions, budgets, notifications, tips, bookmarks and custom categories (deterministic, re-runnable). Refuses to run unless actually connected to Atlas. |

Run seeds from the `server/` directory. Accounts after seeding:

| Email                   | Password  | Role    |
| ----------------------- | --------- | ------- |
| `admin@campuscoin.app`  | `Admin@123` | Admin |
| `demo@campuscoin.app`   | `Demo@123`  | Student |
| `rafi@campuscoin.app`   | `Rafi@123`  | Student *(only after `seed:reset`)* |
| `nusrat@campuscoin.app` | `Nusrat@249`| Student *(only after `seed:reset`)* |

No seed? Just **register** from the UI — in development the OTP is printed to the server console.

> With the in-memory fallback, a separately-running seed script gets its *own* empty database and
> cannot populate the running server — in that mode register through the UI instead.

---

## Email setup

Used for: **OTP registration**, **password reset**, and **report sharing (PDF attachment)**.

1. Create a Gmail app password (Google Account → Security → 2-Step Verification → App passwords).
2. Fill in `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_address@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=Campus Coin <no-reply@campuscoin.app>
```

Without SMTP configured (or when a send fails in development) the app **still works**:

- OTPs print to the server console as `[OTP] email -> code` and are returned as `devOtp`
- reset links print as `[RESET LINK] <url>` and are returned as `devResetUrl`
- report shares log `[SHARE DEV] …` and the UI still reports success (in production a failed
  send returns HTTP 502 instead)

In development, verify a real send by looking for `[MAIL] "<subject>" -> <recipient>` in
`server/dev-run.log` / the server console.

---

## AI setup (optional)

AI insights and chat resolve in this order: **Groq → OpenRouter → local rule fallback**
(`server/src/services/ai/provider.js`). With no keys configured every AI feature still answers
using deterministic rules — nothing hard-fails. Add keys only if you want model-generated output:

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
OPENROUTER_API_KEY=sk-or-...
```

---

## Voice input & read-aloud

Works out of the box, no keys required:

- **Input** — hold/toggle the mic and speak; the browser's Speech Recognition transcribes and a
  tolerant parser (`client/src/lib/voice/`) turns phrases like *"add 250 taka for lunch"* into a
  transaction or a question. Best in Chrome/Edge.
- **Read-aloud** — bot replies are spoken with a free neural TTS engine, falling back to the
  browser's built-in speech synthesis.
- `GET /api/v1/voice/status` reports which TTS engine the server picked.

---

## Production build

**Server**

```bash
cd server
NODE_ENV=production npm start     # requires a real MongoDB — in-memory fallback is refused
```

**Client**

```bash
cd client
npm run lint          # optional: ESLint (core-web-vitals)
npm run build         # next build
npm start             # next start  →  http://localhost:3000
```

> ⚠️ Stop `npm run dev` **before** running `npm run build` — `next dev` and `next build` share the
> `.next/` folder and building while dev is running breaks the dev server (missing chunks/CSS).

For a deployed API set (client side): `API_PROXY_URL` (Next server) and/or `NEXT_PUBLIC_API_URL`
(full API URL — then also allow your client origin in the server's `CLIENT_URL` / CORS).

---

## Deployment

The app runs as two deployed parts:

| Part | Host | URL |
| --- | --- | --- |
| Client (Next.js) | Vercel | https://campus-coin-theta.vercel.app |
| API (Express) | Railway | https://campus-coin-api-production.up.railway.app |

**API — Railway**

- Root directory `server`, start `npm start`; Railway provides `PORT` and probes `/api/v1/health`.
- Env: `NODE_ENV=production`, `MONGODB_URI` (a real Atlas URI is mandatory — production refuses
  the in-memory fallback), `MONGODB_TIMEOUT_MS=45000`, JWT secrets, SMTP keys for share/reset
  emails, and `CLIENT_URL` = the Vercel URL (used for CORS and links inside emails).

**Client — Vercel**

- Root directory `client`, otherwise defaults (Next.js is auto-detected).
- Set `API_PROXY_URL` = the Railway URL. The Next server then rewrites `/api/v1/*` and
  `/socket.io/*` to the API, so the browser only ever talks same-origin — no CORS config and no
  `NEXT_PUBLIC_API_URL` needed anywhere.

---

## Project structure

```
techwiz/
├── README.md                 ← you are here
├── client/                   ← Next.js 14 app
│   ├── jsconfig.json         ← path alias @/* → src/*
│   ├── next.config.mjs       ← rewrites /api/v1 + /socket.io → API
│   ├── tailwind.config.js
│   └── src/
│       ├── app/
│       │   ├── (auth)/       ← login, register, forgot password …
│       │   ├── (dashboard)/  ← dashboard shell (sidebar/topbar guard) + all app pages
│       │   └── (public)/     ← how-it-works, privacy, terms
│       ├── components/       ← ui/ (Button, Card, Modal, …), layout/, charts/, …
│       ├── lib/              ← api client, voice parsers, helpers
│       └── store/            ← Zustand stores
└── server/                   ← Express API
    ├── .env.example          ← copy to .env
    └── src/
        ├── server.js         ← boot: env → DB → system categories → HTTP + Socket.io
        ├── app.js            ← express app (helmet, cors, rate limits, routes)
        ├── config/           ← env.js (zod validation), db.js, socket.js
        ├── routes/           ← one file per resource, wired in routes/index.js
        ├── controllers/      ← HTTP glue only
        ├── services/         ← business logic (mail, ai, insights, …)
        ├── models/           ← Mongoose schemas
        ├── middleware/       ← protect, adminOnly, validate, rate limiters
        ├── utils/            ← response envelope, asyncHandler, …
        └── seeds/            ← seed.js (idempotent) + seedAtlas.js (reset)
```

---

## API reference

- **Base path:** `http://localhost:5000/api/v1` (the client calls the same-origin proxy
  `/api/v1`, which rewrites to the server).
- **Response envelope:** every endpoint returns

  ```json
  { "success": true, "message": "…", "data": { } }
  ```

- **Auth:** send `Authorization: Bearer <accessToken>` (the client stores it in
  `sessionStorage` and auto-refreshes on 401) or an `accessToken` cookie.
  Admin endpoints additionally require the admin role (`adminOnly`).
- **Rate limits:** `500 requests / 15 min` per IP for `/api`, `30 / 15 min` for auth endpoints
  (429 = slow down).

| Resource        | Endpoints |
| --------------- | --------- |
| `/health`       | `GET` service health |
| `/auth`         | `POST request-otp`, `verify-otp`, `register`, `login`, `admin-login`, `logout`, `refresh`, `forgot-password`, `reset-password`; `GET me` |
| `/users`        | `GET` profile, `PATCH` update, `PATCH /password` |
| `/categories`   | `GET POST PATCH DELETE` |
| `/transactions` | `GET POST PATCH DELETE`, `GET /recent`, `POST /import` |
| `/budgets`      | `GET POST DELETE` |
| `/dashboard`    | `GET` aggregated dashboard |
| `/reports`      | `GET /category /trend /daily-weekly /filtered /forecast`, `POST /share` (PDF email) |
| `/tips`         | `GET POST /refresh PATCH /:id/status` |
| `/bookmarks`    | `GET POST DELETE` |
| `/notifications`| `GET`, `PATCH /read-all`, `PATCH /:id/read` |
| `/ai`           | `GET /status`, AI insights/chat endpoints |
| `/voice`        | `GET /status` |
| `/announcements`| `GET POST PATCH DELETE` |
| `/admin`        | `GET /stats`, `GET /users`, `PATCH /users/:id/toggle`, `PATCH /users/:id/reset-password`, `DELETE /users/:id`, category + announcement management |

Socket.io shares the same HTTP server; the client handshake must include
`auth: { token: <accessToken> }` (verified in `server/src/config/socket.js`).

---

## npm scripts

**`server/`**

| Script            | Command                         | What it does |
| ----------------- | ------------------------------- | ------------ |
| `npm run dev`     | `node --watch src/server.js`    | Dev server with auto-reload |
| `npm start`       | `node src/server.js`            | Production |
| `npm run seed`    | `node src/seeds/seed.js`        | Idempotent demo seed |
| `npm run seed:reset` | `node src/seeds/seedAtlas.js` | Destructive Atlas reseed |

**`client/`**

| Script         | Command         | What it does |
| -------------- | --------------- | ------------ |
| `npm run dev`  | `next dev`      | Dev server (:3000) |
| `npm run build`| `next build`    | Production build (stop `dev` first!) |
| `npm start`    | `next start`    | Serve the production build |
| `npm run lint` | `next lint`     | ESLint (core-web-vitals) |

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Server exits with `❌ Invalid environment variables` | Copy `server/.env.example` → `server/.env` and set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` |
| Server exits: `MongoDB unavailable in production` | You set `NODE_ENV=production` without a reachable MongoDB — provide a working `MONGODB_URI` |
| Logins fail / empty DB after a restart | You were on the in-memory fallback — check the boot log line; point `MONGODB_URI` at a real DB or re-seed via the UI |
| First boot takes ~30–60 s | Atlas connection retries (3 rounds × 5 s) — or set `MONGODB_TIMEOUT_MS=45000` for slow TLS networks |
| OTP email never arrives | In development it's printed to the server console as `[OTP] …` — configure SMTP (above) for real delivery |
| Report share says success but no email (dev) | Check the server log for `[SHARE DEV]` (send failed) vs `[MAIL]` (accepted by SMTP) |
| `EADDRINUSE` on 5000/3000 | Another process holds the port — stop it or change `PORT` / run Next on another port (`next dev -p 3001`) |
| Pages 404 their CSS/JS after building | `next dev` and `next build` share `.next/` — stop the dev server, rebuild, restart |
| API calls 429 (Too Many Requests) | Rate limit (500/15 min; auth 30/15 min) — wait 15 minutes or restart the server |
| Client can't reach the API | Ensure the server runs on `:5000`, or set `API_PROXY_URL` / `NEXT_PUBLIC_API_URL` accordingly |
| Voice mic unavailable | Use Chrome/Edge and grant microphone permission (needs HTTPS or localhost) |
| AI answers look "rule-based" | No `GROQ_API_KEY`/`OPENROUTER_API_KEY` set — that's the intended offline fallback |
