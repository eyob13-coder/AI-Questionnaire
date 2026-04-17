"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ScrollText, Search, Filter, CheckCircle2, Edit3,
  Download, Upload, Trash2, UserPlus, Eye, RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

const auditLogs = [
  { id: "1", action: "answer.approved", entity: "SOC2 Type II Audit - Acme Corp", actor: "John D.", detail: 'Approved answer for "Do you encrypt all data at rest?"', time: "2 min ago" },
  { id: "2", action: "answer.edited", entity: "SOC2 Type II Audit - Acme Corp", actor: "John D.", detail: 'Edited answer for "Describe your incident response process"', time: "15 min ago" },
  { id: "3", action: "questionnaire.exported", entity: "ISO 27001 Vendor Assessment", actor: "Sarah M.", detail: "Exported as XLSX with citation report", time: "1 hour ago" },
  { id: "4", action: "answers.generated", entity: "GDPR Data Processing Questionnaire", actor: "System", detail: "Generated 23 draft answers (56 questions)", time: "3 hours ago" },
  { id: "5", action: "knowledge.uploaded", entity: "HR Security Policy.pdf", actor: "Mike R.", detail: "Uploaded document (940 KB)", time: "5 hours ago" },
  { id: "6", action: "member.invited", entity: "Workspace", actor: "John D.", detail: "Invited lisa@company.com as Viewer", time: "1 day ago" },
  { id: "7", action: "questionnaire.uploaded", entity: "GDPR Data Processing Questionnaire", actor: "Mike R.", detail: "Uploaded questionnaire (56 questions, 2 sheets)", time: "1 day ago" },
  { id: "8", action: "answers.bulk_approved", entity: "Customer Security Review - TechCo", actor: "Mike R.", detail: "Bulk approved 45 answers", time: "2 days ago" },
  { id: "9", action: "questionnaire.exported", entity: "PCI DSS Compliance Check", actor: "Sarah M.", detail: "Exported as CSV", time: "3 days ago" },
  { id: "10", action: "answer.regenerated", entity: "Customer Security Review - TechCo", actor: "John D.", detail: 'Regenerated answer for "What is your DR strategy?"', time: "3 days ago" },
];

const actionIcons: Record<string, React.ElementType> = {
  "answer.approved": CheckCircle2,
  "answer.edited": Edit3,
  "answer.regenerated": RefreshCw,
  "answers.generated": RefreshCw,
  "answers.bulk_approved": CheckCircle2,
  "questionnaire.exported": Download,
  "questionnaire.uploaded": Upload,
  "knowledge.uploaded": Upload,
  "member.invited": UserPlus,
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
  "knowledge.deleted": "text-danger bg-danger/10",
};

export default function AuditLogPage() {
  const [search, setSearch] = useState("");

  const filtered = auditLogs.filter(
    (log) =>
      !search ||
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Audit Log</h2>
        <p className="text-sm text-light-3 mt-1">Track all actions across your workspace.</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-3/50 border border-white/[0.06] max-w-md">
          <Search className="w-4 h-4 text-light-3" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
          />
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1"
      >
        {filtered.map((log) => {
          const Icon = actionIcons[log.action] || Eye;
          const color = actionColors[log.action] || "text-light-3 bg-white/[0.04]";
          const [iconColor, iconBg] = color.split(" ");

          return (
            <div key={log.id} className="flex items-start gap-4 px-5 py-4 rounded-xl hover:bg-dark-3/30 transition-colors">
              <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-light">{log.detail}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-light-3">
                  <span className="font-medium">{log.actor}</span>
                  <span>·</span>
                  <span>{log.entity}</span>
                </div>
              </div>
              <span className="text-xs text-light-4 whitespace-nowrap shrink-0">{log.time}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
