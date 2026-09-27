# Campus Coin — Project & Business Guide

> Part of the judge-prep pack: `README` → **01 Project & Business** → 02 Tech Stack → 03 Packages → 04 Judge Q&A → 05 Future UX

---

## 1. What is Campus Coin (30-second answer)

Campus Coin ("NextGen BudgetBee") is a responsive, full-stack **student budget tracker** that lets college/university students log income and expenses in seconds, see spending by category, and get **plain-language, AI-assisted guidance** built on their own transaction history — no bank link, no financial expertise, no subscription required. Its signature feature is **"safe to spend today"**: a live daily-burn number that tells a student exactly how much they can still spend today without breaking their monthly budget.

---

## 2. The Problem (from the official requirements, `extras/req.md`)

- Students receive money from **multiple, irregular sources** — monthly family allowance, part-time/gig income, scholarships, gifts — and rarely track where it goes.
- Existing personal-finance apps are built for **salaried adults** (fixed pay cycles, bank integrations), and are too complex, subscription-gated, or simply irrelevant to student spending: canteen food, hostel expenses, textbooks, transport, mobile recharge, subscriptions, social outings.
- Result: money disappears before month-end, overspending guilt, no visibility, and **bad financial habits form exactly during the years that matter most**.

**Demand exists** for a lightweight, student-first web app that makes it effortless to log income/expenses, view spending by category, and receive plain-language saving guidance.

---

## 3. Solution → Problem mapping

| Student pain | Campus Coin answer |
|---|---|
| "Where did my money go?" | 2-tap transaction entry, student-relevant default categories (Food, Transport, Mobile Recharge, Tuition, Cafe…) |
| "Can I afford this right now?" | **Safe-to-spend today** = (remaining budget ÷ days left) — live daily-burn |
| "I'll start budgeting tomorrow" | 1-tap budgets per category with live % bars and **auto alerts at 80%/100%** |
| "Budgeting apps are boring/judgy" | BudgetBee AI chat: purchase verdicts ("Wait — 13,997 BDT safe, phone costs 15,000"), jokes, encouragement |
| "I forget to log" | Streaks (login streak), confetti on goals, in-app + **realtime** notifications, CSV bulk import |
| "I hate spreadsheets" | Reports page: charts + **PDF export** (one click) |
| "What should I change?" | AI monthly insights + **personalized tips generated from your own history** (bookmarkable) |

---

## 4. Why will students actually use it? (worth-it argument)

1. **It answers the #1 daily question** — "how much can I spend today?" Generic apps show charts; we show a *decision*. Daily habit = daily retention.
2. **Zero friction**: no bank credentials, no credit card, registration with OTP email → 2 minutes to first value. (Non-functional requirement: must not require linked bank accounts.)
3. **It speaks student**: categories match real campus life (canteen, rickshaw/bus, hostel, recharge), amounts in **BDT**, academic year in the profile, semester-style spending patterns.
4. **It adapts to irregular income** — log a gig payment, budget recalculates; allowance-based months handled by design.
5. **Progress feels good**: streaks, goal celebrations (confetti), savings goal vs baseline allowance, tips that reference *your* numbers.
6. **It's fast on a phone** — mobile-first responsive UI, low data (single-page dashboard, ~90 KB JS first load).
7. **Privacy by default**: we never touch bank data — the student stays in control of what they type.

**Measurable worth (honest framing):** a student who logs daily for a month knows their real daily burn, catches category overruns *before* month-end, and can quantify savings vs their allowance. The demo data proves the loop: 4 users, 602 transactions, 6 months of history → insights/tips/alerts all fire from it.

---

## 5. Market & competition (why not just use X?)

