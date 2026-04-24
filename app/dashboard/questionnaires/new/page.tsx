"use client";

import { motion } from "framer-motion";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { apiUpload, apiGet, formatApiError } from "@/lib/api";
import { formatBytes } from "@/lib/format";
import {
  WorkspaceGate,
  PageError,
} from "@/components/dashboard/workspace-state";

interface UploadResponse {
  id: string;
  totalQuestions: number;
}

function NewQuestionnaireContent({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [created, setCreated] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKnowledge, setHasKnowledge] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<any[]>(`/workspaces/${workspaceId}/knowledge`)
      .then((docs) => {
        if (!cancelled) setHasKnowledge(docs.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasKnowledge(true); // hide warning on error
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const validateAndSetFile = useCallback((f: File) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) {
      alert("Please upload a .xlsx or .csv file");
      return;
    }
    setFile(f);
    setError(null);
    setCreated(null);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) validateAndSetFile(f);
    },
    [validateAndSetFile],
  );

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await apiUpload<UploadResponse>(
        `/workspaces/${workspaceId}/questionnaires/upload`,
        file,
        "file",
        (p) => setProgress(p),
      );
      setCreated(res);
    } catch (error) {
      setError(formatApiError(error, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {hasKnowledge === false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-500">
                Your Knowledge Base is empty
              </h3>
              <p className="text-sm text-amber-500/80 mt-1 leading-relaxed">
                Vaultix AI relies on your uploaded security policies and documents to answer questionnaires accurately. Without them, the AI won't be able to provide answers.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/knowledge")}
            className="shrink-0 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-sm font-medium rounded-lg transition-colors"
          >
            Go to Knowledge Base
          </button>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Upload Questionnaire</h2>
        <p className="text-light-2 text-sm mt-1">
          Upload a .xlsx or .csv security questionnaire to get AI-generated
          draft answers.
        </p>
      </motion.div>

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${dragActive
            ? "border-brand bg-brand/[0.04] scale-[1.01]"
            : "border-white/[0.08] bg-dark-3/30 hover:border-white/[0.15]"
            }`}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) validateAndSetFile(f);
            }}
            className="hidden"
          />
          <div
            className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${dragActive ? "bg-brand/15" : "bg-white/[0.04]"
              }`}
          >
            <Upload
              className={`w-7 h-7 ${dragActive ? "text-brand" : "text-light-3"
                }`}
            />
          </div>
          <p className="text-base font-medium text-light mb-1.5">
            {dragActive
              ? "Drop your file here"
              : "Drag & drop your questionnaire"}
          </p>
          <p className="text-sm text-light-3 mb-4">or click to browse files</p>
          <div className="flex items-center justify-center gap-3 text-xs text-light-4">
            <span className="px-2.5 py-1 rounded-full bg-dark-4/50">.xlsx</span>
            <span className="px-2.5 py-1 rounded-full bg-dark-4/50">.csv</span>
            <span>Max 25MB</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-dark-3/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light truncate">
                {file.name}
              </p>
              <p className="text-xs text-light-3">{formatBytes(file.size)}</p>
            </div>
            {!uploading && !created && (
              <button
                onClick={() => {
                  setFile(null);
                  setError(null);
                }}
                className="p-2 text-light-4 hover:text-light-2 rounded-lg hover:bg-white/[0.04] transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {created && <CheckCircle2 className="w-5 h-5 text-success" />}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="h-1.5 rounded-full bg-dark-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-amber-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-light-3 mt-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Uploading and parsing… {progress}%
              </p>
            </div>
          )}

          {created && (
            <div className="mt-4 p-4 rounded-xl bg-success/[0.05] border border-success/20">
              <p className="text-sm text-success font-medium">
                ✓ File parsed successfully
              </p>
              <p className="text-xs text-light-3 mt-1">
                {created.totalQuestions} questions detected. AI is generating
                answers in the background.
              </p>
            </div>
          )}
        </div>
      )}

      {error && <PageError message={error} />}

      {file && (
        <div className="flex items-center justify-end gap-3">
          {!created ? (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Upload & Parse <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() =>
                router.push(`/dashboard/questionnaires/${created.id}`)
              }
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all"
            >
              View Questionnaire <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-dark-3/30 border border-white/[0.06] p-5">
        <h4 className="font-heading text-sm font-semibold mb-3">
          📋 Tips for best results
        </h4>
        <ul className="space-y-2 text-sm text-light-3">
          <li className="flex items-start gap-2">
            <span className="text-brand mt-1">•</span>
            Ensure each question is in a separate row
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand mt-1">•</span>
            Upload your security policies to the Knowledge Base first for the
            best AI answers
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand mt-1">•</span>
            Multi-sheet files are supported
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function NewQuestionnairePage() {
  return (
    <WorkspaceGate>{(id) => <NewQuestionnaireContent workspaceId={id} />}</WorkspaceGate>
  );
}
