"use client";

import Link from "next/link";
import { Hexagon, ArrowRight } from "lucide-react";

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center transition-transform group-hover:scale-105">
        <Hexagon className="h-9 w-9 fill-honey-500/20 text-honey-500" />
        <span className="absolute text-sm font-bold text-honey-600 dark:text-honey-400">₵</span>
      </div>
      <div className="leading-tight hidden min-[440px]:block">
        <p className="text-sm font-bold">Campus Coin</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-honey-600 dark:text-honey-400">
          BudgetBee
        </p>
      </div>
    </Link>
  );
}

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Voice", href: "/how-it-works#voice" },
  { label: "AI coach", href: "/#ai" },
  { label: "Site map", href: "/sitemap" },
];

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-7 text-sm text-zinc-500 md:flex">
            {productLinks.map((l) => (
              <Link key={l.label} href={l.href} className="transition hover:text-honey-600">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/login" className="btn-ghost whitespace-nowrap text-sm">
              Sign in
            </Link>
            <Link href="/register" className="btn-honey whitespace-nowrap text-sm">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              The student budget tracker built around hostel budgets, canteen runs, and
              scholarship season — not corporate finance.
            </p>
          </div>
          <nav aria-label="Product">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Product
            </p>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <a href="/#features" className="transition hover:text-honey-600">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how" className="transition hover:text-honey-600">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#ai" className="transition hover:text-honey-600">
                  AI coach
                </a>
              </li>
              <li>
                <a href="/#sitemap" className="transition hover:text-honey-600">
                  Screens
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Account
            </p>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/login" className="transition hover:text-honey-600">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-honey-600">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="transition hover:text-honey-600">
                  Forgot password
                </Link>
              </li>
              <li>
                <Link href="/admin-login" className="transition hover:text-honey-600">
                  Admin sign in
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Company
            </p>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/how-it-works" className="transition hover:text-honey-600">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-honey-600">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-honey-600">
                  Terms of use
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="transition hover:text-honey-600">
                  Site map
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-zinc-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Campus Coin · Built for campus financial literacy By Rylen
            </p>
            <p>No credit card · Free for students · BDT ready</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
