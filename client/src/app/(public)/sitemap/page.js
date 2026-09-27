"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Hexagon,
  Globe,
  KeyRound,
  LayoutDashboard,
  Shield,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

const branches = [
  {
    id: "public",
    icon: Globe,
    label: "Public site",
    hint: "no account needed",
    nodes: [
      { label: "Landing", href: "/" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Voice guide", href: "/how-it-works#voice" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Site map", href: "/sitemap" },
    ],
  },
  {
    id: "auth",
    icon: KeyRound,
    label: "Accounts",
    hint: "email + one-time code",
    nodes: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Forgot password", href: "/forgot-password" },
      { label: "Reset password", href: "/reset-password" },
      { label: "Admin sign in", href: "/admin-login" },
    ],
  },
  {
    id: "app",
    icon: LayoutDashboard,
    label: "Student app",
    hint: "signed-in students",
    nodes: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Transactions", href: "/transactions" },
      { label: "Add transaction", href: "/transactions/new" },
      { label: "Import CSV", href: "/transactions/import" },
      { label: "Budgets", href: "/budgets" },
      { label: "Categories", href: "/categories" },
      { label: "Insights", href: "/insights" },
      { label: "Reports", href: "/reports" },
      { label: "Bookmarks", href: "/bookmarks" },
      { label: "Tips", href: "/tips" },
      { label: "Profile", href: "/profile" },
    ],
    gated: true,
  },
  {
    id: "admin",
    icon: Shield,
    label: "Admin console",
    hint: "admin role only",
    gated: true,
    nodes: [
      { label: "Overview", href: "/admin" },
      { label: "Users", href: "/admin/users" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Announcements", href: "/admin/announcements" },
    ],
  },
];

const flow = [
  "Landing",
  "Create account",
  "Dashboard",
  "Log · Budget · Ask · Report",
];

export default function SitemapPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 -top-32 h-80 w-[38rem] -translate-x-1/2 rounded-full bg-honey-500/12 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(rgba(245,158,11,0.9) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-14 text-center lg:pt-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-honey-500/35 bg-honey-500/12 px-4 py-1.5 text-xs font-semibold tracking-wide text-honey-700 dark:text-honey-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Site map
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Every screen, <span className="text-honey-600 dark:text-honey-400">one map</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
          >
            The whole Campus Coin tree — public pages, account flows, the student app and the
            admin console. Tap any node to jump straight there.
          </motion.p>
        </div>
      </section>

      {/* Diagram */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {/* Root node */}
        <motion.div {...fadeUp} className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-honey-500/15 blur-2xl" aria-hidden="true" />
            <div className="relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-honey-500 to-honey-400 px-6 py-3 shadow-honey">
              <Hexagon className="h-5 w-5 fill-zinc-900/20 text-zinc-900" />
              <span className="text-sm font-extrabold tracking-tight text-zinc-900">
                Campus Coin
              </span>
            </div>
          </div>
        </motion.div>

        {/* Connector: trunk + rail (lg+) */}
        <div className="relative mx-auto h-8 w-px bg-honey-500/40" aria-hidden="true" />
        <div className="relative mx-auto hidden h-px w-full max-w-6xl bg-honey-500/30 lg:block" aria-hidden="true">
          <span className="absolute left-[12.5%] top-0 h-6 w-px bg-honey-500/30" />
          <span className="absolute left-[37.5%] top-0 h-6 w-px bg-honey-500/30" />
          <span className="absolute left-[62.5%] top-0 h-6 w-px bg-honey-500/30" />
          <span className="absolute left-[87.5%] top-0 h-6 w-px bg-honey-500/30" />
        </div>

        {/* Branch columns */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {branches.map((b, bi) => (
            <motion.div
              key={b.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: bi * 0.08 }}
              className="relative"
            >
              <div className="mx-auto mb-4 h-6 w-px bg-honey-500/30 lg:hidden" aria-hidden="true" />

              <div className="glass-card relative overflow-hidden p-4">
                <div
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-honey-500/10 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative mb-3 flex items-center gap-2.5 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-honey-500/25 to-honey-400/10">
                    <b.icon className="h-4 w-4 text-honey-600 dark:text-honey-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{b.label}</p>
                    <p className="truncate text-[10px] uppercase tracking-wider text-zinc-400">
                      {b.hint}
                    </p>
                  </div>
                </div>

                <ul className="relative space-y-1.5">
                  {b.nodes.map((n) => (
                    <li key={n.label}>
                      <Link
                        href={n.href}
                        className="group flex items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-honey-500/40 hover:bg-honey-500/10 hover:text-honey-700 dark:text-zinc-300 dark:hover:text-honey-300"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-honey-500/70 transition group-hover:scale-125"
                            aria-hidden="true"
                          />
                          <span className="truncate">{n.label}</span>
                        </span>
                        {b.gated ? (
                          <Lock className="h-3 w-3 shrink-0 text-zinc-400 transition group-hover:text-honey-500" />
                        ) : (
                          <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          {...fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400"
        >
          <span className="inline-flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-honey-500" /> opens right away
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-zinc-400" /> needs sign-in (redirects to login)
          </span>
        </motion.div>
      </section>

      {/* Flow strip */}
      <section className="border-y border-zinc-200 bg-white/50 py-14 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-5xl px-6">
          <motion.h2 {...fadeUp} className="text-center text-xl font-bold tracking-tight sm:text-2xl">
            The typical student journey
          </motion.h2>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            {flow.map((f, i) => (
              <div key={f} className="flex items-center gap-3 sm:flex-1">
                <div className="glass-card flex-1 px-4 py-3 text-center text-xs font-semibold sm:text-sm">
                  {f}
                </div>
                {i < flow.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-honey-500 sm:block" />
                )}
              </div>
            ))}
          </motion.div>
          <motion.p
            {...fadeUp}
            className="mt-6 text-center text-xs text-zinc-400"
          >
            Tip: the voice mic lives on <span className="font-semibold text-honey-600 dark:text-honey-400">Add transaction</span>, the{" "}
            <span className="font-semibold text-honey-600 dark:text-honey-400">chat widget</span> and the{" "}
            <span className="font-semibold text-honey-600 dark:text-honey-400">dashboard</span> — see the{" "}
            <Link href="/how-it-works#voice" className="underline hover:text-honey-600">
              voice guide
            </Link>
            .
          </motion.p>
        </div>
      </section>
    </div>
  );
}
