"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Search,
  CheckCircle2,
  Edit3,
  Download,
  Upload,
  Trash2,
  UserPlus,
  Eye,
  RefreshCw,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

const actionIcons: Record<string, typeof Eye> = {
  "answer.approved": CheckCircle2,
  "answer.edited": Edit3,
  "answer.regenerated": RefreshCw,
  "answers.generated": RefreshCw,
  "answers.bulk_approved": CheckCircle2,
  "questionnaire.exported": Download,
  "questionnaire.uploaded": Upload,
  "knowledge.uploaded": Upload,
  "member.invited": UserPlus,
  "member.removed": Trash2,
  "knowledge.deleted": Trash2,
};

const actionColors: Record<string, string> = {
  "answer.approved": "text-success bg-success/10",
  "answer.edited": "text-info bg-info/10",
  "answer.regenerated": "text-warning bg-warning/10",
  "answers.generated": "text-brand bg-brand/10",
  "answers.bulk_approved": "text-success bg-success/10",
  "questionnaire.exported": "text-brand bg-brand/10",
  "questionnaire.uploaded": "text-info bg-info/10",
  "knowledge.uploaded": "text-info bg-info/10",
  "member.invited": "text-brand bg-brand/10",
  "member.removed": "text-danger bg-danger/10",
  "knowledge.deleted": "text-danger bg-danger/10",
};

function describe(entry: AuditEntry): string {
  const details = (entry.details ?? {}) as Record<string, unknown>;
  const message = typeof details.message === "string" ? details.message : null;

  if (message) return message;

  return `${entry.action.replace(/\./g, " ")} on ${entry.entity}`;
}

function AuditContent({
  workspaceId,
  initialSearch,
}: {
  workspaceId: string;
  initialSearch: string;
}) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await apiGet<AuditEntry[]>(`/workspaces/${workspaceId}/audit`);
        if (!cancelled) {
          setLogs(list);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Failed to load audit log");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} />;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredLogs = logs.filter((log) => {
    if (!normalizedSearch) return true;

    return [
      describe(log),
      log.entity,
      log.action,
      log.user?.name || log.user?.email || "",
    ].some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Audit Log</h2>
        <p className="text-sm text-light-3 mt-1">
          Track all actions across your workspace.
        </p>
      </motion.div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] max-w-md">
        <Search className="w-4 h-4 text-light-3" />
        <input
          type="text"
          placeholder="Search audit logs..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
        />
      </div>

      <div className="space-y-1">
        {filteredLogs.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-light-3">
            {logs.length === 0
              ? "No audit events yet. Activity will appear here as your team uses the workspace."
              : "No events match your search."}
          </div>
        )}

        {filteredLogs.map((log) => {
          const Icon = actionIcons[log.action] || Eye;
          const color = actionColors[log.action] || "text-light-3 bg-white/[0.04]";
          const [iconColor, iconBg] = color.split(" ");
          const actor = log.user?.name || log.user?.email || "System";

          return (
            <div
              key={log.id}
              className="flex items-start gap-4 px-5 py-4 rounded-xl hover:bg-dark-3/30 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-light">{describe(log)}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-light-3">
                  <span className="font-medium">{actor}</span>
                  <span>&middot;</span>
                  <span>{log.entity}</span>
                </div>
              </div>

              <span className="text-xs text-light-4 whitespace-nowrap shrink-0">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search")?.trim() ?? "";

  return (
    <WorkspaceGate>
      {(workspaceId) => (
        <AuditContent
          key={`${workspaceId}:${initialSearch}`}
          workspaceId={workspaceId}
          initialSearch={initialSearch}
        />
      )}
    </WorkspaceGate>
  );
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuditPageContent />
    </Suspense>
  );
}
