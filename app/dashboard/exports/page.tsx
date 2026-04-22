"use client";

import { motion } from "framer-motion";
import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
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

const ExportsContent = ({ workspaceId }: { workspaceId: string }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiGet<AuditEntry[]>(
          `/workspaces/${workspaceId}/audit?limit=200`,
        );
        if (!cancelled) {
          setLogs(
            list.filter((l) =>
              l.action.startsWith("questionnaire.export"),
            ),
          );
        }
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Export History</h2>
        <p className="text-sm text-light-3 mt-1">
          {logs.length} export{logs.length === 1 ? "" : "s"}
        </p>
      </motion.div>

      <div className="rounded-2xl border `border-white/6` overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_120px_180px_50px] gap-4 px-5 py-3 bg-dark-3/50 border-b `border-white/6` text-xs font-semibold text-light-3 uppercase tracking-wider">
          <span>Questionnaire</span>
          <span>Format</span>
          <span>Exported</span>
          <span></span>
        </div>

        {logs.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-light-3">
            No exports yet. When you export a questionnaire, it will appear
            here.
          </div>
        ) : (
          logs.map((log) => {
            const details = (log.details ?? {}) as Record<string, unknown>;
            const format =
              typeof details.format === "string" ? details.format : "XLSX";
            const actor = log.user?.name || log.user?.email || "—";
            return (
              <div
                key={log.id}
                className="grid grid-cols-1 lg:grid-cols-[1fr_120px_180px_50px] gap-2 lg:gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-success/60 shrink-0" />
                  <span className="text-sm text-light font-medium truncate">
                    {log.entity}
                  </span>
                </div>
                <span className="text-xs font-mono text-light-3 bg-dark-4/50 px-2 py-0.5 rounded w-fit">
                  {format}
                </span>
                <div>
                  <p className="text-xs text-light-3">
                    {formatRelativeTime(log.createdAt)}
                  </p>
                  <p className="text-xs text-light-4">by {actor}</p>
                </div>
                <button
                  className="p-2 text-light-3 hover:text-brand rounded-lg `hover:bg-white/4` transition disabled:opacity-30"
                  title="Re-download (coming soon)"
                  disabled
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ExportsPage() {
  return <WorkspaceGate>{(id) => <ExportsContent workspaceId={id} />}</WorkspaceGate>;
}
