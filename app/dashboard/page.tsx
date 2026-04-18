"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Eye,
  X,
  Sparkles,
} from "lucide-react";

/* ── Mock data ── */
const stats = [
  { label: "Total Questionnaires", value: "12", change: "+3 this week", icon: FileSpreadsheet, color: "text-brand" },
  { label: "Questions Answered", value: "847", change: "92% accepted", icon: CheckCircle2, color: "text-success" },
  { label: "Avg. Confidence", value: "84%", change: "+5% vs last month", icon: TrendingUp, color: "text-brand" },
  { label: "Time Saved", value: "36h", change: "This month", icon: Clock, color: "text-info" },
];

const recentQuestionnaires = [
  { id: "1", name: "SOC2 Type II Audit - Acme Corp", questions: 87, answered: 84, status: "review", date: "2 hours ago" },
  { id: "2", name: "ISO 27001 Vendor Assessment", questions: 142, answered: 142, status: "completed", date: "1 day ago" },
  { id: "3", name: "GDPR Data Processing Questionnaire", questions: 56, answered: 23, status: "generating", date: "3 days ago" },
  { id: "4", name: "Customer Security Review - TechCo", questions: 200, answered: 195, status: "review", date: "5 days ago" },
  { id: "5", name: "PCI DSS Compliance Check", questions: 94, answered: 94, status: "completed", date: "1 week ago" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  generating: { label: "Generating", class: "bg-info/10 text-info" },
  review: { label: "In Review", class: "bg-warning/10 text-warning" },
  completed: { label: "Completed", class: "bg-success/10 text-success" },
  draft: { label: "Draft", class: "bg-light-4/10 text-light-3" },
};

function OnboardingChecklist() {
  const steps = [
    { id: "kb", label: "Upload your first document", desc: "Add a policy or architecture doc to power AI answers.", href: "/dashboard/knowledge", icon: BookOpen },
    { id: "q", label: "Upload a questionnaire", desc: "Drop an .xlsx or .csv file to get AI-generated answers.", href: "/dashboard/questionnaires/new", icon: Upload },
    { id: "r", label: "Review your first AI answer", desc: "Approve, edit, or regenerate — then export.", href: "/dashboard/questionnaires", icon: CheckCircle2 },
  ];

  const [completed, setCompleted] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const doneCount = completed.length;
  const allDone = doneCount === steps.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.07] via-dark-3/40 to-transparent overflow-hidden"
      >
        {/* Top gradient line */}
        <div className="h-[2px] bg-gradient-to-r from-brand via-orange-400 to-amber-500" />

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold">Get started with Vaultix</h3>
                <p className="text-xs text-light-3 mt-0.5">{doneCount} of {steps.length} steps complete</p>
              </div>
            </div>
            <button onClick={() => setDismissed(true)} className="p-1 text-light-4 hover:text-light-2 rounded-lg transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-dark-4 mb-5 overflow-hidden">
            <motion.div
              animate={{ width: `${(doneCount / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-brand to-amber-400"
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {steps.map((step) => {
              const done = completed.includes(step.id);
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`relative rounded-xl border p-4 transition-all duration-200 ${done
                      ? "border-success/25 bg-success/[0.04]"
                      : "border-white/[0.06] bg-dark-3/30 hover:border-white/[0.12]"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setCompleted(c => done ? c.filter(x => x !== step.id) : [...c, step.id])}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? "border-success bg-success" : "border-white/20 hover:border-brand/50"
                        }`}
                    >
                      {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${done ? "text-light-3 line-through" : "text-light"}`}>{step.label}</p>
                      <p className="text-[11px] text-light-4 mt-0.5 leading-relaxed">{step.desc}</p>
                      {!done && (
                        <Link href={step.href} className="inline-flex items-center gap-1 mt-2 text-[11px] text-brand hover:text-brand-light font-medium transition-colors">
                          Start <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allDone && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">You&apos;re all set! Dismiss this when you&apos;re ready.</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Onboarding */}
      <OnboardingChecklist />

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back 👋
        </h2>
        <p className="text-light-2 mt-1">
          Here&apos;s what&apos;s happening with your questionnaires today.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-glow rounded-2xl bg-dark-3/50 border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold">{stat.value}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-light-3">{stat.label}</span>
              <span className="text-xs text-light-3 font-mono">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Link
            href="/dashboard/questionnaires/new"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center group-hover:bg-brand/25 transition-colors">
              <Upload className="w-6 h-6 text-brand" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-base font-semibold">Upload Questionnaire</h3>
              <p className="text-sm text-light-3">Drop a .xlsx or .csv file to get started</p>
            </div>
            <ArrowRight className="w-5 h-5 text-brand opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link
            href="/dashboard/knowledge"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-dark-3/50 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
              <BookOpen className="w-6 h-6 text-light-2" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-base font-semibold">Knowledge Base</h3>
              <p className="text-sm text-light-3">Manage your security documents</p>
            </div>
            <ArrowRight className="w-5 h-5 text-light-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </motion.div>
      </div>

      {/* Recent questionnaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold">Recent Questionnaires</h3>
          <Link
            href="/dashboard/questionnaires"
            className="text-sm text-brand hover:text-brand-light transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_120px_100px_100px] gap-4 px-5 py-3 bg-dark-3/50 text-xs font-semibold text-light-3 uppercase tracking-wider border-b border-white/[0.06]">
            <span>Name</span>
            <span>Questions</span>
            <span>Progress</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {/* Rows */}
          {recentQuestionnaires.map((q, i) => {
            const progress = Math.round((q.answered / q.questions) * 100);
            const cfg = statusConfig[q.status] || statusConfig.draft;

            return (
              <Link
                key={q.id}
                href={`/dashboard/questionnaires/${q.id}`}
                className="group grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_100px_100px] gap-2 sm:gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-light-3 shrink-0 hidden sm:block" />
                  <span className="text-sm text-light font-medium truncate group-hover:text-brand transition-colors">
                    {q.name}
                  </span>
                </div>
                <span className="text-sm text-light-2 font-mono">
                  {q.questions}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-dark-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-amber-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-light-3 font-mono w-8">{progress}%</span>
                </div>
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${cfg.class}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-light-3">{q.date}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Needs attention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-2xl border border-warning/20 bg-warning/[0.03] p-5"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <h4 className="font-heading text-sm font-semibold text-warning">3 Answers Need Review</h4>
            <p className="text-sm text-light-3 mt-1">
              Low-confidence answers flagged for human review in &quot;SOC2 Type II Audit - Acme Corp&quot;.
            </p>
            <Link
              href="/dashboard/questionnaires/1"
              className="inline-flex items-center gap-1 mt-3 text-sm text-warning hover:text-brand font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Review now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
