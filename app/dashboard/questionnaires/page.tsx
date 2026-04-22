"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

interface Questionnaire {
  id: string;
  name: string;
  fileName: string;
  status: string;
  totalQuestions: number;
  approvedAnswers?: number;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle2 }
> = {
  UPLOADED: { label: "Uploaded", class: "bg-light-4/10 text-light-3", icon: FileSpreadsheet },
  PROCESSING: { label: "Generating", class: "bg-info/10 text-info", icon: Loader2 },
  IN_REVIEW: { label: "In Review", class: "bg-warning/10 text-warning", icon: AlertTriangle },
  COMPLETED: { label: "Completed", class: "bg-success/10 text-success", icon: CheckCircle2 },
  FAILED: { label: "Failed", class: "bg-danger/10 text-danger", icon: AlertTriangle },
};

function QuestionnairesContent({ workspaceId }: { workspaceId: string }) {
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiGet<Questionnaire[]>(
          `/workspaces/${workspaceId}/questionnaires`,
        );
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} />;

  const filtered = items.filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (search && !q.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-heading text-2xl font-bold">Questionnaires</h2>
          <p className="text-sm text-light-3 mt-1">
            {items.length} total questionnaire{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/dashboard/questionnaires/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Questionnaire
        </Link>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] flex-1 max-w-md">
          <Search className="w-4 h-4 text-light-3" />
          <input
            type="text"
            placeholder="Search questionnaires..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "PROCESSING", "IN_REVIEW", "COMPLETED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === s
                ? "bg-brand/10 text-brand border border-brand/20"
                : "bg-dark-3/50 text-light-3 border border-white/[0.06] hover:text-light-2"
                }`}
            >
              {s === "all" ? "All" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_100px_120px_110px] gap-4 px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider">
          <span>Name</span>
          <span>Questions</span>
          <span>Status</span>
          <span>Created</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-light-3 text-sm">
            {items.length === 0
              ? "No questionnaires yet — upload one to get started."
              : "No questionnaires match your filters."}
          </div>
        )}

        {filtered.map((q) => {
          const cfg = statusConfig[q.status] || statusConfig.UPLOADED;
          const StatusIcon = cfg.icon;
          return (
            <Link
              key={q.id}
              href={`/dashboard/questionnaires/${q.id}`}
              className="group grid grid-cols-1 lg:grid-cols-[1fr_100px_120px_110px] gap-2 lg:gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className="w-4 h-4 text-light-4 shrink-0" />
                <span className="text-sm font-medium text-light truncate group-hover:text-brand transition-colors">
                  {q.name}
                </span>
              </div>
              <span className="text-sm text-light-2 font-mono">
                {q.totalQuestions}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${cfg.class}`}
              >
                <StatusIcon
                  className={`w-3 h-3 ${q.status === "PROCESSING" ? "animate-spin" : ""
                    }`}
                />
                {cfg.label}
              </span>
              <span className="text-xs text-light-3">
                {formatDate(q.createdAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function QuestionnairesPage() {
  return (
    <WorkspaceGate>{(id) => <QuestionnairesContent workspaceId={id} />}</WorkspaceGate>
  );
}
