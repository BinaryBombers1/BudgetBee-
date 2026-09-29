"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mic,
  Languages,
  MessageCircle,
  Volume2,
  ShieldCheck,
  Keyboard,
  Wallet,
  Bell,
  Target,
  Bot,
  FileDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { BeeMascot } from "@/components/ui/BeeLoader";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

const steps = [
  {
    n: "01",
    icon: Sparkles,
    title: "Create your account",
    desc: "Email + a one-time code, then set your allowance, currency, and a savings goal. Under a minute — no card, no bank hookup.",
    detail: "Verify with the OTP we email you and you're in. The demo account is one click away if you just want to look around.",
  },
  {
    n: "02",
    icon: Mic,
    title: "Log money in seconds — typed or spoken",
    desc: "Add income or expense from the form, or tap the mic and just say it: “50 taka for lunch today”. Amount, category, date and note fill themselves in.",
    detail: "Works in English, বাংলা and اردو — switch language with the chip next to the mic, review the filled form, hit save.",
  },
  {
    n: "03",
    icon: Target,
    title: "Set budgets that warn you early",
    desc: "Give every category a monthly limit. Campus Coin watches the pace and pushes a live alert the second you cross the line — mid-month, not after.",
    detail: "Streaks and savings goals keep the habit going; confetti fires when you actually hit the target.",
  },
  {
    n: "04",
    icon: Bot,
    title: "Ask your AI coach",
    desc: "“Can I afford a new phone this month?” — the chat widget answers from your real numbers, suggests categories as you type, and writes a plain-language monthly insight.",
    detail: "If the AI provider ever has a bad day, built-in local rules keep tips flowing — the coach never goes dark.",
  },
  {
    n: "05",
    icon: FileDown,
    title: "Review, report, repeat",
    desc: "Category donuts, 6-month trends, daily & weekly summaries, and one-click PDF export. Drop a bank or bKash statement to auto-categorize a whole month.",
    detail: "Everything stays searchable and editable — your data, exportable whenever you want it.",
  },
];

const micSpots = [
  {
    icon: Keyboard,
    title: "Add Transaction form",
    desc: "The mic sits between Amount and Category. Tap, speak, and the entry form fills itself — you review and save.",
  },
  {
    icon: MessageCircle,
    title: "AI chat widget",
    desc: "Speak your question instead of typing it. BudgetBee answers out loud; tap the mic again to interrupt and re-ask.",
  },
  {
    icon: Volume2,
    title: "Dashboard read-aloud",
    desc: "One tap on the speaker icon reads your money snapshot: balance, budget pace, and days left in the month.",
  },
];

const phrases = [
  { text: "50 taka for lunch today", lang: "English" },
  { text: "200 for rickshaw this morning", lang: "English" },
  { text: "received 5000 as allowance", lang: "English" },
  { text: "আজ দুপুরের খাবারে ৫০ টাকা", lang: "বাংলা" },
  { text: "ক্যান্টিনে ১২০ টাকা খরচ হলো", lang: "বাংলা" },
  { text: "آج کینٹین میں ২ৠ০ روپیے خرچ", lang: "اردو / हिन्दी" },
];

const voiceFacts = [
  { icon: Languages, text: "English · বাংলা · اردو — switch with the language chip" },
  { icon: Mic, text: "Mic listens only while the pulsing mic is active" },
  { icon: ShieldCheck, text: "Transcript only — audio is never stored by Campus Coin" },
  { icon: Volume2, text: "Replies spoken aloud; tap anywhere to interrupt" },
];

