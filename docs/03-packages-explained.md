# Campus Coin — Packages: what each one does & why we chose it

> Accurate as of `package.json` (client + server). If asked about any dependency, this is your sheet.

---

## Server dependencies (`server/package.json`)

| Package | What it does here | Why this one |
|---|---|---|
| **express** `^4.19` | HTTP server: routing, middleware pipeline, `/api/v1` endpoints | Industry-standard, minimal, middleware model fits our cross-cutting concerns (helmet→cors→rate-limit→routes→error) |
| **mongoose** `^8.5` | MongoDB ODM: schemas, validation, `populate`, aggregation pipelines | Turns documents into typed-ish models; models = our data layer in MVC |
| **socket.io** `^4.8` | Websocket server: rooms (`user:{id}`), JWT handshake auth, live notifications/budget alerts/announcements | Auto fallback polling→WS + reconnect; plain `ws` would need all that by hand |
| **jsonwebtoken** `^9.0` | Sign/verify access (15 m) + refresh (7 d) JWTs | Stateless auth → no session store → scales horizontally |
| **bcryptjs** `^2.4` | Password hashing (salted, cost-factor) | Pure JS → no native build failures (the classic `bcrypt`-on-Windows trap) |
| **cookie-parser** `^1.4` | Parses the HTTP-only refresh cookie into `req.cookies` | Needed for the refresh-token flow |
| **cors** `^2.8` | Allow-list (`CLIENT_URL` + localhost) with `credentials: true` | Explicit origin control instead of `origin: *` (security) |
| **helmet** `^7.1` | Sets secure HTTP headers (XSS, content-type, frameguard…) | One line = big chunk of OWASP header hygiene |
| **express-rate-limit** `^7.4` | 500 req/15 min global; 30 req/15 min on auth endpoints | Brute-force/OTP-abuse/demo-hammering protection |
| **zod** `^3.23` | Request payload schemas → parse + typed errors (`Validation failed`) | One schema = validation + error shape; central to "no raw errors reach UI" |
| **nodemailer** `^10.0` | SMTP emails: OTP verification + password-reset links, branded HTML | Real mail in prod; auto-falls back to console `[OTP]` with no SMTP (demo-safe) |
| **dotenv** `^16.4` | Loads `server/.env` into `process.env` | Secrets stay out of git |
| **csv-parse** `^7.0` + **papaparse** `^5.7` | *(declared for server-side parsing of uploaded statement files — currently import parsing runs client-side and posts structured rows; these are the ready-to-use libs if/when we move parsing server-side for security)* | Battle-tested CSV handling (quotes, BOM, messy wallet exports) |
| **socket.io-client** `^4.8` | *(present for server-side scripts/testing; live client usage is in the web app)* | Kept for smoke scripts |
| **mongodb-memory-server** (dev) | Fallback in-memory Mongo when Local+Atlas are unreachable — **development only** | Lets the demo boot with zero DB setup; prod build **refuses** this path (exit 1) |

**Scripts**: `dev` = `node --watch src/server.js` (hot reload), `start` = `node src/server.js`, `seed`, `seed:reset` (guarded Atlas wipe+reseed with 6 months of deterministic data).

---

## Client dependencies (`client/package.json`)

| Package | What it does here | Why this one |
|---|---|---|
| **next** `14.2.35` | Framework: App Router pages/layouts, builds, static prerender, **rewrites proxying `/api/v1` → Express** | SSR/static landing, file routing, same-origin API (cookies/CORS-free) |
| **react** + **react-dom** `^18` | UI library under Next | The view layer; Next *is* React |
| **zustand** `^5.0` | Global stores: `auth`, `ui`, `notifications` (+ tiny pub/sub) | ~1 KB, no boilerplate; Redux would be overkill, Context re-renders too much |
| **tailwindcss** `^3.4` (dev) | Utility CSS, design tokens via config (dark theme, fonts) | Speed + consistency; purged to a tiny prod CSS bundle |
| **recharts** `^3.10` | Dashboard/reports charts (spend by category, trends) | React-native declarative API, composable with our cards |
| **framer-motion** `^13.4` | Page/card animations, transitions, micro-interactions | Declarative motion; keeps UX feeling polished (visual judge points) |
| **lucide-react** `^1.48` | All UI icons (stroke style, consistent) | Free, tree-shaken, cohesive icon language |
| **socket.io-client** `^4.8` | Connects to the API socket with `auth.token`, handles live toasts/announcements | Pairs with server socket.io; polling fallback works through tunnels/proxies |
| **react-hook-form** + **@hookform/resolvers** | Declared for form handling with resolver-based validation (current forms are kept simple/controlled; ready to adopt) | Low-re-render forms if/when we scale input-heavy screens |
| **date-fns** `^4.4` | Date formatting/parsing ("Sep 2026", month ranges, streak math) | Tree-shakeable, immutable, locale-friendly (vs heavy Moment) |
| **papaparse** `^5.7` | Client-side CSV preview for **transaction import** (drag-drop statement files) | Parses messy CSV in-browser before upload — instant preview |
| **jspdf** `^4.2` | Generates **PDF reports** (reports page + tips export) | Client-side PDF = no server rendering cost |
| **html2canvas** `^1.4` | Turns rendered chart/DOM nodes into images for the PDF | Chart → snapshot → embed in jsPDF |
| **canvas-confetti** `^1.9.4` | Celebration burst when a savings goal/goal-state hits | Cheap delight → habit reinforcement (gamification) |
| **eslint** + **eslint-config-next** (dev) | `npm run lint` = next/core-web-vitals rules | Quality gate (runs before every build in our workflow) |
| **postcss** (dev) | Tailwind's CSS pipeline | Required by Tailwind 3 |
| **prettier** (dev) | Available formatter | Consistency when formatting |

**What we deliberately did NOT add (great "why not" answers):**

| Skipped | Why |
|---|---|
| **TypeScript** | Timeline; boundaries validated with Zod instead; migration path documented (see 02) |
| **Redux / Redux Toolkit** | Zustand covers global state in ~1 KB with zero boilerplate |
| **Axios** | Native `fetch` + one wrapper (`lib/api.js`) already does interceptors: auto-refresh on 401, friendly errors, envelope unwrapping |
| **TanStack Query / SWR** | Nice caching layer, but our data needs (dashboard reload after mutations) are simple; Zustand + refetch is enough — would adopt first at scale |
| **Passport.js** | JWT flow is ~50 lines; strategies would add surface area for no gain |
| **Joi / Yup** | Zod already validates server-side; two validators = duplicate schemas |
| **Prisma / Drizzle** | Would replace Mongoose for SQL — we chose Mongo (see 02 §4) |
| **MUI / Bootstrap** | Design freedom + bundle size; Tailwind gives our own design language |
| **Moment.js** | Legacy, heavy, mutable — date-fns is the modern default |
| **React Native / Expo** | Scope: responsive web first; API is mobile-ready (REST + JWT) if we extend |
