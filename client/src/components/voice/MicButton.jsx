"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Mic, MessageCircle, Square, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { parseIntent } from "@/lib/voice/parseIntent";
import { SUGGESTION_EXAMPLES } from "@/lib/voice/lexicon";
import { LOCALES, getStoredLang, setStoredLang } from "@/lib/voice/lang";
import { stopSpeaking } from "@/lib/voice/tts";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useVoiceTts } from "@/hooks/useVoiceTts";
import { VoiceWave } from "./VoiceWave";
import { VoiceChips } from "./VoiceChips";

const LANGS = [
  { code: "en", label: "EN", mic: "Start voice entry", stop: "Stop listening" },
  { code: "bn", label: "বাংলা", mic: "ভয়েস এন্ট্রি শুরু করুন", stop: "শোনা বন্ধ করুন" },
  { code: "ur", label: "اردو", mic: "وائس اینٹری شروع کریں", stop: "سننا بند کریں" },
];

export function MicButton({ onApply }) {
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("idle");
  const [entry, setEntry] = useState(null);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [text, setText] = useState("");
  const [suggestionUsed, setSuggestionUsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    setLang(getStoredLang());
  }, []);

  function pickLang(code) {
    setLang(code);
    setStoredLang(code);
  }

  async function askBudgetBee(spoken) {
    setHeard(spoken);
    setView("busy");
    setBusy(true);
    try {
      const res = await api.post("/ai/chat", { message: spoken, history: [] });
      const r =
        typeof res.data?.reply === "string" && res.data.reply.trim()
          ? res.data.reply
          : "I'm here — try rephrasing that? 💬";
      setReply(r);
      setView("chat");
      tts.say(r, LOCALES[lang]);
    } catch {
      setReply("");
      startLocal(spoken, "Couldn't reach BudgetBee — type it instead.");
    } finally {
      setBusy(false);
    }
  }

  function startLocal(raw, message) {
    setHeard(raw);
    setText(raw);
    setNote(message || "");
    setView("local");
    setTimeout(() => {
      textRef.current?.focus();
      textRef.current?.select?.();
    }, 80);
  }

  function handleFinal(transcript) {
    if (transcript == null) {
      setView((v) => (v === "listening" ? "idle" : v));
      return;
    }
    if (!transcript.trim()) {
      setNote("Didn't catch that.");
      setView("idle");
      return;
    }
    const parsed = parseIntent(transcript);
    if (parsed.intent === "entry") {
      setNote("");
      setEntry(parsed.entry);
      setHeard(transcript);
      setView("entry");
      return;
    }
    if (parsed.intent === "unknown") {
      startLocal(transcript);
      return;
    }
    askBudgetBee(transcript);
  }

  const rec = useVoiceRecognition({ lang: LOCALES[lang], onFinal: handleFinal });
  const tts = useVoiceTts();
  const { cancel: cancelListening } = rec;

  function toggleMic() {
    if (rec.listening) {
      rec.stop();
      return;
    }
    rec.dismissError();
    setNote("");
    setReply("");
    setSuggestionUsed(false);
    stopSpeaking();
    if (rec.start()) setView("listening");
  }

  function reset() {
    setView("idle");
    setEntry(null);
    setHeard("");
    setReply("");
    setNote("");
    setText("");
  }

  function confirmEntry() {
    Promise.resolve(onApply?.(entry, { submit: true })).then((r) => {
      if (r?.ok !== false) reset();
      else setNote(r.message || "Couldn't save — pick a category, then save.");
    });
  }

  function editEntry() {
    Promise.resolve(onApply?.(entry, { submit: false })).then(() => reset());
  }

  function useSuggestion() {
    const example = SUGGESTION_EXAMPLES[lang];
    const parsed = parseIntent(example);
    setSuggestionUsed(true);
    if (parsed.intent === "entry") {
      setEntry(parsed.entry);
      setHeard(example);
      setView("entry");
    } else {
      setText(example);
      textRef.current?.focus();
    }
  }

  function checkText() {
    const raw = text.trim();
    if (!raw) {
      textRef.current?.focus();
      return;
    }
    const parsed = parseIntent(raw);
    if (parsed.intent === "entry") {
      setEntry(parsed.entry);
      setHeard(raw);
      setView("entry");
      return;
    }
    setSuggestionUsed(true);
    setNote("I heard it, but there's no amount — add one (e.g. 120) and try again.");
    textRef.current?.focus();
    textRef.current?.select?.();
  }

  useEffect(() => {
    if (view !== "listening") return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        cancelListening();
        setView("idle");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, cancelListening]);

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  const micLabel = rec.listening ? current.stop : current.mic;
  const errorish = rec.error || note;

  let status = 'Try "120 taka for lunch"';
  if (rec.listening) status = rec.interim || "Listening…";
  else if (view === "busy") status = "BudgetBee is thinking…";
  else if (view === "entry") status = "Does this look right?";
  else if (view === "chat") status = "BudgetBee says";

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-honey-500/40 bg-honey-500/5 px-2.5 py-2">
        <button
          type="button"
          onClick={toggleMic}
          aria-label={micLabel}
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md transition ${
            rec.listening
              ? "bg-rose-500 hover:bg-rose-600"
              : "bg-gradient-to-br from-honey-400 to-honey-600 hover:brightness-110"
          }`}
        >
          {rec.listening && (
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" />
          )}
          <span className="relative">
            {rec.listening ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </span>
        </button>

        {rec.listening && <VoiceWave />}

        <span
          className={`min-w-0 flex-1 truncate text-xs ${
            rec.interim ? "font-medium text-zinc-700 dark:text-zinc-200" : "text-zinc-400"
          }`}
        >
          {status}
        </span>

        <div className="flex shrink-0 gap-1">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pickLang(l.code)}
              disabled={rec.listening}
              aria-pressed={lang === l.code}
              className={`rounded-full px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
                lang === l.code
                  ? "bg-honey-500 text-zinc-900"
                  : "border border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {errorish && view !== "entry" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
          {errorish}
        </p>
      )}

      <AnimatePresence mode="wait">
        {view === "entry" && entry && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <VoiceChips
              entry={entry}
              raw={heard}
              onConfirm={confirmEntry}
              onEdit={editEntry}
              onDiscard={reset}
              busy={busy}
            />
            {note && (
              <p className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                {note}
              </p>
            )}
          </motion.div>
        )}

        {(view === "chat" || view === "busy") && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-[11px] italic text-zinc-400">“{heard}”</p>
            {view === "busy" ? (
              <p className="flex items-center gap-2 text-xs text-zinc-500">
                <Bot className="h-3.5 w-3.5 animate-pulse" /> BudgetBee is thinking…
              </p>
            ) : (
              <>
                <div className="flex justify-start">
                  <div className="max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                    {reply}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {!suggestionUsed && (
                    <button
                      type="button"
                      onClick={useSuggestion}
                      className="rounded-full border border-honey-500/30 bg-honey-500/10 px-2.5 py-1 text-[11px] font-medium text-honey-700 transition hover:bg-honey-500/20 dark:text-honey-300"
                    >
                      <Wand2 className="mr-1 inline h-3 w-3" />
                      {SUGGESTION_EXAMPLES[lang]}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <MessageCircle className="mr-1 inline h-3 w-3" />
                    New try
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {view === "local" && (
          <motion.div
            key="local"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-[11px] italic text-zinc-400">
              I heard: “{heard || text}”
            </p>
            <div className="flex gap-1.5">
              <input
                ref={textRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    checkText();
                  }
                }}
                placeholder="Fix it and press Enter…"
                aria-label="Edit what I heard"
                className="input-field min-w-0 flex-1 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={checkText}
                className="shrink-0 rounded-lg bg-honey-500 px-2.5 text-xs font-semibold text-zinc-900 transition hover:bg-honey-600"
              >
                Check
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {!suggestionUsed && (
                <button
                  type="button"
                  onClick={useSuggestion}
                  className="rounded-full border border-honey-500/30 bg-honey-500/10 px-2.5 py-1 text-[11px] font-medium text-honey-700 transition hover:bg-honey-500/20 dark:text-honey-300"
                >
                  <Wand2 className="mr-1 inline h-3 w-3" />
                  {SUGGESTION_EXAMPLES[lang]}
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                New try
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
