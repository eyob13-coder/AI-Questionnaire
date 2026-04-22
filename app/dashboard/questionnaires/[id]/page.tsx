"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Search,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

type AnswerStatus = "DRAFT" | "REVIEW" | "APPROVED" | string;

interface Citation {
  id: string;
  sourceDocument: string;
  pageNumber: number | null;
  excerpt: string | null;
}

interface Question {
  id: string;
  rowIndex: number;
  questionText: string;
  answerText: string | null;
  confidence: number | null;
  status: AnswerStatus;
  citations: Citation[];
}

interface QuestionnaireDetails {
  id: string;
  name: string;
  fileName: string;
  status: string;
  totalQuestions: number;
  createdAt: string;
  questions: Question[];
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "REVIEW", label: "Needs Review" },
  { value: "APPROVED", label: "Approved" },
];

function statusBadge(status: AnswerStatus) {
  const cfg: Record<string, string> = {
    APPROVED: "bg-success/10 text-success",
    REVIEW: "bg-warning/10 text-warning",
    DRAFT: "bg-light-4/10 text-light-3",
  };
  const cls = cfg[status] || cfg.DRAFT;
  const label =
    status === "APPROVED"
      ? "Approved"
      : status === "REVIEW"
        ? "Review"
        : "Draft";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}
    >
      {status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
      {status === "REVIEW" && <AlertTriangle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function confidenceColor(conf: number) {
  return conf >= 80 ? "text-success" : conf >= 50 ? "text-warning" : "text-danger";
}
function confidenceBg(conf: number) {
  return conf >= 80 ? "bg-success" : conf >= 50 ? "bg-warning" : "bg-danger";
}

function QuestionnaireContent({
  workspaceId,
  questionnaireId,
}: {
  workspaceId: string;
  questionnaireId: string;
}) {
  const [data, setData] = useState<QuestionnaireDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const res = await apiGet<QuestionnaireDetails>(
          `/workspaces/${workspaceId}/questionnaires/${questionnaireId}`,
        );
        if (!cancelled) {
          setData(res);
          setError(null);
          if (res.status === "PROCESSING" && !interval) {
            interval = setInterval(load, 5000);
          } else if (res.status !== "PROCESSING" && interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [workspaceId, questionnaireId]);

  if (loading) return <PageLoading />;
  if (error || !data) return <PageError message={error || "Not found"} />;

  const questions = data.questions || [];
  const approved = questions.filter((q) => q.status === "APPROVED").length;
  const review = questions.filter((q) => q.status === "REVIEW").length;
  const draft = questions.filter((q) => q.status === "DRAFT").length;
  const progress =
    data.totalQuestions > 0
      ? Math.round((approved / data.totalQuestions) * 100)
      : 0;

  const filtered = questions.filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !q.questionText.toLowerCase().includes(s) &&
        !(q.answerText || "").toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/dashboard/questionnaires"
          className="inline-flex items-center gap-1.5 text-sm text-light-3 hover:text-light mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questionnaires
        </Link>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold">
              {data.name}
            </h2>
            <p className="text-sm text-light-3 mt-1 font-mono">
              {data.fileName} · Created {formatDate(data.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data.status === "PROCESSING" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-info">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating answers…
              </span>
            )}
            <button
              disabled
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand/50 rounded-full cursor-not-allowed"
              title="Coming soon"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 h-2 rounded-full bg-dark-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="text-success font-mono">{approved} approved</span>
            <span className="text-warning font-mono">{review} review</span>
            <span className="text-light-3 font-mono">{draft} draft</span>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((f) => {
            const count =
              f.value === "all"
                ? questions.length
                : questions.filter((a) => a.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.value
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "bg-dark-3/50 text-light-3 border border-white/[0.06] hover:text-light-2"
                  }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-3/50 border border-white/[0.06] sm:w-64">
          <Search className="w-4 h-4 text-light-3" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="hidden lg:grid grid-cols-[40px_1fr_1fr_90px_100px] gap-3 px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider items-center">
          <span>#</span>
          <span>Question</span>
          <span>AI Answer</span>
          <span>Score</span>
          <span>Status</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-light-3">
            {data.status === "PROCESSING"
              ? "Answers are being generated. This page will refresh automatically."
              : "No answers match your filters."}
          </div>
        )}

        {filtered.map((row) => {
          const conf = Math.round(row.confidence ?? 0);
          return (
            <div key={row.id} className="border-b border-white/[0.04]">
              <div
                onClick={() =>
                  setExpandedRow(expandedRow === row.id ? null : row.id)
                }
                className={`grid grid-cols-1 lg:grid-cols-[40px_1fr_1fr_90px_100px] gap-2 lg:gap-3 px-4 lg:px-5 py-4 hover:bg-white/[0.015] transition-colors items-start cursor-pointer ${expandedRow === row.id ? "bg-white/[0.02]" : ""
                  }`}
              >
                <span className="hidden lg:block text-xs text-light-3 font-mono pt-0.5">
                  {row.rowIndex}
                </span>
                <p className="text-sm text-light leading-relaxed">
                  {row.questionText}
                </p>
                <p className="text-sm text-light-2 leading-relaxed line-clamp-2">
                  {row.answerText || (
                    <span className="text-light-4 italic">
                      Awaiting AI answer…
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-1.5 rounded-full bg-dark-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${confidenceBg(conf)}`}
                      style={{ width: `${conf}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold ${confidenceColor(
                      conf,
                    )}`}
                  >
                    {conf}%
                  </span>
                </div>
                <div>{statusBadge(row.status)}</div>
              </div>

              {expandedRow === row.id && row.citations.length > 0 && (
                <div className="px-5 pb-4 lg:pl-[64px]">
                  <div className="rounded-xl bg-dark-3/40 border border-white/[0.06] p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-light-3 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Citations ({row.citations.length})
                    </h4>
                    {row.citations.map((cit, ci) => (
                      <div key={cit.id} className="flex items-start gap-3 text-xs">
                        <span className="text-brand font-mono shrink-0">
                          [{ci + 1}]
                        </span>
                        <div className="min-w-0">
                          <p className="text-light-2 font-medium">
                            {cit.sourceDocument}
                            {cit.pageNumber && (
                              <span className="text-light-4">
                                {" "}
                                · p.{cit.pageNumber}
                              </span>
                            )}
                          </p>
                          {cit.excerpt && (
                            <p className="text-light-3 mt-0.5 italic">
                              &ldquo;{cit.excerpt}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuestionnaireReviewPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return <PageError message="Missing questionnaire id" />;
  return (
    <WorkspaceGate>
      {(wsId) => (
        <QuestionnaireContent workspaceId={wsId} questionnaireId={id} />
      )}
    </WorkspaceGate>
  );
}
