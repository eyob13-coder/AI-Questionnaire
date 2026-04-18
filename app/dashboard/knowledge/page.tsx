"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import {
  BookOpen, Upload, FileText, Trash2, CheckCircle2,
  Loader2, AlertCircle, Search, MoreHorizontal, HardDrive,
} from "lucide-react";

const mockDocs = [
  { id: "1", name: "Security Policy v3.2.pdf", type: "PDF", size: "2.4 MB", chunks: 47, status: "indexed" as const, uploadedAt: "Apr 15, 2026" },
  { id: "2", name: "AWS Architecture Guide.pdf", type: "PDF", size: "5.1 MB", chunks: 89, status: "indexed" as const, uploadedAt: "Apr 14, 2026" },
  { id: "3", name: "Incident Response Plan.pdf", type: "PDF", size: "1.2 MB", chunks: 23, status: "indexed" as const, uploadedAt: "Apr 12, 2026" },
  { id: "4", name: "BCP & DR Policy.pdf", type: "PDF", size: "890 KB", chunks: 18, status: "indexed" as const, uploadedAt: "Apr 10, 2026" },
  { id: "5", name: "Access Control Policy.pdf", type: "PDF", size: "1.8 MB", chunks: 32, status: "indexed" as const, uploadedAt: "Apr 8, 2026" },
  { id: "6", name: "HR Security Policy.pdf", type: "PDF", size: "940 KB", chunks: 0, status: "processing" as const, uploadedAt: "Just now" },
  { id: "7", name: "Vulnerability Management SOP.pdf", type: "PDF", size: "1.1 MB", chunks: 21, status: "indexed" as const, uploadedAt: "Apr 5, 2026" },
  { id: "8", name: "Privacy Policy.pdf", type: "PDF", size: "420 KB", chunks: 0, status: "failed" as const, uploadedAt: "Apr 4, 2026" },
];

const statusConfig = {
  indexed: { label: "Indexed", class: "bg-success/10 text-success", icon: CheckCircle2 },
  processing: { label: "Processing", class: "bg-info/10 text-info", icon: Loader2 },
  failed: { label: "Failed", class: "bg-danger/10 text-danger", icon: AlertCircle },
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const filtered = mockDocs.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalChunks = mockDocs.reduce((sum, d) => sum + d.chunks, 0);
  const indexedCount = mockDocs.filter((d) => d.status === "indexed").length;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
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
        <div className="flex items-center gap-3 text-xs text-light-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-3/50 rounded-full border border-white/[0.06]">
            <HardDrive className="w-3.5 h-3.5" />
            {indexedCount} docs · {totalChunks} chunks
          </span>
        </div>
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
        className={`
          rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer
          ${dragActive ? "border-brand bg-brand/[0.04]" : "border-white/[0.08] bg-dark-3/20 hover:border-white/[0.15]"}
        `}
        onClick={() => document.getElementById("kb-upload")?.click()}
      >
        <input id="kb-upload" type="file" accept=".pdf,.docx,.txt" multiple className="hidden" />
        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragActive ? "text-brand" : "text-light-3"}`} />
        <p className="text-sm font-medium text-light mb-1">Drop documents here or click to upload</p>
        <p className="text-xs text-light-3">PDF, DOCX, TXT · Max 50MB per file</p>
      </motion.div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] max-w-md">
        <Search className="w-4 h-4 text-light-3" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
        />
      </div>

      {/* Document list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_100px_40px] gap-4 px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider">
          <span>Document</span>
          <span>Size</span>
          <span>Chunks</span>
          <span>Status</span>
          <span>Uploaded</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-4/60 border border-white/[0.06] flex items-center justify-center mb-5">
              <BookOpen className="w-7 h-7 text-light-4" />
            </div>
            {search ? (
              <>
                <p className="text-base font-semibold text-light mb-2">No documents found</p>
                <p className="text-sm text-light-3 max-w-xs">No documents match &ldquo;{search}&rdquo;. Try a different search term.</p>
                <button onClick={() => setSearch("")} className="mt-5 text-sm text-brand hover:text-brand-light font-medium transition-colors">Clear search</button>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-light mb-2">Your knowledge base is empty</p>
                <p className="text-sm text-light-3 max-w-xs mb-6">
                  Upload your security policies, architecture docs, and compliance reports. The more you add, the more accurate the AI answers.
                </p>
                <button
                  onClick={() => document.getElementById("kb-upload")?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  <Upload className="w-4 h-4" />
                  Upload your first document
                </button>
              </>
            )}
          </div>
        )}

        {filtered.map((doc) => {
          const cfg = statusConfig[doc.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={doc.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_100px_100px_40px] gap-2 sm:gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-light-4 shrink-0" />
                <span className="text-sm text-light font-medium truncate">{doc.name}</span>
              </div>
              <span className="text-xs text-light-3 font-mono">{doc.size}</span>
              <span className="text-xs text-light-3 font-mono">{doc.chunks || "—"}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${cfg.class}`}>
                <StatusIcon className={`w-3 h-3 ${doc.status === "processing" ? "animate-spin" : ""}`} />
                {cfg.label}
              </span>
              <span className="text-xs text-light-3">{doc.uploadedAt}</span>
              <button className="p-1.5 text-light-4 hover:text-danger rounded-lg hover:bg-white/[0.04] transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
