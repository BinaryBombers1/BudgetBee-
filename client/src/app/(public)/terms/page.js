"use client";

import Link from "next/link";
import PolicyShell, { Section } from "@/components/marketing/PolicyShell";

const toc = [
  { id: "accept", label: "Acceptance" },
  { id: "who", label: "Who can use it" },
  { id: "account", label: "Your account" },
  { id: "use", label: "Acceptable use" },
  { id: "advice", label: "Not financial advice" },
  { id: "voice", label: "Voice & AI features" },
  { id: "availability", label: "Availability" },
  { id: "ip", label: "Ownership" },
  { id: "termination", label: "Termination" },
  { id: "disclaimer", label: "Disclaimers" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <PolicyShell
      eyebrow="Legal"
      title="Terms of use"
      updated="September 2026"
      intro="The short version: Campus Coin is a free educational tool for students — use it honestly, we keep it running, and neither of us is pretending it's a bank. The full version is below."
      toc={toc}
    >
      <Section id="accept" title="1. Acceptance of these terms">
        <p>
          By creating an account or using Campus Coin (&ldquo;the App&rdquo;), you agree to
          these terms. If you do not agree, please do not use the App. We may update the terms
          from time to time — the date above shows the latest revision, and continued use
          after a change means you accept it.
        </p>
      </Section>

      <Section id="who" title="2. Who can use it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>students and campus community members, generally aged 13 or over;</li>
          <li>you must provide a real email address you control (we verify it with a code);</li>
          <li>one account per person; shared demo logins are for evaluation only;</li>
          <li>if you are under the age of majority in your country, a guardian should consent
            to you using budgeting tools that store personal data.</li>
        </ul>
      </Section>

      <Section id="account" title="3. Your account">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>keep your password and one-time codes to yourself — you are responsible for
            activity under your account;</li>
          <li>notify us promptly at{" "}
            <a href="mailto:admin@campuscoin.app" className="font-semibold text-honey-600 underline hover:text-honey-500">
              admin@campuscoin.app
            </a>{" "}
            if you suspect unauthorized access;</li>
          <li>the information you log must be yours (or data you are allowed to process);</li>
          <li>you may close your account or request deletion of your data at any time via
            email.</li>
        </ul>
      </Section>

      <Section id="use" title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>use the App for any unlawful, fraudulent, or misleading purpose;</li>
          <li>attempt to probe, scan, overload, or breach the App or its servers (including
            circumventing rate limits);</li>
          <li>reverse engineer or copy the App&apos;s code except where the law expressly
            permits it;</li>
          <li>upload malware, or use automated scraping that degrades the service for others;</li>
          <li>impersonate another person or misrepresent your affiliation.</li>
        </ul>
      </Section>

      <Section id="advice" title="5. Not financial advice">
        <p>
          Campus Coin is an <strong>educational budgeting tool</strong>. Balances, budgets,
          insights, tips and AI-generated answers are informational — they are not financial,
          investment, tax, or legal advice, and they may be wrong (for example if your data is
          incomplete). Decisions you make based on the App are your own. Demo and seed data
          exist for illustration and do not represent real people.
        </p>
      </Section>

      <Section id="voice" title="6. Voice & AI features">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>voice entry depends on your browser&apos;s speech support (Chrome / Edge) and a
            working microphone; recognition is not guaranteed to be 100% accurate — always
            review the filled form before saving;</li>
          <li>AI answers are generated automatically and may be inaccurate; they never replace
            your own judgement;</li>
          <li>we may change, limit, or withdraw voice/AI features without notice;</li>
          <li>how we handle microphone input is described in the{" "}
            <Link href="/privacy" className="font-semibold text-honey-600 underline hover:text-honey-500">
              privacy policy
            </Link>
            .</li>
        </ul>
      </Section>

      <Section id="availability" title="7. Availability">
        <p>
          Campus Coin is free for students. We aim to keep it available, but we do not promise
          uninterrupted uptime — maintenance, bugs, or third-party outages (hosting, database,
          email, AI providers) may cause downtime or missing features. We may modify or
          discontinue parts of the App at any time. Support is provided on a best-effort
          basis.
        </p>
      </Section>

      <Section id="ip" title="8. Ownership">
        <p>
          The App — its design, code, BudgetBee mascot, and branding — belongs to Campus Coin
          and its authors. Your data remains yours; you grant us only the licence needed to
          store it and provide the features you ask for. Feedback you send may be used to
          improve the App without obligation to you.
        </p>
      </Section>

      <Section id="termination" title="9. Suspension & termination">
        <p>
          We may suspend or delete accounts that break these terms, create risk for others, or
          abuse the service (e.g. automated sign-up flooding). You can stop using the App and
          request account deletion anytime. Sections that by nature should survive (including
          disclaimers and ownership) survive termination.
        </p>
      </Section>

      <Section id="disclaimer" title="10. Disclaimers & liability">
        <p>
          The App is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
          <strong>&ldquo;as available&rdquo;</strong> without warranties of any kind, express
          or implied — including fitness for a particular purpose, accuracy, and
          uninterruptedness. To the maximum extent permitted by law, Campus Coin and its
          authors shall not be liable for any indirect, incidental, or consequential damages
          arising from your use of the App, including lost savings, missed alerts, or
          decisions made on its output. Our total liability, if any, is limited to the amount
          you paid us — which is zero, because the App is free.
        </p>
      </Section>

      <Section id="contact" title="11. Contact">
        <p>
          Questions about these terms:{" "}
          <a
            href="mailto:admin@campuscoin.app"
            className="font-semibold text-honey-600 underline hover:text-honey-500"
          >
            admin@campuscoin.app
          </a>
          . Read more in our{" "}
          <Link href="/privacy" className="font-semibold text-honey-600 underline hover:text-honey-500">
            privacy policy
          </Link>
          , or explore the{" "}
          <Link href="/sitemap" className="font-semibold text-honey-600 underline hover:text-honey-500">
            site map
          </Link>
          .
        </p>
      </Section>
    </PolicyShell>
  );
}
