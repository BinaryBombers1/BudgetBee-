"use client";

import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";

export function VoiceChips({ entry, raw, onConfirm, onEdit, onDiscard, busy }) {
  const income = entry.type === "income";
  return (
    <div className="space-y-2.5 rounded-xl border border-honey-500/30 bg-honey-500/5 p-3">
      <p className="truncate text-[11px] italic text-zinc-400">“{raw}”</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-honey-500/40 bg-honey-500/15 px-2.5 py-1 text-xs font-bold tabular-nums text-honey-800 dark:text-honey-200">
          {formatMoney(entry.amount || 0)}
        </span>
        {entry.category ? (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              income
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {income ? "↑" : "↓"} {entry.category}
          </span>
        ) : (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Pick a category
          </span>
        )}
        {entry.note && (
          <span className="max-w-[12rem] truncate rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {entry.note}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onConfirm} isLoading={busy} disabled={busy}>
          <Check className="h-3.5 w-3.5" /> Confirm
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit} disabled={busy}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <button
          type="button"
          onClick={onDiscard}
          aria-label="Discard voice entry"
          className="ml-auto rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-rose-500 dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
