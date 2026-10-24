"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  DollarSign,
  Timer,
  Settings,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import type { QuestionRow } from "@/lib/store/questionnaire-store";

interface RoiSummaryBannerProps {
  questions: QuestionRow[];
  totalQuestions: number;
}

export function RoiSummaryBanner({ questions, totalQuestions }: RoiSummaryBannerProps) {
  const [hourlyRate, setHourlyRate] = useState<number>(85);
  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [tempRate, setTempRate] = useState<string>("85");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vaultix_hourly_rate");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val > 0) {
          setHourlyRate(val);
          setTempRate(val.toString());
        }
      }
    } catch {
      // localStorage may fail in restricted sandbox
    }
  }, []);

  const saveRate = () => {
    const val = parseInt(tempRate, 10);
    if (!isNaN(val) && val > 0) {
      setHourlyRate(val);
      try {
        localStorage.setItem("vaultix_hourly_rate", val.toString());
      } catch {
        // ignore
      }
    }
    setIsEditingRate(false);
  };

  // 3-Bucket categorization for live ROI Telemetry:
  // Tab 1: Verified & Grounded (>= 85% or APPROVED)
  // Tab 2: Needs Quick Check (50% - 84% & not yet approved)
  // Tab 3: Missing Evidence (< 50% or null answer & not approved)
  const verifiedCount = questions.filter(
    (q) => (q.confidence !== null && q.confidence >= 85) || q.status === "APPROVED"
  ).length;

  const needsReviewCount = questions.filter(
    (q) =>
      q.status !== "APPROVED" &&
      q.confidence !== null &&
      q.confidence >= 50 &&
      q.confidence < 85 &&
      Boolean(q.answerText)
  ).length;

  const missingEvidenceCount = questions.filter(
    (q) =>
      q.status !== "APPROVED" &&
      ((q.confidence !== null && q.confidence < 50) || !q.answerText || q.confidence === null)
  ).length;

  const effectiveTotal = totalQuestions > 0 ? totalQuestions : questions.length;
  const coveragePercent =
    effectiveTotal > 0 ? Math.round((verifiedCount / effectiveTotal) * 100) : 0;

  // Formula as specified in requirements:
  // Hours Saved: (verifiedCount * 4.5 + needsReviewCount * 2.5) / 60
  const hoursSaved = (verifiedCount * 4.5 + needsReviewCount * 2.5) / 60;
  const manualBaselineHours = (effectiveTotal * 4.5) / 60;
  const moneySaved = hoursSaved * hourlyRate;
  const reviewTimeMinutes = needsReviewCount * 1.0 + missingEvidenceCount * 2.5;

  return (
    <div className="relative rounded-2xl bg-dark-2/60 backdrop-blur-xl p-5 shadow-sm">
      {/* Header bar: minimal, quiet, lean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs uppercase tracking-wider font-semibold text-light-3">
            Deal Telemetry &amp; ROI
          </h2>
          <span className="text-[11px] text-light-4 font-mono hidden md:inline">
            · 4.5m manual baseline
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <AnimatePresence mode="wait">
            {isEditingRate ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-2.5 py-1"
              >
                <span className="text-xs text-light-4">$</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-12 bg-transparent text-xs text-light font-mono outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRate();
                    if (e.key === "Escape") setIsEditingRate(false);
                  }}
                />
                <span className="text-xs text-light-4">/hr</span>
                <button
                  onClick={saveRate}
                  className="p-1 text-emerald-400 hover:text-emerald-300 rounded cursor-pointer transition-colors"
                  title="Save rate"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsEditingRate(false)}
                  className="p-1 text-light-4 hover:text-light-2 rounded cursor-pointer transition-colors"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => {
                  setTempRate(hourlyRate.toString());
                  setIsEditingRate(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-light-3 hover:text-light bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
                title="Adjust your team's hourly engineering rate"
              >
                <Settings className="w-3 h-3 text-light-4" />
                <span>Rate: <strong className="text-light-2 font-mono">${hourlyRate}/hr</strong></span>
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4 Metric Cards: Lean, modern, borderless layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 lg:divide-x lg:divide-white/[0.04]">
        {/* Metric 1: Auto-Verified Coverage */}
        <div className="lg:px-4 first:lg:pl-0 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-medium text-light-4">
              Auto-Verified Coverage
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-emerald-400 tracking-tight">
                {coveragePercent}%
              </span>
              <span className="text-xs text-light-4 font-mono">
                ({verifiedCount}/{effectiveTotal})
              </span>
            </div>
            <p className="text-[11px] text-light-4 mt-0.5">
              Zero-hallucination grounded
            </p>
          </div>
        </div>

        {/* Metric 2: Time Saved on Deal */}
        <div className="lg:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-medium text-light-4">
              Time Saved on Deal
            </span>
            <Clock className="w-3.5 h-3.5 text-brand/80" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-light tracking-tight">
                {hoursSaved.toFixed(1)} hrs
              </span>
              <span className="text-xs text-emerald-400/90 font-medium">Saved</span>
            </div>
            <p className="text-[11px] text-light-4 mt-0.5 font-mono">
              vs. {manualBaselineHours.toFixed(1)} hrs manual baseline
            </p>
          </div>
        </div>

        {/* Metric 3: Engineering Cost Saved */}
        <div className="lg:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-medium text-light-4">
              Engineering Cost Saved
            </span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400/80" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-emerald-400 tracking-tight">
                ${Math.round(moneySaved).toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400/70 font-medium">Saved</span>
            </div>
            <p className="text-[11px] text-light-4 mt-0.5">
              At ${hourlyRate}/hr team rate
            </p>
          </div>
        </div>

        {/* Metric 4: Est. Review Time Left */}
        <div className="lg:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-medium text-light-4">
              Review Time Left
            </span>
            <Timer className="w-3.5 h-3.5 text-amber-400/80" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-amber-400 tracking-tight">
                ~{Math.ceil(reviewTimeMinutes)} mins
              </span>
              <span className="text-xs text-light-4 font-mono">left</span>
            </div>
            <p className="text-[11px] text-light-4 mt-0.5">
              {needsReviewCount} check{needsReviewCount === 1 ? "" : "s"} · {missingEvidenceCount} gap{missingEvidenceCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoiSummaryBanner;
