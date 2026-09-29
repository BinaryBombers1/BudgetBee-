import dns from "node:dns";
import net from "node:net";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;
let lastAttempt = null;
let lastConnectHost = null;

function maskEmail(e) {
  const s = String(e ?? "");
  const i = s.indexOf("@");
  if (i < 1) return "***";
  return `${s[0]}***${s.slice(i)}`;
}

/** Admin-safe view of SMTP config + the last send attempt (no secrets). */
export function getMailDiagnostics() {
  return {
    configured: isMailConfigured(),
    host: env.SMTP_HOST || null,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "true" || env.SMTP_PORT === 465,
    userSet: Boolean(env.SMTP_USER),
    passSet: Boolean(env.SMTP_PASS),
    from: env.MAIL_FROM || null,
    brevo: Boolean(env.BREVO_API_KEY),
    transport: env.BREVO_API_KEY ? "brevo" : isMailConfigured() ? "smtp" : "none",
    connectHost: lastConnectHost,
    lastAttempt,
  };
}

function parseFromHeader(raw) {
  const m = String(raw || "").match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || "Campus Coin", email: m[2].trim() };
  return { email: String(raw || "").trim() };
}

async function sendViaBrevo({ to, subject, html, text, attachments }) {
  const body = {
    sender: parseFromHeader(env.MAIL_FROM),
    to: [{ email: to }],
    subject,
    htmlContent: html,
    ...(text ? { textContent: text } : {}),
    ...(attachments && attachments.length
      ? {
          attachment: attachments.map((a) => ({
            name: a.filename,
            content: Buffer.from(a.content).toString("base64"),
          })),
        }
      : {}),
  };
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`Brevo ${res.status}: ${errText}`);
  }
  const data = await res.json().catch(() => ({}));
  return data.messageId || null;
}

/** SMTP is optional — without SMTP_HOST the app keeps its dev fallback (console + dev payload). */
export function isMailConfigured() {
  return Boolean(env.SMTP_HOST);
}

