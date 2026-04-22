"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { apiGet } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
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
      >
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back 👋
        </h2>
        <p className="text-light-2 mt-1">
          {workspace?.name} · Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-glow rounded-2xl bg-dark-3/50 border `border-white/[0.06]` p-5 `hover:border-white/[0.1]` transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl `bg-white/[0.04]` flex items-center justify-center">
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
          className="group flex items-center gap-4 p-5 rounded-2xl `bg-gradient-to-br` from-brand/10 to-brand/5 border border-brand/20 hover:border-brand/40 transition-all duration-300"
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
          className="group flex items-center gap-4 p-5 rounded-2xl bg-dark-3/50 border `border-white/[0.06]` `hover:border-white/[0.12]` transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-xl `bg-white/[0.04]` flex items-center justify-center `group-hover:bg-white/[0.06]` transition-colors">
            <BookOpen className="w-6 h-6 text-light-2" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold">Knowledge Base</h3>
            <p className="text-sm text-light-3">Manage your security documents</p>
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

        <div className="rounded-2xl border `border-white/[0.06]` overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_120px] gap-4 px-5 py-3 bg-dark-3/50 text-xs font-semibold text-light-3 uppercase tracking-wider border-b `border-white/[0.06]`">
            <span>Name</span>
            <span>Questions</span>
            <span>Status</span>
            <span>Updated</span>
          </div>

          {activity.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-light-3">
              No questionnaires yet. Upload one to get started.
            </div>
          )}

          {activity.map((q) => {
            const cfg = statusConfig[q.status] || {
              label: q.status,
              class: "bg-light-4/10 text-light-3",
            };
            return (
              <Link
                key={q.id}
                href={`/dashboard/questionnaires/${q.id}`}
                className="group grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_120px] gap-2 sm:gap-4 px-5 py-4 border-b `border-white/[0.04]` `hover:bg-white/[0.02] transition-colors items-center"
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
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return <WorkspaceGate>{(id) => <DashboardContent workspaceId={id} />}</WorkspaceGate>;
}