| Existing options | Gap we fill |
|---|---|
| Money Manager / Walnut / 1money-type apps | Built for salaried adults & bank sync; ours is **student-first** (categories, allowance model, no bank link) |
| Spreadsheets / notebook | No guidance, no alerts, no AI — we're 10× faster with 1-click entry + import |
| Generic AI chatbots | No access to *your* real numbers — BudgetBee answers "should I buy this laptop?" with your actual safe-to-spend |
| Nothing (peer influence) | Overspending is social — we give a decision tool to say "no" with a number |

**Target users (beach-head):** individual students first → hostel communities → campus financial-literacy clubs/programs (explicit scope in req.md). Campus = built-in distribution channel (class groups, clubs, orientation weeks).

---

## 6. Business perspective (how could this sustain?)

*(Use if asked "is this a business or just a project?")*

- **Freemium AI**: free = tracking/budgets/rules-tips; **Pro** = unlimited BudgetBee chat, deeper AI insights, voice entry (~$1–2/mo student pricing, or local equivalent).
- **Campus partnerships**: banks/MFIs/wallets (bKash, Nagad, Rocket) reach students via literacy campaigns — Campus Coin can be the tool they sponsor (white-label or co-branded challenges).
- **Financial-literacy programs**: sell/offer workshops to universities using the app as the lab (aligns with the project's stated purpose).
- **Engagement economics**: streaks + goals + challenges drive habit; habit drives subscription conversion; data (anonymized, aggregated, opt-in) informs campus spending benchmarks.
- **Growth loops**: hostel leaderboards (opt-in), "split-a-budget" group features, campus ambassadors.

---

## 7. 60-second pitch (memorize this)

> "Money for students doesn't arrive like a salary — it's allowance this week, gig money next week, a gift after that — and it vanishes with zero visibility. Campus Coin is a student-first budget tracker built for exactly that. In under two minutes you log in, and every day after that it tells you one number: **how much you can still spend today**. It auto-categorizes your expenses with AI, warns you before a category blows up, and our AI 'BudgetBee' answers real questions like *'should I buy this phone?'* using your actual numbers — not generic advice. No bank link needed, works on any phone, and the whole thing is free. We built it full-stack with Next.js, Node/Express, MongoDB, and a resilient AI layer that still gives smart answers even when the LLM API is down."

---

## 8. 5-minute live demo flow (what to click)

1. **Login** → `demo@campuscoin.app` / `Demo@123` → land on dashboard → point at **Safe-to-spend today** + stat cards + charts.
2. **Add a transaction** (2 taps: amount + category) → watch budget bar/balance react.
3. **Budgets** → show 80%/100% alert behavior.
4. **BudgetBee chat** → ask "should I buy a laptop for 40,000?" → verdict-first answer with *their* numbers (works offline-LLM too — mention the fallback).
5. **Insights** → AI monthly narrative; **Tips** → personalized bookmarkable tips.
6. **Reports** → PDF export button.
7. **Realtime**: open two tabs → transaction in one → live notification in the other.
8. **Admin** (optional): login `admin@campuscoin.app` → manage users/categories/announcements → announcement hits all users live.

*(If asked to show AI with no API key: empty the key → rules engine still answers — reliability story.)*

---

## 9. Key numbers to quote confidently

- **Stack**: Next.js 14 (React 18) · Express 4 (Node, ESM) · MongoDB 8/Mongoose · Socket.io · Groq/OpenRouter + rule fallback.
- **Demo data**: 4 accounts (1 admin + 3 students), **602 transactions**, 14 budgets, 6 months history — deterministic seed, reproducible.
- **Perf (measured on this machine)**: production build serves pages in **23–135 ms** vs 0.6–5 s in dev mode.
- **Security**: bcrypt password hashing, JWT access (15 m) + refresh (7 d) tokens, HTTP-only refresh cookie, Helmet, CORS allow-list, Zod validation, rate limits (500/15 min API, 30/15 min auth).
- **Reliability**: AI provider chain Groq → OpenRouter → local rule engine (never fails); DB chain Local → Atlas → (dev-only) in-memory; **prod refuses to run on a fake DB**.
