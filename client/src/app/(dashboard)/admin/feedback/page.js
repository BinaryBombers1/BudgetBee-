"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Trash2, Reply, Send, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import { useUIStore } from "@/store/ui";
import { formatDate, cn } from "@/lib/utils";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/EmptyState";

const TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "resolved", label: "Resolved" },
];

const STATUS_STYLES = {
  new: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  read: "bg-honey-500/15 text-honey-700 dark:text-honey-400",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

const CATEGORY_LABELS = { bug: "Bug", idea: "Idea", praise: "Praise", other: "Other" };

export default function AdminFeedbackPage() {
  const addToast = useUIStore((s) => s.addToast);

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ new: 0, read: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab ? `?status=${tab}` : "";
      const res = await api.get(`/admin/feedback${params}`);
      setItems(res.data.feedback);
      setCounts(res.data.counts);
    } catch (e) {
      addToast({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  }, [tab, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/feedback/${replyFor._id}`, { reply: replyText.trim(), status: "resolved" });
      addToast({ type: "success", message: "Reply saved & marked resolved" });
      setReplyFor(null);
      setReplyText("");
      load();
    } catch (e) {
      addToast({ type: "error", message: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(f, status) {
    try {
      await api.patch(`/admin/feedback/${f._id}`, { status });
      load();
    } catch (e) {
      addToast({ type: "error", message: e.message });
    }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/admin/feedback/${deleteTarget._id}`);
      addToast({ type: "success", message: "Feedback deleted" });
      load();
    } catch (e) {
      addToast({ type: "error", message: e.message });
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="User feedback"
        subtitle="Real messages from students using Campus Coin"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Feedback" }]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="New" value={counts.new} icon={Inbox} accent="blue" delay={0} />
        <StatCard label="Read" value={counts.read} icon={Reply} accent="honey" delay={0.05} />
        <StatCard label="Resolved" value={counts.resolved} icon={Star} accent="emerald" delay={0.1} />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              tab === t.value
                ? "bg-honey-500 text-zinc-900"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-zinc-400">No feedback here yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((f, i) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{f.userId?.name || "Deleted user"}</span>
                <span className="text-xs text-zinc-400">{f.userId?.email}</span>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                    STATUS_STYLES[f.status]
                  )}
                >
                  {f.status}
                </span>
                <span className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium capitalize dark:bg-zinc-800">
                  {CATEGORY_LABELS[f.category] || f.category}
                </span>
                {f.rating > 0 && (
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "h-3 w-3",
                          n <= f.rating ? "fill-honey-500 text-honey-500" : "text-zinc-300"
                        )}
                      />
                    ))}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-zinc-400">
                  {formatDate(f.createdAt, "time")}
                </span>
              </div>

              <p className="text-sm text-zinc-700 dark:text-zinc-200">{f.message}</p>

              {f.adminReply && (
                <div className="mt-3 rounded-lg border-l-2 border-honey-500 bg-honey-500/5 px-3 py-2">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-honey-600 dark:text-honey-400">
                    Your reply
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">{f.adminReply}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyFor(f);
                    setReplyText(f.adminReply || "");
                  }}
                >
                  <Reply className="h-3.5 w-3.5" /> Reply
                </Button>
                {f.status !== "read" && f.status !== "resolved" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(f, "read")}>
                    Mark read
                  </Button>
                )}
                {f.status !== "resolved" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(f, "resolved")}>
                    Resolve
                  </Button>
                )}
                <button
                  onClick={() => setDeleteTarget(f)}
                  title="Delete"
                  className="ml-auto rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply modal */}
      {replyFor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setReplyFor(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card relative z-10 w-full max-w-lg p-6 dark:bg-zinc-900"
          >
            <h2 className="mb-1 text-lg font-semibold">Reply to {replyFor.userId?.name}</h2>
            <p className="mb-4 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              {replyFor.message}
            </p>
            <form onSubmit={sendReply} className="space-y-4">
              <Textarea
                label="Your reply"
                placeholder="Thanks for the report — we're on it..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                minLength={2}
                maxLength={1000}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setReplyFor(null)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  <Send className="h-4 w-4" /> Send & resolve
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete feedback?"
        message="This feedback will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}