const perks = [
  { icon: Bell, title: "Realtime budget alerts", desc: "WebSocket push the moment a limit is threatened." },
  { icon: Wallet, title: "BDT-first tracking", desc: "Built around taka amounts, hostels and canteens." },
  { icon: Target, title: "Streaks & goals", desc: "Daily logging streaks with confetti on target hits." },
  { icon: FileDown, title: "PDF exports", desc: "Monthly reports, one click, ready to submit or share." },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-honey-500/12 blur-[110px]" />
          <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-honey-400/10 blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(rgba(245,158,11,0.9) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <motion.div {...fadeUp}>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-honey-500/35 bg-honey-500/12 px-4 py-1.5 text-xs font-semibold tracking-wide text-honey-700 dark:text-honey-300">
                <Sparkles className="h-3.5 w-3.5" />
                How it works
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.2rem] lg:leading-[1.08]">
                From pocket change to{" "}
                <span className="text-honey-600 dark:text-honey-400">a real plan</span> — in 5 moves
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base dark:text-zinc-400">
                Campus Coin turns allowances, canteen runs and rickshaw fares into a budget you
                actually keep. Log it by typing or by talking — BudgetBee does the bookkeeping.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-honey px-6 py-3 text-base shadow-honey">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#voice" className="btn-ghost px-6 py-3 text-base">
                  <Mic className="mr-2 h-4 w-4" /> See voice in action
                </a>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 rounded-3xl bg-honey-500/10 blur-3xl" aria-hidden="true" />
              <div className="glass-card relative mx-auto flex h-64 w-64 flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BeeMascot size={128} />
                </motion.div>
                <p className="text-sm font-semibold text-honey-700 dark:text-honey-300">
                  Your BudgetBee guide
                </p>
                <p className="px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  5 steps · ~2 minutes to set up · works in 3 languages
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5-step timeline */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="relative space-y-6">
          <div
            className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-honey-500/60 via-honey-500/25 to-transparent sm:block"
            aria-hidden="true"
          />
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }} className="relative sm:pl-20">
              <div className="absolute left-0 top-0 hidden h-14 w-14 items-center justify-center sm:flex">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-honey-500 to-honey-400 shadow-honey" />
                <span className="relative text-sm font-extrabold text-zinc-900">{s.n}</span>
              </div>
              <div className="glass-card-hover glass-card p-6">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-honey-500/20 to-honey-400/5 sm:hidden">
                    <s.icon className="h-5 w-5 text-honey-600 dark:text-honey-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold tracking-tight">{s.title}</h2>
                      <span className="text-xs font-bold text-honey-600 sm:hidden">STEP {s.n}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{s.desc}</p>
                    <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {s.detail}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Voice spotlight */}
      <section
        id="voice"
        className="relative scroll-mt-20 overflow-hidden border-y border-zinc-200 bg-white/50 py-20 dark:border-zinc-800 dark:bg-zinc-900/30"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-honey-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div {...fadeUp} className="mb-12 max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-honey-600 dark:text-honey-400">
              <Mic className="h-3.5 w-3.5" /> Voice
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Talk to your budget — it answers back
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Hands full, walking to class? Three mics around the app turn speech into entries,
              questions and spoken answers — in English, বাংলা and اردو.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {micSpots.map((m, i) => (
              <motion.div
                key={m.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="glass-card-hover glass-card p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-honey-500 to-honey-400 shadow-honey">
                  <m.icon className="h-5 w-5 text-zinc-900" />
                </div>
                <h3 className="font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{m.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            {/* Phrase chips */}
            <motion.div {...fadeUp} className="glass-card p-6">
              <p className="text-sm font-semibold">
                Just say it — <span className="text-honey-600 dark:text-honey-400">try these phrases</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Spoken to the mic, they fill the transaction form for you to review and save.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {phrases.map((p) => (
                  <span
                    key={p.text}
                    className="group inline-flex items-center gap-2 rounded-full border border-honey-500/30 bg-honey-500/10 px-3.5 py-1.5 text-xs font-medium text-honey-800 transition hover:-translate-y-0.5 hover:shadow-honey dark:text-honey-200"
                  >
                    <Mic className="h-3 w-3 opacity-60 transition group-hover:opacity-100" />
                    {p.text}
                    <span className="text-[9px] uppercase tracking-wider opacity-60">{p.lang}</span>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* How voice works + privacy */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="space-y-5">
              <div className="glass-card p-6">
                <p className="text-sm font-semibold">What happens when you tap the mic</p>
                <ol className="mt-3 space-y-2.5">
                  {[
                    "The mic starts pulsing and listens",
                    "You speak — tap again anytime to stop",
                    "The words are parsed into amount / category / date",
                    "The form fills in — you review, then save",
                  ].map((t, i) => (
                    <li key={t} className="flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-honey-500 text-[10px] font-bold text-zinc-900">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <p className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" /> Mic privacy, plainly
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {voiceFacts.map((f) => (
                    <li key={f.text} className="flex items-start gap-2">
                      <f.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.h2 {...fadeUp} className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Everything else that comes with it
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.07 }}
              className="glass-card-hover glass-card p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-honey-500/20 to-honey-400/5">
                <p.icon className="h-5 w-5 text-honey-600 dark:text-honey-400" />
              </div>
              <h3 className="text-sm font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-honey-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              That&apos;s the whole learning curve
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Five moves, one bee, zero finance jargon. Set it up in about two minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-honey px-7 py-3 text-base">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-ghost px-7 py-3 text-base">
                Sign in
              </Link>
            </div>
            <p className="mt-8 text-xs tracking-wide text-zinc-400 dark:text-zinc-500">
              Product by{" "}
              <span className="font-semibold text-honey-600 dark:text-honey-400">Team Rylen</span>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
