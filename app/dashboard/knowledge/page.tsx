"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Suspense, useCallback, useEffect, useRef, useState,
  type DragEvent as ReactDragEvent,
} from "react";
import {
  BookOpen,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  HardDrive,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { apiUpload, formatApiError } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/format";
import { useKnowledgeStore } from "@/lib/store";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { TechSyncModal } from "@/components/dashboard/tech-sync-modal";

const statusConfig: Record<string, { label: string; class: string; Icon: typeof CheckCircle2 }> = {
  INDEXED: { label: "Indexed", class: "bg-success/10 text-success", Icon: CheckCircle2 },
  READY: { label: "Ready", class: "bg-success/10 text-success", Icon: CheckCircle2 },
  PROCESSING: { label: "Processing", class: "bg-info/10 text-info", Icon: Loader2 },
  FAILED: { label: "Failed", class: "bg-danger/10 text-danger", Icon: AlertCircle },
};

function KnowledgeContent({
  workspaceId,
  initialSearch,
}: {
  workspaceId: string;
  initialSearch: string;
}) {
  const docs = useKnowledgeStore((s) => s.documents);
  const fetchDocuments = useKnowledgeStore((s) => s.fetchDocuments);
  const deleteDocumentAction = useKnowledgeStore((s) => s.deleteDocument);
  const loading = useKnowledgeStore((s) => s.isLoading);
  const error = useKnowledgeStore((s) => s.error);
  const [search, setSearch] = useState(initialSearch);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [techSyncOpen, setTechSyncOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments(workspaceId);
  }, [workspaceId, fetchDocuments]);

  const reload = useCallback(async () => {
    await fetchDocuments(workspaceId);
  }, [workspaceId, fetchDocuments]);

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      await apiUpload(`/workspaces/${workspaceId}/knowledge/upload`, file);
      toast.success("Document uploaded", {
        description: `${file.name} is being processed.`,
      });
      await reload();
    } catch (nextError) {
      toast.error("Upload failed", {
        description: formatApiError(nextError, "Upload failed"),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    const res = await deleteDocumentAction(workspaceId, id);
    if (res.success) {
      toast.success("Document deleted");
    } else {
      toast.error("Delete failed", {
        description: res.error || "Delete failed",
      });
    }
  };

  const handleDrag = useCallback((event: ReactDragEvent) => {
    event.preventDefault();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
      return;
    }

    if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = (event: ReactDragEvent) => {
    event.preventDefault();
    setDragActive(false);

    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) {
      void handleUpload(nextFile);
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} />;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredDocs = docs.filter((doc) => {
    if (!normalizedSearch) return true;

    return [doc.fileName, doc.fileType, doc.status].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );
  });
  const totalChunks = docs.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
  const indexedCount = docs.filter((doc) => doc.status === "INDEXED").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-heading text-2xl font-bold">Knowledge Base</h2>
          <p className="text-sm text-light-3 mt-1">
            Upload your security policies and documents to power AI answers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTechSyncOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand/10 hover:bg-brand/20 rounded-full border border-brand/30 text-xs font-semibold text-brand transition-all cursor-pointer shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            Live Technical Sync
          </button>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-3/50 rounded-full border border-white/[0.06] text-xs text-light-3">
            <HardDrive className="w-3.5 h-3.5" />
            {indexedCount} docs - {totalChunks} chunks
          </span>
        </div>
      </motion.div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${dragActive
          ? "border-brand bg-brand/[0.04]"
          : "border-white/[0.08] bg-dark-3/20 hover:border-white/[0.15]"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) {
              void handleUpload(nextFile);
            }
            event.target.value = "";
          }}
        />

        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-brand animate-spin" />
        ) : (
          <Upload
            className={`w-8 h-8 mx-auto mb-3 ${dragActive ? "text-brand" : "text-light-3"}`}
          />
        )}

        <p className="text-sm font-medium text-light mb-1">
          {uploading ? "Uploading..." : "Drop documents here or click to upload"}
        </p>
        <p className="text-xs text-light-3">PDF, DOCX, TXT - Max 50MB per file</p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] max-w-md">
        <Search className="w-4 h-4 text-light-3" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
        />
      </div>

      <div className="rounded-2xl border border-dark-4 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_110px_120px_40px] gap-4 px-5 py-3 bg-dark-3/50 border-b border-dark-4 text-xs font-semibold text-light-3 uppercase tracking-wider">
          <span>Document</span>
          <span>Size</span>
          <span>Chunks</span>
          <span>Status</span>
          <span>Uploaded</span>
          <span></span>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-4/60 border border-dark-4 flex items-center justify-center mb-5">
              <BookOpen className="w-7 h-7 text-light-4" />
            </div>
            <p className="text-base font-semibold text-light mb-2">
              {search ? "No documents found" : "Your knowledge base is empty"}
            </p>
            <p className="text-sm text-light-3 max-w-xs">
              {search
                ? `No documents match "${search}".`
                : "Upload your security policies, architecture docs, and compliance reports to power accurate AI answers."}
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const config = statusConfig[doc.status] || statusConfig.PROCESSING;
            const StatusIcon = config.Icon;

            return (
              <div
                key={doc.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_110px_120px_40px] gap-2 sm:gap-4 px-5 py-4 border-b border-dark-4/60 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-light-4 shrink-0" />
                  <span className="text-sm text-light font-medium truncate">{doc.fileName}</span>
                </div>

                <span className="text-xs text-light-3 font-mono">{formatBytes(doc.fileSize)}</span>
                <span className="text-xs text-light-3 font-mono">{doc.chunkCount || "-"}</span>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${config.class}`}
                >
                  <StatusIcon
                    className={`w-3 h-3 ${doc.status === "PROCESSING" ? "animate-spin" : ""}`}
                  />
                  {config.label}
                </span>

                <span className="text-xs text-light-3">{formatDate(doc.createdAt)}</span>

                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-light-4 hover:text-danger rounded-lg hover:bg-white/[0.04] transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Document"
        message="This document and all its indexed chunks will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Document"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <TechSyncModal
        open={techSyncOpen}
        workspaceId={workspaceId}
        onClose={() => setTechSyncOpen(false)}
        onSuccess={() => void reload()}
      />
    </div>
  );
}

function KnowledgePageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search")?.trim() ?? "";

  return (
    <WorkspaceGate>
      {(workspaceId) => (
        <KnowledgeContent
          key={`${workspaceId}:${initialSearch}`}
          workspaceId={workspaceId}
          initialSearch={initialSearch}
        />
      )}
    </WorkspaceGate>
  );
}

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <KnowledgePageContent />
    </Suspense>
  );
}
