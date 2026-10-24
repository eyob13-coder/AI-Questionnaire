"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/workspace";
import { apiGet } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { useQuestionnaireStore } from "@/lib/store";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

interface DashboardStats {
  totalQuestionnaires: number;
  totalDocuments: number;
  questionsAnswered: number;
  averageConfidence: number;
  approvalRate: number;
  timeSavedHours: number;
}

interface ActivityItem {
  id: string;
  name: string;
  status: string;
  totalQuestions: number;
  updatedAt: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  PROCESSING: { label: "Generating", class: "bg-info/10 text-info" },
  IN_REVIEW: { label: "In Review", class: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Completed", class: "bg-success/10 text-success" },
  FAILED: { label: "Failed", class: "bg-danger/10 text-danger" },
};

const DashboardContent = ({ workspaceId }: { workspaceId: string }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { workspace } = useWorkspace();
  const router = useRouter();

  const createDemoSandbox = useQuestionnaireStore((s) => s.createDemoSandbox);
  const isCreatingDemo = useQuestionnaireStore((s) => s.isCreatingDemo);

  const handleLaunchDemo = async () => {
    try {
      const demo = await createDemoSandbox(workspaceId);
      if (demo) {
        toast.success("Loaded Acme Cloud SOC 2 Demo Sandbox!", {
          description: "25 enterprise questions ready for ROI counter, triage, and export review.",
        });
        router.push(`/dashboard/questionnaires/${demo.id}`);
      }
    } catch (e) {
      toast.error("Could not load demo questionnaire", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [s, a] = await Promise.all([
          apiGet<DashboardStats>(
            `/workspaces/${workspaceId}/dashboard/stats`,
          ),
          apiGet<ActivityItem[]>(
            `/workspaces/${workspaceId}/dashboard/activity`,
          ),
        ]);
        if (!cancelled) {
          setStats(s);
          setActivity(a);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
        }
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
  if (!stats) return null;

  const cards = [
    {
      label: "Total Questionnaires",
      value: stats.totalQuestionnaires.toString(),
      change: `${stats.totalDocuments} documents`,
      icon: FileSpreadsheet,
      color: "text-brand",
    },
    {
      label: "Questions Answered",
      value: stats.questionsAnswered.toString(),
      change: `${stats.approvalRate}% approved`,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Avg. Confidence",
      value: `${stats.averageConfidence}%`,
      change: "AI score",
      icon: TrendingUp,
      color: "text-brand",
    },
    {
      label: "Time Saved",
      value: `${stats.timeSavedHours}h`,
      change: "Estimated",
      icon: Clock,
      color: "text-info",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back 👋
          </h2>
          <p className="text-light-2 mt-1">
            {workspace?.name} · Enterprise compliance workspace
          </p>
        </div>

        {/* Feature 5 header action button */}
        <button
          onClick={handleLaunchDemo}
          disabled={isCreatingDemo}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl transition-colors cursor-pointer"
        >
          {isCreatingDemo ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>Try Demo Questionnaire (1-Click)</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-glow rounded-2xl bg-dark-3/50 border border-dark-4 p-5 hover:border-dark-5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-dark-4/60 flex items-center justify-center">
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

        <Link
          href="/dashboard/knowledge"
          className="group flex items-center gap-4 p-5 rounded-2xl bg-dark-3/50 border border-dark-4 hover:border-dark-5 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-dark-4/60 flex items-center justify-center group-hover:bg-dark-5 transition-colors">
            <BookOpen className="w-6 h-6 text-light-2" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold">Knowledge Base</h3>
            <p className="text-sm text-light-3">Manage your security documents &amp; Vault</p>
          </div>
          <ArrowRight className="w-5 h-5 text-light-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Link>
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

        {/* Feature 5: Instant Sample Deal Sandbox on Onboarding empty state */}
        {activity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand/30 bg-gradient-to-br from-brand/[0.04] via-dark-3/60 to-dark-3/30 p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/25 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-brand" />
            </div>

            <h4 className="font-heading text-lg font-bold text-light">
              Acme Cloud SaaS — SOC 2 Type II Assessment
            </h4>
            <p className="text-xs text-light-3 max-w-xl mx-auto mt-2 leading-relaxed">
              Don&apos;t have your SOC 2 PDF or vendor Excel sheet handy? Experience our live ROI counter,
              3-Bucket Triage, Split-Screen Evidence Inspector, and Excel Export in under 30 seconds
              with a realistic pre-populated enterprise deal.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleLaunchDemo}
                disabled={isCreatingDemo}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50 transition-all shadow-xl shadow-brand/20 cursor-pointer"
              >
                {isCreatingDemo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {isCreatingDemo
                  ? "Spawning Demo Sandbox..."
                  : "Try Instant Demo Questionnaire (1-Click)"}
              </button>

              <Link
                href="/dashboard/questionnaires/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-medium text-light-3 hover:text-light bg-dark-4 hover:bg-dark-5 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Your Own File</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-4 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_100px_100px_120px] gap-4 px-5 py-3 bg-dark-3/50 text-xs font-semibold text-light-3 uppercase tracking-wider border-b border-dark-4">
              <span>Name</span>
              <span>Questions</span>
              <span>Status</span>
              <span>Updated</span>
            </div>

            {activity.map((q) => {
              const cfg = statusConfig[q.status] || {
                label: q.status,
                class: "bg-light-4/10 text-light-3",
              };
              return (
                <Link
                  key={q.id}
                  href={`/dashboard/questionnaires/${q.id}`}
                  className="group grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_120px] gap-2 sm:gap-4 px-5 py-4 border-b border-dark-4/60 hover:bg-white/[0.02] transition-colors items-center"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 text-light-3 shrink-0 hidden sm:block" />
                    <span className="text-sm text-light font-medium truncate group-hover:text-brand transition-colors">
                      {q.name}
                    </span>
                  </div>
                  <span className="text-sm text-light-2 font-mono">
                    {q.totalQuestions}
                  </span>
                  <span
                    className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${cfg.class}`}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs text-light-3">
                    {formatRelativeTime(q.updatedAt)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function DashboardPage() {
  return <WorkspaceGate>{(id) => <DashboardContent workspaceId={id} />}</WorkspaceGate>;
}
