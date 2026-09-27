"use client";

import Link from "next/link";
import { Mic, ShieldCheck, Bot, Cookie, Database, Mail } from "lucide-react";
import PolicyShell, { Section } from "@/components/marketing/PolicyShell";

const toc = [
  { id: "collect", label: "What we collect" },
  { id: "use", label: "How we use it" },
  { id: "voice", label: "Voice & microphone" },
  { id: "ai", label: "AI providers" },
  { id: "storage", label: "Storage & cookies" },
  { id: "sharing", label: "Sharing" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your rights" },
  { id: "contact", label: "Contact" },
];

function Bullet({ icon: Icon, title, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-honey-500/15">
        <Icon className="h-3.5 w-3.5 text-honey-600 dark:text-honey-400" />
      </span>
      <span>
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">{title}</span> — {children}
      </span>
    </li>
  );
}

export default function PrivacyPage() {
  return (
    <PolicyShell
      eyebrow="Privacy"
      title="Privacy policy"
      updated="September 2026"
      intro="Campus Coin is a student budget tracker — it only works if you trust it with your numbers. This page explains, in plain language, exactly what we store, what the microphones do, and what never leaves your device."
      toc={toc}
    >
      <Section id="collect" title="1. What we collect">
        <ul className="space-y-3">
          <Bullet icon={Mail} title="Account details">
            your name, email address, and optional profile settings (currency, allowance,
            savings goal, font and theme preferences).
          </Bullet>
          <Bullet icon={Database} title="Money data you enter">
            transactions, budgets, categories, imported CSV rows, bookmarks, and tips you pin.
            This is the data the app exists to store.
          </Bullet>
          <Bullet icon={ShieldCheck} title="Verification codes">
            we email one-time codes to verify your address and to reset your password. Codes
            expire quickly and are never stored in plain text.
          </Bullet>
          <Bullet icon={Mic} title="Voice transcripts">
            only the <em>text</em> of what you say while a mic is active — see section 3.
          </Bullet>
        </ul>
        <p>
          We do not buy data about you from anyone, and we do not require any bank
          credentials to use Campus Coin.
        </p>
      </Section>

      <Section id="use" title="2. How we use it">
        <p>Everything we store is used to run the app for you:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>balancing income vs expenses, budgets, trends and reports;</li>
          <li>sending realtime budget alerts when you cross a limit;</li>
          <li>powering AI category suggestions, insights and the chat coach;</li>
          <li>keeping you signed in securely across sessions;</li>
          <li>detecting abuse (rate limiting, OTP retries) and keeping the service reliable.</li>
        </ul>
        <p>We do not use your transactions for advertising — ever.</p>
      </Section>

      <Section id="voice" title="3. Voice & microphone">
        <p>
          Voice entry uses your browser&apos;s built-in speech recognition (the Web Speech
          API). When you tap a mic:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>the mic listens <strong>only while it is actively pulsing</strong> — tapping again stops it;</li>
          <li>your browser converts speech to text (supported in Chrome and Edge); the browser
            vendor processes the audio under <em>its own</em> privacy policy;</li>
          <li>Campus Coin receives the resulting <strong>transcript text only</strong> — we do
            not record, store, or upload audio files;</li>
          <li>spoken replies (read-aloud) are synthesized locally by your device&apos;s speech
            engine.</li>
        </ul>
        <p>
          You can decline the microphone permission at any time in your browser — every voice
          button simply disappears and the app works normally with typed input. Language
          choice (English / বাংলা / اردو) and voice preferences are stored locally in your
          browser&apos;s localStorage, not on our servers.
        </p>
      </Section>

      <Section id="ai" title="4. AI providers">
        <p>
          <Bot className="mr-1.5 inline h-4 w-4 text-honey-500" />
          To generate category suggestions, insights and chat answers, relevant context (your
          question, plus the money figures needed to answer it) is sent to an AI provider
          (Groq or OpenRouter). These providers process the request to return an answer; we do
          not allow them to use your data for their own advertising. If no AI provider is
          available, local built-in rules answer instead — the feature never fails open into
          sending more data elsewhere.
        </p>
      </Section>

      <Section id="storage" title="5. Storage & cookies">
        <ul className="space-y-3">
          <Bullet icon={Cookie} title="Cookies">
            an httpOnly <code>refreshToken</code> cookie keeps you signed in; an access token
            lives in sessionStorage and refreshes automatically.
          </Bullet>
          <Bullet icon={Database} title="Database">
            your data lives in MongoDB Atlas (encrypted in transit and at rest).
          </Bullet>
          <Bullet icon={ShieldCheck} title="localStorage">
            small preferences — theme, font size, sidebar state, voice language and the voice
            on/off flag — stay in your browser.
          </Bullet>
        </ul>
        <p>
          We do not run third-party advertising or cross-site tracking cookies.
        </p>
      </Section>

      <Section id="sharing" title="6. Sharing & selling">
        <p>
          <strong>We never sell, rent, or trade your data.</strong> The only parties who touch
          it are the infrastructure above (hosting, database, email delivery, AI provider) —
          each strictly to provide the service — and only if the law compels us would we
          disclose anything, and we would tell you where possible.
        </p>
      </Section>

      <Section id="security" title="7. Security">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>passwords hashed with bcrypt (cost factor 12) — never visible in plain text;</li>
          <li>short-lived JWT access tokens + rotating refresh tokens in httpOnly cookies;</li>
          <li>rate limiting on authentication endpoints;</li>
          <li>server-side validation on every write;</li>
          <li>HTTPS in production.</li>
        </ul>
        <p>
          No system is perfect — if you spot a vulnerability, please report it (below) before
          publishing it.
        </p>
      </Section>

      <Section id="rights" title="8. Your rights & retention">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>your data stays until you delete it or close the account — you can edit or
            remove individual transactions, budgets and categories anytime inside the app;</li>
          <li>to have your account and everything in it deleted, email us from your account
            address and we will process it;</li>
          <li>export your history anytime via Reports → PDF, or the CSV import/export flows;</li>
          <li>ask us what we hold about you — we will answer in plain terms.</li>
        </ul>
        <p>
          Under-13s may not use the service. Students using Campus Coin on a shared hostel
          computer should sign out when finished — see section 5 for what stays behind.
        </p>
      </Section>

      <Section id="contact" title="9. Contact & changes">
        <p>
          Questions, deletion requests or security reports:{" "}
          <a
            href="mailto:admin@campuscoin.app"
            className="font-semibold text-honey-600 underline hover:text-honey-500"
          >
            admin@campuscoin.app
          </a>
          . If this policy changes materially, we will update this page and revise the date
          above — continuing to use Campus Coin after that means you accept the changes.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="font-semibold text-honey-600 underline hover:text-honey-500">
            terms of use
          </Link>
          .
        </p>
      </Section>
    </PolicyShell>
  );
}
