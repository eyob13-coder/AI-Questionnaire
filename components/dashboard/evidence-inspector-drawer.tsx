"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Database,
  Lock,
  Loader2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { QuestionRow } from "@/lib/store/questionnaire-store";
import { toast } from "sonner";

interface EvidenceInspectorDrawerProps {
  question: QuestionRow | null;
  onClose: () => void;
  onSave: (
    questionId: string,
    data: { answerText: string; status: string; saveToVault: boolean }
  ) => Promise<void>;
  isSaving?: boolean;
}

export function EvidenceInspectorDrawer({
  question,
  onClose,
  onSave,
  isSaving = false,
}: EvidenceInspectorDrawerProps) {
  const [answerText, setAnswerText] = useState("");
  const [saveToVault, setSaveToVault] = useState(true);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setAnswerText(question.answerText || "");
      setSaveToVault(true);
    }
  }, [question]);

  if (!question) return null;

  const conf = Math.round(question.confidence ?? 0);
  const isHighConfidence = conf >= 85;
  const isMediumConfidence = conf >= 50 && conf < 85;
  const isMissingEvidence = conf < 50 || (!question.answerText && question.status !== "APPROVED");
  const isPreviouslyApproved =
    question.verifiedFromVault ||
    (question.auditorCritique &&
      question.auditorCritique.toLowerCase().includes("previously approved"));

  const handleCopyExcerpt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationId(id);
    toast.success("Citation excerpt copied to clipboard");
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const handleSaveAndApprove = async () => {
    await onSave(question.id, {
      answerText,
      status: "APPROVED",
      saveToVault,
    });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col h-full rounded-2xl bg-dark-2/95 shadow-xl backdrop-blur-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-light-4 px-2 py-0.5 rounded-md bg-white/[0.04]">
            Row #{question.rowIndex + 1}
          </span>

          {isPreviouslyApproved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Previously Approved by Team
            </span>
          ) : isHighConfidence ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {conf}% Grounded
            </span>
          ) : isMediumConfidence ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {conf}% Needs Human Check
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              Missing Evidence ({conf}%)
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-light-4 hover:text-light hover:bg-white/[0.04] transition-colors cursor-pointer"
          title="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Question: Clean editorial typography without heavy box */}
        <div>
          <span className="text-[11px] uppercase tracking-wider font-medium text-light-4 block mb-1">
            Question
          </span>
          <p className="text-sm font-medium text-light leading-relaxed">
            {question.questionText}
          </p>
        </div>

        {/* Auditor Verification Note: Lean tinted strip */}
        <div
          className={`rounded-xl p-3.5 text-xs leading-relaxed ${
            isPreviouslyApproved || isHighConfidence
              ? "bg-emerald-500/[0.07] text-emerald-300"
              : isMediumConfidence
              ? "bg-amber-500/[0.07] text-amber-300"
              : "bg-red-500/[0.07] text-red-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5 font-medium">
            {isHighConfidence || isPreviouslyApproved ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : isMediumConfidence ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
            )}
            <span>
              {isPreviouslyApproved
                ? "Knowledge Vault Match"
                : isHighConfidence
                ? "Dual-Model Adversarial Audit: Verified"
                : isMediumConfidence
                ? "Dual-Model Adversarial Audit: Human Eye Needed"
                : "Strict Guardrail: Evidence Missing"}
            </span>
          </div>

          <p className="text-light-3 leading-relaxed">
            {question.auditorCritique ||
              (isHighConfidence
                ? "Generator draft was independently verified against cited security documentation with 95%+ grounded confidence."
                : isMediumConfidence
                ? "The policy discusses this area but leaves specific commitments ambiguous. Human check recommended."
                : "Vaultix refused to guess because no uploaded document covers this topic.")}
          </p>
        </div>

        {/* Exact Source Excerpt Card (FEATURE 3) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-medium text-light-4 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand" />
              Source Excerpts ({question.citations.length})
            </span>
            <span className="text-[11px] text-light-4 font-mono">
              Verbatim Grounding
            </span>
          </div>

          {question.citations.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] p-4 text-center">
              <Lock className="w-5 h-5 text-red-400/70 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-light-2">
                No Source Document in Knowledge Base
              </p>
              <p className="text-[11px] text-light-4 mt-0.5">
                Vaultix strictly refused to hallucinate or guess. Type your verified response below to save it forever.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {question.citations.map((cit, idx) => (
                <div
                  key={cit.id || idx}
                  className="rounded-xl bg-white/[0.02] hover:bg-white/[0.03] p-3 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-brand font-mono text-xs shrink-0">
                        [{idx + 1}]
                      </span>
                      <span className="text-xs font-medium text-light truncate">
                        {cit.sourceDocument}
                      </span>
                      {cit.pageNumber && (
                        <span className="text-[11px] text-light-4 font-mono shrink-0">
                          · p.{cit.pageNumber}
                        </span>
                      )}
                    </div>

                    {cit.excerpt && (
                      <button
                        onClick={() => handleCopyExcerpt(cit.id, cit.excerpt!)}
                        className="p-1 rounded text-light-4 hover:text-light transition-colors cursor-pointer"
                        title="Copy exact excerpt"
                      >
                        {copiedCitationId === cit.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {cit.excerpt && (
                    <div className="rounded-lg bg-white/[0.02] p-2.5">
                      <p className="text-xs text-light-3 leading-relaxed font-mono select-all">
                        &ldquo;{cit.excerpt}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Final Answer (Editable Textarea) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wider font-medium text-light-4">
              Final Answer (Editable)
            </label>
            <span className="text-[11px] text-light-4 font-mono">
              {answerText.length} characters
            </span>
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={5}
            placeholder={
              isMissingEvidence
                ? "Vaultix refused to guess. Enter your team's official verified answer here..."
                : "Type or edit the final answer for this questionnaire..."
            }
            className="w-full rounded-xl bg-white/[0.03] focus:bg-white/[0.05] p-3.5 text-xs text-light leading-relaxed outline-none resize-y transition-colors font-sans placeholder-light-4"
          />
        </div>

        {/* FEATURE 4: Fix Once, Remember Forever Checkbox */}
        <div className="rounded-xl bg-white/[0.02] p-3.5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveToVault}
              onChange={(e) => setSaveToVault(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-white/[0.05] text-brand focus:ring-brand accent-brand cursor-pointer"
            />
            <div className="min-w-0">
              <span className="text-xs font-medium text-light flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand" />
                Save this verified Q&amp;A to Workspace Knowledge Vault
              </span>
              <p className="text-[11px] text-light-4 mt-1 leading-normal">
                Next time any enterprise questionnaire asks a similar question, Vaultix will pre-fill this team-verified answer automatically with a <span className="text-emerald-400 font-medium">&ldquo;Previously Approved by Your Team&rdquo;</span> badge.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-light-4 hover:text-light transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveAndApprove}
          disabled={isSaving || !answerText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-dark bg-emerald-400 hover:bg-emerald-300 disabled:bg-emerald-400/40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          {isSaving ? "Saving & Grounding..." : "Save & Approve Answer"}
        </button>
      </div>
    </motion.aside>
  );
}

export default EvidenceInspectorDrawer;
