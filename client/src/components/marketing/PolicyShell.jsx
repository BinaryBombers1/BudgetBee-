"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

export function Section({ id, title, children }) {
  return (
    <motion.section {...fadeUp} id={id} className="glass-card scroll-mt-24 p-6 sm:p-7">
      <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {children}
      </div>
    </motion.section>
  );
}

export default function PolicyShell({ eyebrow, title, updated, intro, toc, children }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-honey-500/12 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(rgba(245,158,11,0.9) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <motion.div {...fadeUp}>
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-honey-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-honey-600 dark:text-honey-400">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {intro}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-400">
              <CalendarDays className="h-3.5 w-3.5 text-honey-500" />
              Last updated {updated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Body + TOC */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              On this page
            </p>
            <ul className="space-y-1.5 border-l border-zinc-200 dark:border-zinc-800">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="-ml-px block border-l border-transparent py-0.5 pl-3 text-xs text-zinc-500 transition hover:border-honey-500 hover:text-honey-600"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-5">{children}</div>
      </section>
    </div>
  );
}
