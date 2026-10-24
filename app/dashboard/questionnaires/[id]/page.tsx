"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  Search,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Lock,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Database,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { useQuestionnaireStore } from "@/lib/store";
import type { QuestionRow, QuestionnaireDetail } from "@/lib/store/questionnaire-store";
import { WorkspaceGate, PageError, PageLoading } from "@/components/dashboard/workspace-state";
import { RoiSummaryBanner } from "@/components/dashboard/roi-summary-banner";
import { EvidenceInspectorDrawer } from "@/components/dashboard/evidence-inspector-drawer";
import { PolarCheckoutModal } from "@/components/dashboard/polar-checkout-modal";

type TriageTab = "verified" | "review" | "missing" | "all";

function confidenceColor(conf: number) {
  return conf >= 85 ? "text-emerald-400" : conf >= 50 ? "text-amber-400" : "text-red-400";
}
function confidenceBg(conf: number) {
  return conf >= 85 ? "bg-emerald-500" : conf >= 50 ? "bg-amber-500" : "bg-red-500";
}

function QuestionnaireContent({
  workspaceId,
  questionnaireId,
}: {
  workspaceId: string;
  questionnaireId: string;
}) {
  const currentQuestionnaire = useQuestionnaireStore((s) => s.currentQuestionnaire);
  const fetchQuestionnaireById = useQuestionnaireStore((s) => s.fetchQuestionnaireById);
  const updateQuestionAction = useQuestionnaireStore((s) => s.updateQuestion);
  const bulkApproveAction = useQuestionnaireStore((s) => s.bulkApproveVerified);
  const exportQuestionnaireAction = useQuestionnaireStore((s) => s.exportQuestionnaire);
  const isBulkApproving = useQuestionnaireStore((s) => s.isBulkApproving);
  const isSavingAnswer = useQuestionnaireStore((s) => s.isSavingAnswer);
  const billingInfo = useQuestionnaireStore((s) => s.billingInfo);
  const fetchBillingInfo = useQuestionnaireStore((s) => s.fetchBillingInfo);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triageTab, setTriageTab] = useState<TriageTab>("verified");
  const [search, setSearch] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const shouldPoll = (status: string) =>
      status === "PROCESSING" || status === "GENERATING";

    const load = async () => {
      try {
        const res = await fetchQuestionnaireById(workspaceId, questionnaireId);
        if (!cancelled && res) {
          setError(null);
          if (shouldPoll(res.status) && !interval) {
            interval = setInterval(load, 4000);
          } else if (!shouldPoll(res.status) && interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load questionnaire");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    void fetchBillingInfo(workspaceId);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [workspaceId, questionnaireId, fetchQuestionnaireById, fetchBillingInfo]);

  const data = currentQuestionnaire;
  const isUnlocked = Boolean(data?.isUnlocked || billingInfo?.isPro);
  const questions: QuestionRow[] = data?.questions || [];

  // Group into 3 Triage Buckets
  const verifiedBucket = useMemo(
    () =>
      questions.filter(
        (q) =>
          (q.confidence !== null && q.confidence >= 85) || q.status === "APPROVED"
      ),
    [questions]
  );

  const needsReviewBucket = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.status !== "APPROVED" &&
          q.confidence !== null &&
          q.confidence >= 50 &&
          q.confidence < 85 &&
          Boolean(q.answerText)
      ),
    [questions]
  );

  const missingEvidenceBucket = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.status !== "APPROVED" &&
          ((q.confidence !== null && q.confidence < 50) || !q.answerText || q.confidence === null)
      ),
    [questions]
  );

  const unapprovedVerifiedCount = useMemo(
    () => verifiedBucket.filter((q) => q.status !== "APPROVED").length,
    [verifiedBucket]
  );

  const approvedCount = questions.filter((q) => q.status === "APPROVED").length;
  const totalCount = questions.length;
  const progressPercent =
    totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Filtered by current tab & search
  const filteredQuestions = useMemo(() => {
    let list: QuestionRow[] = [];
    if (triageTab === "verified") list = verifiedBucket;
    else if (triageTab === "review") list = needsReviewBucket;
    else if (triageTab === "missing") list = missingEvidenceBucket;
    else list = questions;

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (q) =>
          q.questionText.toLowerCase().includes(s) ||
          (q.answerText && q.answerText.toLowerCase().includes(s)) ||
          (q.auditorCritique && q.auditorCritique.toLowerCase().includes(s))
      );
    }
    return list;
  }, [triageTab, search, verifiedBucket, needsReviewBucket, missingEvidenceBucket, questions]);

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) || null,
    [questions, selectedQuestionId]
  );

  const handleBulkApprove = async () => {
    try {
      const res = await bulkApproveAction(workspaceId, questionnaireId);
      toast.success(
        `Approved ${res.newlyApprovedCount} Verified Answers!`,
        {
          description: "All grounded answers are now marked approved with 100% citation backing.",
        }
      );
    } catch (e) {
      toast.error("Bulk approval failed", {
        description: e instanceof Error ? e.message : "Could not bulk approve answers",
      });
    }
  };

  const handleSaveQuestion = async (
    questionId: string,
    dto: { answerText: string; status: string; saveToVault: boolean }
  ) => {
    try {
      await updateQuestionAction(workspaceId, questionnaireId, questionId, dto);
      if (dto.saveToVault) {
        toast.success("Answer Approved & Saved to Knowledge Vault!", {
          description: "Future questionnaires will auto-retrieve this verified answer with team approval badge.",
        });
      } else {
        toast.success("Answer updated and approved successfully");
      }
    } catch (e) {
      toast.error("Failed to update answer", {
        description: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  };

  const handleExport = async () => {
    if (!data || exporting) return;

    if (!isUnlocked) {
      setCheckoutModalOpen(true);
      return;
    }

    setExporting(true);
    try {
      const res = await exportQuestionnaireAction(workspaceId, questionnaireId, data.name);
      if (res.success) {
        toast.success("Spreadsheet Exported!", {
          description: "All answers, confidence scores, and citations have been downloaded.",
        });
      } else {
        if (res.isLocked) {
          setCheckoutModalOpen(true);
        } else {
          toast.error("Export failed", {
            description: res.error || "Could not generate export spreadsheet",
          });
        }
      }
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error || !data) return <PageError message={error || "Questionnaire not found"} />;

  const isGenerating = data.status === "PROCESSING" || data.status === "GENERATING";

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      {/* Top Navigation & Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/dashboard/questionnaires"
          className="inline-flex items-center gap-1.5 text-xs text-light-3 hover:text-light mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Questionnaires
        </Link>

        {/* Header Title & Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-light tracking-tight">
                {data.name}
              </h1>
              {data.roundTripPreserved && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Round-Trip Preserved
                </span>
              )}
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Licensed for Export
                </span>
              ) : (
                <button
                  onClick={() => setCheckoutModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-light-3 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Free Preview · Unlock Export
                </button>
              )}
            </div>
            <p className="text-xs text-light-4 mt-1 font-mono">
              {data.fileName} · Created {formatDate(data.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isGenerating && (
              <span className="inline-flex items-center gap-1.5 text-xs text-info px-3 py-1.5 rounded-full bg-info/10">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating answers…
              </span>
            )}

            <button
              onClick={handleExport}
              disabled={exporting || isGenerating}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all disabled:cursor-not-allowed cursor-pointer shadow-sm ${
                isUnlocked
                  ? "text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50"
                  : "text-white bg-white/[0.08] hover:bg-white/[0.14]"
              }`}
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : !isUnlocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {exporting
                ? "Exporting..."
                : !isUnlocked
                ? "Unlock to Export"
                : data.roundTripPreserved
                ? "Export Original (Preserved)"
                : "Export to Excel"}
            </button>
          </div>
        </div>

        {/* Feature 2: Lean integrated progress track */}
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-light-3 font-medium">
                Approved <strong className="text-light font-mono">{approvedCount}</strong> of <strong className="text-light font-mono">{totalCount}</strong>
              </span>
              {progressPercent === 100 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  <Sparkles className="w-3 h-3" />
                  100% Ready for Client Delivery
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-light-4">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent === 100
                  ? "bg-emerald-400"
                  : "bg-brand"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* FEATURE 1: Live ROI Telemetry Header Banner */}
      <RoiSummaryBanner
        questions={questions}
        totalQuestions={data.totalQuestions || questions.length}
      />

      {/* FEATURE 2: 3-Bucket Triage Tabs & 1-Click Bulk Approval Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-1">
        {/* Modern Segmented Control */}
        <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.03] gap-1 flex-wrap">
          {/* Tab 1: Verified & Grounded */}
          <button
            onClick={() => setTriageTab("verified")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              triageTab === "verified"
                ? "bg-white/[0.08] text-emerald-300 shadow-sm"
                : "text-light-4 hover:text-light-2 hover:bg-white/[0.02]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified &amp; Grounded</span>
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.06] text-emerald-300/90">
              {verifiedBucket.length}
            </span>
          </button>

          {/* Tab 2: Needs Quick Check */}
          <button
            onClick={() => setTriageTab("review")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              triageTab === "review"
                ? "bg-white/[0.08] text-amber-300 shadow-sm"
                : "text-light-4 hover:text-light-2 hover:bg-white/[0.02]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Needs Quick Check</span>
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.06] text-amber-300/90">
              {needsReviewBucket.length}
            </span>
          </button>

          {/* Tab 3: Missing Evidence */}
          <button
            onClick={() => setTriageTab("missing")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              triageTab === "missing"
                ? "bg-white/[0.08] text-red-300 shadow-sm"
                : "text-light-4 hover:text-light-2 hover:bg-white/[0.02]"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Missing Evidence</span>
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.06] text-red-300/90">
              {missingEvidenceBucket.length}
            </span>
          </button>

          {/* Tab 4: All Rows */}
          <button
            onClick={() => setTriageTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              triageTab === "all"
                ? "bg-white/[0.08] text-light shadow-sm"
                : "text-light-4 hover:text-light-2 hover:bg-white/[0.02]"
            }`}
          >
            All Rows ({questions.length})
          </button>
        </div>

        {/* Right side: Search + 1-Click Bulk Approval Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-light-4" />
            <input
              type="text"
              placeholder="Filter questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-light placeholder-light-4 outline-none w-full"
            />
          </div>

          {/* Feature 2: 1-Click Bulk Approval Button for Tab 1 */}
          {triageTab === "verified" && unapprovedVerifiedCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkApprove}
              disabled={isBulkApproving}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-dark bg-emerald-400 hover:bg-emerald-300 disabled:bg-emerald-400/50 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
            >
              {isBulkApproving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-current text-dark" />
              )}
              {isBulkApproving
                ? "Approving..."
                : `Approve All ${unapprovedVerifiedCount} Verified Answers`}
            </motion.button>
          )}
        </div>
      </div>

      {/* Strict Guardrail Alert Banner for Tab 3 (FEATURE 2) - Lean & Borderless */}
      {triageTab === "missing" && (
        <div className="rounded-xl bg-red-500/[0.07] p-4 flex items-start gap-3">
          <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-red-300 font-semibold block">
              STRICT ANTI-HALLUCINATION GUARDRAIL ACTIVE
            </strong>
            <p className="text-light-3 mt-1 leading-relaxed">
              Vaultix refused to guess because no uploaded document covers these topics.
              Click any question below to provide your team&apos;s verified answer. When saved with{" "}
              <span className="text-emerald-400 font-medium">&ldquo;Save to Knowledge Vault&rdquo;</span>,
              Vaultix will remember it forever for all future questionnaires.
            </p>
          </div>
        </div>
      )}

      {/* FEATURE 3: Split-Screen View: Question Table (Left) + Evidence Inspector Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Questions List */}
        <div
          className={`space-y-3 transition-all duration-300 ${
            selectedQuestionId ? "lg:col-span-7" : "lg:col-span-12"
          }`}
        >
          <div className="rounded-2xl bg-dark-2/40 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div
              className={`hidden md:grid gap-3 px-5 py-3 border-b border-white/[0.04] text-[11px] font-medium text-light-4 uppercase tracking-wider items-center ${
                selectedQuestionId
                  ? "grid-cols-[40px_1fr_90px_90px]"
                  : "grid-cols-[40px_1.5fr_2fr_90px_100px]"
              }`}
            >
              <span>#</span>
              <span>Question</span>
              {!selectedQuestionId && <span>Grounded AI Answer</span>}
              <span>Confidence</span>
              <span>Status</span>
            </div>

            {/* Empty State */}
            {filteredQuestions.length === 0 && (
              <div className="px-5 py-14 text-center text-xs text-light-4">
                {isGenerating
                  ? "Answers are being generated. This view refreshes automatically."
                  : search
                  ? "No questions match your search query."
                  : triageTab === "missing"
                  ? "No missing evidence questions! 100% of questions are grounded in your documentation."
                  : triageTab === "review"
                  ? "Zero quick checks remaining! All answers are high-confidence verified."
                  : "No questions in this filter."}
              </div>
            )}

            {/* Rows: Lean, subtle hover & active highlight */}
            {filteredQuestions.map((row) => {
              const conf = Math.round(row.confidence ?? 0);
              const isSelected = selectedQuestionId === row.id;
              const hasAuditorCritique = Boolean(row.auditorCritique);
              const isApproved = row.status === "APPROVED";
              const isPreviouslyApproved =
                row.verifiedFromVault ||
                (row.auditorCritique &&
                  row.auditorCritique.toLowerCase().includes("previously approved"));

              return (
                <div
                  key={row.id}
                  onClick={() =>
                    setSelectedQuestionId(isSelected ? null : row.id)
                  }
                  className={`border-b border-white/[0.02] last:border-b-0 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.04]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div
                    className={`grid gap-3 px-4 sm:px-5 py-3.5 items-start ${
                      selectedQuestionId
                        ? "grid-cols-1 md:grid-cols-[40px_1fr_90px_90px]"
                        : "grid-cols-1 md:grid-cols-[40px_1.5fr_2fr_90px_100px]"
                    }`}
                  >
                    {/* Index + Active Indicator */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-light-4 pt-0.5">
                      {isSelected ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      ) : null}
                      <span>{row.rowIndex + 1}</span>
                    </div>

                    {/* Question text */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-medium text-light leading-relaxed">
                          {row.questionText}
                        </p>
                      </div>

                      {/* FEATURE 2: Needs Quick Check critique banner - borderless */}
                      {hasAuditorCritique && triageTab === "review" && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-500/[0.08] text-[11px] text-amber-300 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{row.auditorCritique}</span>
                        </div>
                      )}

                      {/* FEATURE 2: Missing Evidence alert banner - borderless */}
                      {!row.answerText && triageTab === "missing" && (
                        <div className="mt-2 p-2.5 rounded-lg bg-red-500/[0.08] text-[11px] text-red-300 flex items-start gap-2">
                          <Lock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            Vaultix refused to guess because no uploaded document covers this topic.
                          </span>
                        </div>
                      )}

                      {/* Citations snippet preview when collapsed */}
                      {!selectedQuestionId && row.citations.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-light-4">
                          <FileText className="w-3 h-3 text-brand" />
                          <span className="truncate">
                            {row.citations[0].sourceDocument}
                            {row.citations[0].pageNumber && ` (p. ${row.citations[0].pageNumber})`}
                          </span>
                          {row.citations.length > 1 && (
                            <span className="text-[10px] text-light-4 font-mono">
                              +{row.citations.length - 1} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Answer preview (when drawer is closed) */}
                    {!selectedQuestionId && (
                      <div>
                        {row.answerText ? (
                          <p className="text-xs text-light-3 leading-relaxed line-clamp-2">
                            {row.answerText}
                          </p>
                        ) : (
                          <span className="text-xs italic text-red-400/70">
                            Strict Guardrail: No answer generated
                          </span>
                        )}
                      </div>
                    )}

                    {/* Confidence score */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${confidenceBg(conf)}`}
                            style={{ width: `${conf}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono font-semibold ${confidenceColor(
                            conf
                          )}`}
                        >
                          {conf}%
                        </span>
                      </div>

                      {isPreviouslyApproved ? (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          Vault Memory
                        </span>
                      ) : conf >= 85 ? (
                        <span className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Audited
                        </span>
                      ) : null}
                    </div>

                    {/* Status badge: Lean & clean */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md font-medium ${
                          isApproved
                            ? "bg-emerald-500/10 text-emerald-400"
                            : row.status === "REVIEW"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-white/[0.04] text-light-4"
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                        {row.status === "REVIEW" && <AlertTriangle className="w-3 h-3" />}
                        {isApproved ? "Approved" : row.status === "REVIEW" ? "Review" : "Draft"}
                      </span>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform text-light-4 ${
                          isSelected ? "rotate-90 text-brand" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Split-Screen Evidence Inspector Drawer (FEATURE 3 & 4) */}
        {selectedQuestionId && (
          <div className="lg:col-span-5 sticky top-6 max-h-[calc(100vh-5rem)]">
            <EvidenceInspectorDrawer
              question={selectedQuestion}
              onClose={() => setSelectedQuestionId(null)}
              onSave={handleSaveQuestion}
              isSaving={isSavingAnswer}
            />
          </div>
        )}
      </div>

      <PolarCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        workspaceId={workspaceId}
        questionnaireId={questionnaireId}
        questionnaireName={data.name}
        onUnlocked={async () => {
          await fetchQuestionnaireById(workspaceId, questionnaireId);
          await fetchBillingInfo(workspaceId);
          void exportQuestionnaireAction(workspaceId, questionnaireId, data.name);
        }}
      />
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
