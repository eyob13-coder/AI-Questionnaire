"use client";

import { motion } from "framer-motion";
import { Download, FileSpreadsheet, FileText, Clock, ExternalLink } from "lucide-react";

const exports = [
  { id: "1", name: "SOC2_Type_II_Audit_Acme_Completed.xlsx", questionnaire: "SOC2 Type II Audit - Acme Corp", format: "XLSX", size: "245 KB", citations: true, exportedBy: "John D.", date: "Apr 17, 2026 · 2:30 PM" },
  { id: "2", name: "ISO27001_Vendor_Assessment_Final.xlsx", questionnaire: "ISO 27001 Vendor Assessment", format: "XLSX", size: "312 KB", citations: true, exportedBy: "Sarah M.", date: "Apr 16, 2026 · 11:15 AM" },
  { id: "3", name: "ISO27001_Vendor_Citations.pdf", questionnaire: "ISO 27001 Vendor Assessment", format: "PDF", size: "89 KB", citations: false, exportedBy: "Sarah M.", date: "Apr 16, 2026 · 11:16 AM" },
  { id: "4", name: "PCI_DSS_Compliance_Check_Final.csv", questionnaire: "PCI DSS Compliance Check", format: "CSV", size: "156 KB", citations: false, exportedBy: "Sarah M.", date: "Apr 10, 2026 · 4:45 PM" },
  { id: "5", name: "Customer_Security_Review_TechCo.xlsx", questionnaire: "Customer Security Review - TechCo", format: "XLSX", size: "198 KB", citations: true, exportedBy: "Mike R.", date: "Apr 8, 2026 · 9:20 AM" },
];

export default function ExportsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-heading text-2xl font-bold">Export History</h2>
        <p className="text-sm text-light-3 mt-1">{exports.length} exports</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="hidden lg:grid grid-cols-[1fr_1fr_60px_80px_120px_50px] gap-4 px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider">
          <span>File</span>
          <span>Questionnaire</span>
          <span>Format</span>
          <span>Size</span>
          <span>Exported</span>
          <span></span>
        </div>

        {exports.map((exp) => (
          <div key={exp.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_60px_80px_120px_50px] gap-2 lg:gap-4 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center">
            <div className="flex items-center gap-3 min-w-0">
              {exp.format === "PDF" ? (
                <FileText className="w-4 h-4 text-danger/60 shrink-0" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-success/60 shrink-0" />
              )}
              <span className="text-sm text-light font-medium truncate">{exp.name}</span>
            </div>
            <span className="text-sm text-light-2 truncate">{exp.questionnaire}</span>
            <span className="text-xs font-mono text-light-3 bg-dark-4/50 px-2 py-0.5 rounded w-fit">{exp.format}</span>
            <span className="text-xs text-light-3 font-mono">{exp.size}</span>
            <div>
              <p className="text-xs text-light-3">{exp.date}</p>
              <p className="text-xs text-light-4">by {exp.exportedBy}</p>
            </div>
            <button className="p-2 text-light-3 hover:text-brand rounded-lg hover:bg-white/[0.04] transition" title="Download">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