async function getTransporter() {
  if (!transporter) {
    let host = env.SMTP_HOST;
    const needsV4 = host && !net.isIP(host);
    if (needsV4) {
      // Some hosts (e.g. Railway) have no IPv6 route while DNS returns AAAA
      // first — pin the connection to IPv4; servername keeps TLS verification.
      const v4 = await new Promise((res) =>
        dns.lookup(host, { family: 4 }, (err, addr) => res(err ? null : addr))
      );
      if (v4) host = v4;
    }
    lastConnectHost = host || null;
    transporter = nodemailer.createTransport({
      host,
      ...(needsV4 ? { servername: env.SMTP_HOST } : {}),
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE === "true" || env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  return transporter;
}

async function send({ to, subject, html, text, attachments }) {
  const stamp = () => new Date().toISOString();
  if (env.BREVO_API_KEY) {
    try {
      const messageId = await sendViaBrevo({ to, subject, html, text, attachments });
      console.log(`[MAIL] (brevo) "${subject}" -> ${to}${messageId ? ` id=${messageId}` : ""}`);
      lastAttempt = { at: stamp(), subject, to: maskEmail(to), transport: "brevo", sent: true, reason: null };
      return { sent: true };
    } catch (err) {
      console.error(`[MAIL FAILED] (brevo) "${subject}" -> ${to}: ${err.message}`);
      lastAttempt = { at: stamp(), subject, to: maskEmail(to), transport: "brevo", sent: false, reason: err.message };
      return { sent: false, reason: err.message };
    }
  }
  if (!isMailConfigured()) {
    console.log(`[MAIL SKIP] SMTP not configured (SMTP_HOST missing) — "${subject}" not sent`);
    lastAttempt = { at: stamp(), subject, to: maskEmail(to), transport: "none", sent: false, reason: "SMTP not configured (SMTP_HOST missing)" };
    return { sent: false, reason: "SMTP not configured" };
  }
  try {
    const t = await getTransporter();
    await t.sendMail({ from: env.MAIL_FROM, to, subject, html, text, attachments });
    console.log(`[MAIL] "${subject}" -> ${to}`);
    lastAttempt = { at: stamp(), subject, to: maskEmail(to), transport: "smtp", sent: true, reason: null };
    return { sent: true };
  } catch (err) {
    console.error(`[MAIL FAILED] "${subject}" -> ${to}: ${err.message}`);
    lastAttempt = { at: stamp(), subject, to: maskEmail(to), transport: "smtp", sent: false, reason: err.message };
    return { sent: false, reason: err.message };
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(month) {
  const m = String(month || "").match(/^(\d{4})-(\d{2})$/);
  if (!m) return "Monthly";
  return `${MONTH_NAMES[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function shell(title, bodyHtml, footerNote) {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#f4f4f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
    <div style="background:#18181b;padding:20px 28px;">
      <span style="font-size:18px;font-weight:700;color:#fbbf24;">&#9679; Campus Coin</span>
      <span style="font-size:12px;color:#a1a1aa;margin-left:10px;">Student Budget Tracker</span>
      <span style="float:right;font-size:11px;color:#a1a1aa;padding-top:6px;">Product by Team Rylen</span>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 14px;font-size:20px;color:#18181b;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:26px;font-size:12px;color:#71717a;line-height:1.6;">${footerNote}</p>
    </div>
  </div>
</body>
</html>`;
}

export function sendOtpEmail(to, otp, expiresInMin = 10) {
  const html = shell(
    "Your verification code",
    `<p style="font-size:14px;color:#3f3f46;margin:0 0 18px;">
       Use this code to verify your email address. It expires in
       <strong>${expiresInMin} minutes</strong>.
     </p>
     <div style="text-align:center;background:#fefce8;border:1px dashed #fcd34d;border-radius:12px;padding:18px 10px;margin:6px 0 4px;">
       <span style="font-family:Consolas,Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#b45309;padding-left:10px;">${otp}</span>
     </div>`,
    "If you didn&apos;t request this code, you can safely ignore this email — only someone with access to this inbox can verify it."
  );
  const text = `Your Campus Coin verification code is: ${otp} (expires in ${expiresInMin} minutes). If you didn't request it, ignore this email.`;
  return send({ to, subject: `Campus Coin verification code: ${otp}`, html, text });
}

export function sendReportShareEmail({ to, month, senderName, senderEmail, pdf }) {
  const label = monthLabel(month);
  const who = esc(senderName);
  const from = esc(senderEmail);
  const html = shell(
    `Campus Coin report &mdash; ${esc(label)}`,
    `<p style="font-size:14px;color:#3f3f46;margin:0 0 14px;">
       <strong>${who}</strong> (${from}) shared a Campus Coin monthly report with you.
     </p>
     <p style="font-size:14px;color:#3f3f46;margin:0 0 6px;">
       The full <strong>${esc(label)}</strong> report is attached as a PDF —
       spending charts, category breakdown, trend, forecast, and totals.
     </p>`,
    "This report was generated by Campus Coin, a student budget tracker. The attachment is a PDF you can open on any device."
  );
  const text = `${senderName} (${senderEmail}) shared their Campus Coin ${label} report with you. The PDF report is attached.`;
  return send({
    to,
    subject: `Campus Coin report — ${label}`,
    html,
    text,
    attachments: [
      { filename: `campus-coin-report-${month}.pdf`, content: pdf, contentType: "application/pdf" },
    ],
  });
}

export function sendResetEmail(to, resetUrl) {
  const html = shell(
    "Reset your password",
    `<p style="font-size:14px;color:#3f3f46;margin:0 0 20px;">
       We received a request to reset your Campus Coin password. The link below is valid for
       <strong>30 minutes</strong> and can be used once.
     </p>
     <div style="text-align:center;margin:8px 0 18px;">
       <a href="${resetUrl}"
          style="display:inline-block;background:#f59e0b;color:#18181b;font-weight:700;font-size:15px;text-decoration:none;padding:13px 30px;border-radius:10px;">
         Reset password
       </a>
     </div>
     <p style="font-size:12px;color:#71717a;word-break:break-all;margin:0;">
       Button not working? Paste this link into your browser:<br/>
       <a href="${resetUrl}" style="color:#b45309;">${resetUrl}</a>
     </p>`,
    "If you didn&apos;t request a password reset, ignore this email — your password has not changed."
  );
  const text = `Reset your Campus Coin password (valid 30 minutes): ${resetUrl}\n\nIf you didn't request this, ignore this email.`;
  return send({ to, subject: "Campus Coin — reset your password", html, text });
}

export function sendPasswordChangedEmail(to, name) {
  const who = esc(name);
  const html = shell(
    "Your password was changed",
    `<p style="font-size:14px;color:#3f3f46;margin:0 0 14px;">
       Hi ${who},
     </p>
     <p style="font-size:14px;color:#3f3f46;margin:0 0 14px;">
       An administrator reset your Campus Coin password. Sign in with the
       <strong>new password you were given</strong>.
     </p>
     <p style="font-size:14px;color:#b91c1c;margin:0;">
       If this wasn&apos;t you, contact the Campus Coin team immediately.
     </p>`,
    "This is an automated security notice from Campus Coin, a student budget tracker."
  );
  const text = `Hi ${name}, an administrator reset your Campus Coin password. Sign in with the new password you were given. If this wasn't you, contact the Campus Coin team immediately.`;
  return send({ to, subject: "Campus Coin — your password was changed", html, text });
}
