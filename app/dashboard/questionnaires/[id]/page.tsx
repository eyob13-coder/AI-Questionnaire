"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, Download, RefreshCw, Check, CheckCircle2,
  Search, Edit3,
  FileText, ExternalLink, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

/* ── Mock data ── */
const questionnaireInfoTemplate = {
  name: "SOC2 Type II Audit - Acme Corp",
  file: "SOC2_Security_Questionnaire.xlsx",
  totalQuestions: 87,
  answered: 84,
  approved: 72,
  needsReview: 9,
  draft: 3,
};

const mockAnswers = [
  {
    id: "1", rowNum: 1,
    question: "Do you encrypt all data at rest using AES-256 or equivalent?",
    answer: "Yes. All data at rest is encrypted using AES-256 encryption via AWS KMS with automatic annual key rotation. This applies to all databases (RDS, DynamoDB), object storage (S3), and EBS volumes.",
    confidence: 96, status: "approved" as const,
    citations: [
      { doc: "Security Policy v3.2.pdf", page: 12, excerpt: "All data at rest SHALL be encrypted using AES-256..." },
      { doc: "AWS Architecture Guide.pdf", page: 34, excerpt: "KMS keys are configured for automatic annual rotation..." },
    ],
  },
  {
    id: "2", rowNum: 2,
    question: "Describe your incident response process and timeline requirements.",
    answer: "Our incident response follows a structured 4-phase approach based on NIST SP 800-61: 1) Preparation - dedicated IR team with 24/7 on-call rotation, 2) Detection & Analysis - automated alerting via PagerDuty with 15-min acknowledgment SLA, 3) Containment, Eradication & Recovery, 4) Post-Incident Activity with blameless retrospectives.",
    confidence: 82, status: "review" as const,
    citations: [
      { doc: "Incident Response Plan.pdf", page: 5, excerpt: "The IR team maintains a 24/7 on-call rotation..." },
    ],
  },
  {
    id: "3", rowNum: 3,
    question: "What is your data backup frequency and retention policy?",
    answer: "Production databases are backed up every 4 hours with point-in-time recovery enabled. Backups are retained for 30 days in the primary region and 90 days in geo-replicated storage. Annual backup restoration tests are performed and documented.",
    confidence: 91, status: "approved" as const,
    citations: [
      { doc: "BCP & DR Policy.pdf", page: 8, excerpt: "Database backups SHALL be performed every 4 hours..." },
      { doc: "AWS Architecture Guide.pdf", page: 45, excerpt: "Cross-region replication is enabled for all production..." },
    ],
  },
  {
    id: "4", rowNum: 4,
    question: "How do you handle data subject access requests (DSARs) under GDPR?",
    answer: "Insufficient information in knowledge base to fully answer this question. Partial information found: Our privacy policy references GDPR compliance, but specific DSAR handling procedures were not found in the uploaded documents.",
    confidence: 28, status: "draft" as const,
    citations: [
      { doc: "Privacy Policy.pdf", page: 3, excerpt: "We comply with applicable data protection regulations..." },
    ],
  },
  {
    id: "5", rowNum: 5,
    question: "Do you perform regular penetration testing? If so, how frequently?",
    answer: "Yes. We engage third-party security firms to conduct annual penetration testing covering OWASP Top 10 vulnerabilities, API security, and infrastructure testing. Additionally, we run continuous automated vulnerability scanning via Qualys. Critical findings are remediated within 48 hours.",
    confidence: 88, status: "approved" as const,
    citations: [
      { doc: "Security Policy v3.2.pdf", page: 22, excerpt: "Annual penetration testing SHALL be conducted by..." },
      { doc: "Vulnerability Management SOP.pdf", page: 7, excerpt: "Critical vulnerabilities must be remediated within..." },
    ],
  },
  {
    id: "6", rowNum: 6,
    question: "Describe your employee security awareness training program.",
    answer: "All employees complete mandatory security awareness training during onboarding and annually thereafter. Training covers phishing identification, password hygiene, data classification, and acceptable use policies. Simulated phishing campaigns are conducted quarterly with a target click rate below 5%.",
    confidence: 85, status: "review" as const,
    citations: [
      { doc: "HR Security Policy.pdf", page: 14, excerpt: "Security awareness training is mandatory for all..." },
    ],
  },
  {
    id: "7", rowNum: 7,
    question: "What access control mechanisms are in place for production systems?",
    answer: "We implement role-based access control (RBAC) with the principle of least privilege. Production access requires MFA, VPN connectivity, and just-in-time (JIT) access approval via Teleport. Access reviews are conducted quarterly by system owners. All access events are logged and monitored.",
    confidence: 93, status: "approved" as const,
    citations: [
      { doc: "Access Control Policy.pdf", page: 6, excerpt: "RBAC with least privilege SHALL be enforced..." },
      { doc: "Security Policy v3.2.pdf", page: 18, excerpt: "MFA is required for all production system access..." },
    ],
  },
  {
    id: "8", rowNum: 8,
    question: "Do you maintain a vulnerability management program?",
    answer: "Yes. Our vulnerability management program includes continuous automated scanning (Qualys for infrastructure, Snyk for dependencies), monthly vulnerability assessments, and annual penetration testing. SLAs for remediation: Critical - 48h, High - 7 days, Medium - 30 days, Low - 90 days.",
    confidence: 90, status: "approved" as const,
    citations: [
      { doc: "Vulnerability Management SOP.pdf", page: 3, excerpt: "Remediation SLAs are defined as follows..." },
    ],
  },
];

