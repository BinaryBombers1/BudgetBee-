"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, Send, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useUIStore } from "@/store/ui";
import { formatDate, cn } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { SkeletonList } from "@/components/ui/EmptyState";

const CATEGORIES = [
  { value: "bug", label: "Bug report" },
  { value: "idea", label: "Feature idea" },
  { value: "praise", label: "Praise" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES = {
  new: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  read: "bg-honey-500/15 text-honey-700 dark:text-honey-400",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export default function FeedbackPage() {
  const addToast = useUIStore((s) => s.addToast);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ category: "other", rating: 0, message: "" });

  const load = useCallback(async () => {
    try {
      const res = await api.get("/feedback/mine");
      setItems(res.data.feedback);
    } catch (e) {
      addToast({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (form.message.trim().length < 5) {
      addToast({ type: "error", message: "Please write at least 5 characters" });
      return;
    }
    setSending(true);
    try {
      await api.post("/feedback", {
        category: form.category,
        rating: form.rating || undefined,
        message: form.message.trim(),
      });
      addToast({ type: "success", message: "Feedback sent — thank you!" });
      setForm({ category: "other", rating: 0, message: "" });
      load();
    } catch (e) {
      addToast({ type: "error", message: e.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Feedback"
        subtitle="Tell us what works, what broke, or what to build next"
        breadcrumbs={[{ label: "Feedback" }]}
      />

      <Card className="p-5">
        <CardHeader title="Drop your feedback" subtitle="Our team reads every single message" />
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Rating (optional)
              </label>
              <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: form.rating === n ? 0 : n })}
                    aria-label={`${n} star`}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-5 w-5",
                        n <= form.rating
                          ? "fill-honey-500 text-honey-500"
                          : "text-zinc-300 dark:text-zinc-600"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Textarea
            label="Your message"
            placeholder="What did you like? What felt confusing? What should we add?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            minLength={5}
            maxLength={2000}
            required
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">{form.message.length}/2000</p>
            <Button type="submit" isLoading={sending}>
              <Send className="h-4 w-4" /> Send feedback
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <CardHeader title="Your past feedback" subtitle="Replies from the team appear here" />
        {loading ? (
          <SkeletonList count={3} />
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">
            No feedback yet — be the first to share your thoughts above.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((f, i) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                      STATUS_STYLES[f.status]
                    )}
                  >
                    {f.status === "new" && <Clock className="mr-1 inline h-3 w-3" />}
                    {f.status === "resolved" && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                    {f.status}
                  </span>
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium capitalize dark:bg-zinc-800">
                    {f.category}
                  </span>
                  {f.rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "h-3 w-3",
                            n <= f.rating
                              ? "fill-honey-500 text-honey-500"
                              : "text-zinc-300 dark:text-zinc-700"
                          )}
                        />
                      ))}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-zinc-400">
                    {formatDate(f.createdAt, "short")}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-200">{f.message}</p>
                {f.adminReply && (
                  <div className="mt-3 rounded-lg border-l-2 border-honey-500 bg-honey-500/5 px-3 py-2">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-honey-600 dark:text-honey-400">
                      Team Rylen replied
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{f.adminReply}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
