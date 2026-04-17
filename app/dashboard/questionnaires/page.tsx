"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileSpreadsheet, Plus, Search, Filter, MoreHorizontal,
  CheckCircle2, Clock, AlertTriangle, Loader2,
} from "lucide-react";
import { useState } from "react";

const questionnaires = [
  { id: "1", name: "SOC2 Type II Audit - Acme Corp", questions: 87, answered: 84, approved: 72, status: "review", created: "Apr 17, 2026", updatedBy: "John D." },
  { id: "2", name: "ISO 27001 Vendor Assessment", questions: 142, answered: 142, approved: 142, status: "completed", created: "Apr 16, 2026", updatedBy: "Sarah M." },
  { id: "3", name: "GDPR Data Processing Questionnaire", questions: 56, answered: 23, approved: 0, status: "generating", created: "Apr 14, 2026", updatedBy: "System" },
  { id: "4", name: "Customer Security Review - TechCo", questions: 200, answered: 195, approved: 180, status: "review", created: "Apr 12, 2026", updatedBy: "Mike R." },
  { id: "5", name: "PCI DSS Compliance Check", questions: 94, answered: 94, approved: 94, status: "completed", created: "Apr 10, 2026", updatedBy: "Sarah M." },
  { id: "6", name: "HIPAA Security Assessment", questions: 120, answered: 45, approved: 20, status: "review", created: "Apr 8, 2026", updatedBy: "John D." },
  { id: "7", name: "Vendor Risk Questionnaire - CloudInc", questions: 65, answered: 0, approved: 0, status: "uploaded", created: "Apr 7, 2026", updatedBy: "Mike R." },
];

const statusConfig: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  uploaded: { label: "Uploaded", class: "bg-light-4/10 text-light-3", icon: FileSpreadsheet },
  generating: { label: "Generating", class: "bg-info/10 text-info", icon: Loader2 },
  review: { label: "In Review", class: "bg-warning/10 text-warning", icon: AlertTriangle },
  completed: { label: "Completed", class: "bg-success/10 text-success", icon: CheckCircle2 },
};

export default function QuestionnairesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = questionnaires.filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (search && !q.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-heading text-2xl font-bold">Questionnaires</h2>
          <p className="text-sm text-light-3 mt-1">{questionnaires.length} total questionnaires</p>
        </div>
        <Link
          href="/dashboard/questionnaires/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Questionnaire
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] hover:border-white/[0.1] transition-colors flex-1 max-w-md">
          <Search className="w-4 h-4 text-light-3" />
          <input
            type="text"
            placeholder="Search questionnaires..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "uploaded", "generating", "review", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === s
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "bg-dark-3/50 text-light-3 border border-white/[0.06] hover:text-light-2 hover:border-white/[0.1]"
              }`}
            >
              {s === "all" ? "All" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[1fr_80px_140px_100px_110px_80px] gap-4 px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider">
          <span>Name</span>
          <span>Questions</span>
          <span>Progress</span>
          <span>Status</span>
          <span>Created</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-light-3 text-sm">
            No questionnaires found matching your filters.
          </div>
        )}

        {filtered.map((q) => {
          const progress = q.questions > 0 ? Math.round((q.answered / q.questions) * 100) : 0;
          const cfg = statusConfig[q.status] || statusConfig.uploaded;
          const StatusIcon = cfg.icon;

          return (
            <Link
              key={q.id}
              href={`/dashboard/questionnaires/${q.id}`}
              className="group grid grid-cols-1 lg:grid-cols-[1fr_80px_140px_100px_110px_80px] gap-2 lg:gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className="w-4 h-4 text-light-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-light truncate group-hover:text-brand transition-colors">
                    {q.name}
                  </p>
                  <p className="text-xs text-light-4 lg:hidden">
                    {q.questions} questions · {q.status}
                  </p>
                </div>
              </div>
              <span className="hidden lg:block text-sm text-light-2 font-mono">{q.questions}</span>
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-dark-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-amber-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-light-3 font-mono w-10">{progress}%</span>
              </div>
              <span className="hidden lg:block">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.class}`}>
                  <StatusIcon className={`w-3 h-3 ${q.status === 'generating' ? 'animate-spin' : ''}`} />
                  {cfg.label}
                </span>
              </span>
              <span className="hidden lg:block text-xs text-light-3">{q.created}</span>
              <div className="hidden lg:flex justify-end">
                <button
                  onClick={(e) => { e.preventDefault(); }}
                  className="p-1.5 rounded-lg text-light-4 hover:text-light-2 hover:bg-white/[0.04] transition"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