type AnswerStatus = "approved" | "review" | "draft";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Needs Review" },
  { value: "approved", label: "Approved" },
];

export default function QuestionnaireReviewPage() {
  const params = useParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const questionnaireId = routeId ?? "unknown";

  const questionnaireInfo = {
    ...questionnaireInfoTemplate,
    name: `${questionnaireInfoTemplate.name} #${questionnaireId}`,
  };

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState(mockAnswers);

  const filtered = answers.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.question.toLowerCase().includes(search.toLowerCase()) && !a.answer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filtered.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filtered.map((a) => a.id)));
    }
  };

  const bulkApprove = () => {
    setAnswers((prev) =>
      prev.map((a) => (selectedRows.has(a.id) ? { ...a, status: "approved" as const } : a))
    );
    setSelectedRows(new Set());
  };

  const confidenceColor = (conf: number) =>
    conf >= 80 ? "text-success" : conf >= 50 ? "text-warning" : "text-danger";

  const confidenceBg = (conf: number) =>
    conf >= 80 ? "bg-success" : conf >= 50 ? "bg-warning" : "bg-danger";

  const statusBadge = (status: AnswerStatus) => {
    const cfg = {
      approved: "bg-success/10 text-success",
      review: "bg-warning/10 text-warning",
      draft: "bg-light-4/10 text-light-3",
    };
    const labels = { approved: "Approved", review: "Review", draft: "Draft" };
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg[status]}`}>
        {status === "approved" && <CheckCircle2 className="w-3 h-3" />}
        {status === "review" && <AlertTriangle className="w-3 h-3" />}
        {labels[status]}
      </span>
    );
  };

  const progress = Math.round((questionnaireInfo.approved / questionnaireInfo.totalQuestions) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/dashboard/questionnaires" className="inline-flex items-center gap-1.5 text-sm text-light-3 hover:text-light mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Questionnaires
        </Link>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold">{questionnaireInfo.name}</h2>
            <p className="text-sm text-light-3 mt-1 font-mono">
              {questionnaireInfo.file} · ID: {questionnaireId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-light-2 border border-white/[0.08] rounded-full hover:bg-white/[0.04] transition">
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 h-2 rounded-full bg-dark-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="text-success font-mono">{questionnaireInfo.approved} approved</span>
            <span className="text-warning font-mono">{questionnaireInfo.needsReview} review</span>
            <span className="text-light-3 font-mono">{questionnaireInfo.draft} draft</span>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((f) => {
            const count = f.value === "all" ? answers.length : answers.filter((a) => a.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.value
                    ? "bg-brand/10 text-brand border border-brand/20"
                    : "bg-dark-3/50 text-light-3 border border-white/[0.06] hover:text-light-2"
                  }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-3/50 border border-white/[0.06] flex-1 sm:w-64">
            <Search className="w-4 h-4 text-light-3" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Bulk actions */}
      {selectedRows.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-brand/[0.06] border border-brand/20"
        >
          <span className="text-sm text-brand font-medium">{selectedRows.size} selected</span>
          <button onClick={bulkApprove} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-success/20 hover:bg-success/30 text-success rounded-full transition">
            <Check className="w-3 h-3" />
            Approve Selected
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-full transition">
            <RefreshCw className="w-3 h-3" />
            Regenerate Selected
          </button>
          <button onClick={() => setSelectedRows(new Set())} className="ml-auto text-xs text-light-3 hover:text-light transition">
            Clear
          </button>
        </motion.div>
      )}

      {/* Review grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[40px_30px_1fr_1fr_70px_90px_60px] gap-3 px-5 py-3 bg-dark-3/50 border-b border-white/[0.06] text-xs font-semibold text-light-3 uppercase tracking-wider items-center">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRows.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="w-3.5 h-3.5 rounded accent-brand"
            />
          </div>
          <span>#</span>
          <span>Question</span>
          <span>AI Answer</span>
          <span>Score</span>
          <span>Status</span>
          <span></span>
        </div>

        {filtered.map((row) => (
          <div key={row.id} className="border-b border-white/[0.04]">
            {/* Main row */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-[40px_30px_1fr_1fr_70px_90px_60px] gap-2 lg:gap-3 px-4 lg:px-5 py-4 hover:bg-white/[0.015] transition-colors items-start cursor-pointer ${expandedRow === row.id ? "bg-white/[0.02]" : ""
                }`}
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
            >
              <div className="hidden lg:flex items-center justify-center pt-0.5">
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={() => toggleSelect(row.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-3.5 h-3.5 rounded accent-brand"
                />
              </div>
              <span className="hidden lg:block text-xs text-light-3 font-mono pt-0.5">{row.rowNum}</span>

              <div className="min-w-0">
                <p className="text-sm text-light leading-relaxed">{row.question}</p>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-light-2 leading-relaxed line-clamp-2">
                  {row.answer}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-8 h-1.5 rounded-full bg-dark-4 overflow-hidden">
                  <div className={`h-full rounded-full ${confidenceBg(row.confidence)}`} style={{ width: `${row.confidence}%` }} />
                </div>
                <span className={`text-xs font-mono font-semibold ${confidenceColor(row.confidence)}`}>
                  {row.confidence}%
                </span>
              </div>

              <div>{statusBadge(row.status)}</div>

              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1.5 text-light-4 hover:text-light-2 rounded-lg hover:bg-white/[0.04] transition"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded: Citations */}
            {expandedRow === row.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 pb-4 lg:pl-[72px]"
              >
                <div className="rounded-xl bg-dark-3/40 border border-white/[0.06] p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-light-3 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Citations ({row.citations.length})
                  </h4>
                  {row.citations.map((cit, ci) => (
                    <div key={ci} className="flex items-start gap-3 text-xs">
                      <span className="text-brand font-mono shrink-0">[{ci + 1}]</span>
                      <div className="min-w-0">
                        <p className="text-light-2 font-medium flex items-center gap-1">
                          {cit.doc}
                          {cit.page && <span className="text-light-4">· p.{cit.page}</span>}
                          <ExternalLink className="w-3 h-3 text-light-4 ml-1" />
                        </p>
                        <p className="text-light-3 mt-0.5 italic">&ldquo;{cit.excerpt}&rdquo;</p>
                      </div>
                    </div>
                  ))}

                  {/* Actions in expanded view */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                    {row.status !== "approved" && (
                      <button
                        onClick={() =>
                          setAnswers((prev) =>
                            prev.map((a) => (a.id === row.id ? { ...a, status: "approved" as const } : a))
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-success bg-success/10 hover:bg-success/20 rounded-full transition"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                    )}
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-light-3 bg-white/[0.04] hover:bg-white/[0.06] rounded-full transition">
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-light-3 bg-white/[0.04] hover:bg-white/[0.06] rounded-full transition">
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-light-3 text-sm">
            No answers match your current filters.
          </div>
        )}
      </motion.div>
    </div>
  );
}
