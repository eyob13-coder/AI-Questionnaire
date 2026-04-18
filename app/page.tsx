"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap,
  Brain,
  FileCheck,
  Clock,
  Lock,
  ArrowRight,
  Check,
  Upload,
  Search,
  Download,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Play,
  BarChart3,
  Users,
  Eye,
  FileText,
  RefreshCw,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { VaultixIcon } from "@/components/ui/vaultix-icon";

/* ─── Animation helpers ─── */
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6 },
};

const staggerContainer = {
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true } as const,
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

/* ─── Data ─── */
const features = [
  {
    icon: Brain,
    title: "AI-Powered Answers",
    desc: "Generate accurate, contextual answers from your company knowledge base using advanced RAG pipeline.",
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    desc: "Color-coded confidence scores (0-100%) so you instantly know which answers need human review.",
  },
  {
    icon: FileCheck,
    title: "Smart Citations",
    desc: "Every answer backed by source documents with page numbers. Full traceability for auditors.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Process 300+ questions in minutes, not days. 10x faster than manual copy-paste workflows.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Role-based access with Owner, Editor, and Viewer roles. Review, edit, and approve together.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    desc: "SOC 2 ready. AES-256 encryption, audit trails, tenant isolation, and data retention controls.",
  },
];

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Questionnaire",
    desc: "Drop your .xlsx or .csv security questionnaire. We auto-detect question columns and preserve formatting.",
  },
  {
    num: "02",
    icon: Brain,
    title: "AI Generates Answers",
    desc: "Our RAG pipeline searches your knowledge base, generates answers with citations and confidence scores.",
  },
  {
    num: "03",
    icon: Download,
    title: "Review & Export",
    desc: "Review AI answers, edit inline, approve in bulk, and export the completed file in original format.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$49",
    desc: "For small teams getting started",
    features: [
      "5 questionnaires/month",
      "500 questions/month",
      "10 knowledge docs",
      "1 workspace member",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    desc: "For growing security teams",
    features: [
      "Unlimited questionnaires",
      "5,000 questions/month",
      "100 knowledge docs",
      "10 workspace members",
      "Priority support",
      "Custom AI tone",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited everything",
      "SSO / SAML",
      "Dedicated support",
      "Custom retention",
      "SLA guarantee",
      "SCIM provisioning",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const differentiationModes = [
  {
    id: "trust",
    label: "Evidence Lock",
    title: "Every answer must be defensible",
    desc: "Vaultix treats proof as mandatory. If evidence is weak, the answer is flagged instead of guessed.",
    bullets: [
      "Page-level citations attached to each response",
      "Confidence thresholds route risky answers to human review",
      "Audit trail records who approved each answer and when",
    ],
  },
  {
    id: "speed",
    label: "Deal Velocity",
    title: "Move fast without breaking trust",
    desc: "Security and sales teams work in the same workflow, so reviews do not stall late-stage deals.",
    bullets: [
      "Bulk approve and assign answers by owner",
      "Upload once and answer hundreds of questions in minutes",
      "Export in original format to avoid rework",
    ],
  },
  {
    id: "freshness",
    label: "Freshness",
    title: "Answers stay current over time",
    desc: "Knowledge changes. Vaultix keeps responses aligned by surfacing stale content before customers do.",
    bullets: [
      "Outdated source docs trigger re-review workflows",
      "Single source of truth for policies and past answers",
      "Reusable approved answer library for new questionnaires",
    ],
  },
] as const;

const differentiationPillars = [
  {
    icon: FileCheck,
    title: "Evidence-First AI",
    desc: "Answer generation is grounded in your approved documents, with citations visible by default.",
  },
  {
    icon: Lock,
    title: "No-Hallucination Guardrails",
    desc: "Low-confidence or unsupported answers are marked for review instead of auto-approved.",
  },
  {
    icon: RefreshCw,
    title: "Always-Fresh Knowledge",
    desc: "Your answer base evolves as policies and controls change across your organization.",
  },
  {
    icon: Users,
    title: "Built for Team Workflow",
    desc: "Security, legal, and GTM teams collaborate in one place with clear ownership and approval flow.",
  },
];

const comparisonRows = [
  {
    capability: "Citation-backed answers",
    vaultix: "Required on every response",
    genericAI: "Optional / inconsistent",
    manual: "Manual lookup",
  },
  {
    capability: "Low-confidence handling",
    vaultix: "Auto-flag for review",
    genericAI: "Often still drafts",
    manual: "Depends on reviewer",
  },
  {
    capability: "Approval and audit trail",
    vaultix: "Built-in per answer",
    genericAI: "Usually add-on",
    manual: "Spreadsheet comments",
  },
  {
    capability: "Source freshness control",
    vaultix: "Re-review when docs change",
    genericAI: "Rarely native",
    manual: "Hard to maintain",
  },
  {
    capability: "Go-to-market readiness",
    vaultix: "Security + sales workflow",
    genericAI: "General-purpose tooling",
    manual: "Cross-team bottlenecks",
  },
];

const proofSummary = {
  generated: "700,000+",
  label: "AI answers generated",
};

const proofMetrics = [
  { value: "95%+", label: "Answer accuracy", note: "Evidence-backed responses" },
  { value: "90%", label: "Coverage", note: "Questions answered automatically" },
  { value: "85%", label: "Unedited answers", note: "Approved with no rewrites" },
];

const proofTableRows = [
  {
    capability: "AI answer accuracy",
    vaultix: "95%+",
    questionnaireTools: "70-80%",
    rfpTools: "<50%",
    manual: "<50%",
  },
  {
    capability: "Citations on every answer",
    vaultix: "Included",
    questionnaireTools: "Limited",
    rfpTools: "No",
    manual: "Manual",
  },
  {
    capability: "Instant import and export of original files",
    vaultix: "Yes",
    questionnaireTools: "Partial",
    rfpTools: "No",
    manual: "Manual",
  },
  {
    capability: "Auto-complete portal questionnaires",
    vaultix: "Yes",
    questionnaireTools: "No",
    rfpTools: "No",
    manual: "No",
  },
  {
    capability: "Collaboration and delegation",
    vaultix: "Advanced",
    questionnaireTools: "Limited",
    rfpTools: "Moderate",
    manual: "Limited",
  },
];

const engineLayers = [
  {
    num: "01",
    title: "Multiple layers of business context",
    desc: "Vaultix combines policies, architecture docs, past answers, and external references into one searchable evidence graph.",
  },
  {
    num: "02",
    title: "Continuously refreshed knowledge graph",
    desc: "As your sources change, Vaultix updates retrieval context so stale answers are flagged before reviewers find them.",
  },
  {
    num: "03",
    title: "Business-ready sourced answers",
    desc: "Generated answers include confidence, citations, and workflow status so your team can approve quickly with trust.",
  },
];

const engineGuardrails = [
  {
    icon: Search,
    title: "Gaps are surfaced proactively",
    desc: "Missing evidence is highlighted so reviewers focus only where human input is needed.",
  },
  {
    icon: Eye,
    title: "No black-box responses",
    desc: "Each answer is traceable to source material with visible confidence and approval history.",
  },
  {
    icon: Users,
    title: "Collaboration built in",
    desc: "Security, legal, and GTM can assign, review, and approve responses in one shared flow.",
  },
];

const resourcePosts = [
  {
    title: "How to cut questionnaire review time by 60%",
    tag: "Playbook",
    date: "April 2026",
  },
  {
    title: "Building a high-trust AI answer workflow",
    tag: "Product",
    date: "March 2026",
  },
  {
    title: "What top security teams measure in AI accuracy",
    tag: "Benchmark",
    date: "March 2026",
  },
];

const mockRows = [
  {
    q: "Do you encrypt all data at rest?",
    a: "Yes. All data at rest is encrypted using AES-256 via AWS KMS...",
    full: "Yes. All data at rest is encrypted using AES-256 encryption via AWS KMS with automatic key rotation every 90 days. This applies to all databases (RDS, DynamoDB), S3 buckets, EBS volumes, and database backups.",
    conf: 96,
    status: "Approved",
    citations: ["Security Policy v3.2 · p.12", "AWS Architecture Guide · p.4"],
  },
  {
    q: "Describe your incident response process",
    a: "Our IR follows a structured 4-phase approach based on NIST SP 800-61...",
    full: "Our IR follows a structured 4-phase approach based on NIST SP 800-61: Preparation, Detection & Analysis, Containment/Eradication/Recovery, and Post-Incident Activity. We maintain 24/7 on-call with a 15-minute SLA for critical incidents.",
    conf: 82,
    status: "Review",
    citations: ["Incident Response Plan · p.3", "BCP & DR Policy · p.7"],
  },
  {
    q: "What is your business continuity plan?",
    a: "Our BCP includes redundant systems across multiple availability zones...",
    full: "Our BCP includes redundant systems across 3 AWS availability zones with automatic failover (RTO < 4hr, RPO < 1hr). We conduct quarterly BCP tests and annual DR drills with documented results.",
    conf: 91,
    status: "Approved",
    citations: ["BCP & DR Policy · p.2", "AWS Architecture Guide · p.11"],
  },
  {
    q: "How do you handle data subject requests?",
    a: "Insufficient information in knowledge base to fully answer this question.",
    full: "Insufficient information in knowledge base to fully answer this question. Consider adding your GDPR/CCPA data subject request procedures to the knowledge base to improve coverage.",
    conf: 28,
    status: "Draft",
    citations: [],
  },
  {
    q: "Do you perform penetration testing?",
    a: "Yes. We engage third-party security firms for annual penetration testing...",
    full: "Yes. We engage accredited third-party security firms for annual penetration testing covering OWASP Top 10, network, and infrastructure. Our last pentest was January 2026; findings are remediated within 30 days (critical) or 90 days (high).",
    conf: 88,
    status: "Approved",
    citations: [
      "Security Policy v3.2 · p.18",
      "Vulnerability Management SOP · p.5",
    ],
  },
];

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark text-light overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <AccuracyProof />
      <Features />
      <HowItWorks />
      <KnowledgeEngine />
      <Differentiation />
      <Stats />
      <Testimonials />
      <Pricing />
      <ResourceCenter />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

/* ═══════ NAVBAR ═══════ */
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-overlay/[0.06]">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center shadow-lg shadow-brand/20">
              <VaultixIcon className="w-5 h-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              Vault<span className="text-brand">ix</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Proof", href: "#proof" },
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Why Vaultix", href: "#why-vaultix" },
              { label: "Pricing", href: "#pricing" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-light-2 hover:text-light transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-light-2 hover:text-light rounded-lg"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden relative bg-dark-2 border-b border-overlay/[0.06] px-4 py-5"
        >
          <div className="flex flex-col gap-3">
            <a
              href="#proof"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Proof
            </a>
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Pricing
            </a>
            <a
              href="#why-vaultix"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Why Vaultix
            </a>
            <hr className="border-overlay/[0.06]" />
            <Link
              href="/login"
              className="px-3 py-2 text-light-2 hover:text-light transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="mt-1 bg-brand text-white font-semibold px-5 py-3 rounded-full text-center text-sm"
            >
              Start Free Trial
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

/* ═══════ HERO ═══════ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Bg effects */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-brand/[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-brand/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/20 bg-brand/[0.08] text-brand text-sm font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Now in Public Beta</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
          >
            Complete Security
            <br className="hidden sm:block" /> Questionnaires{" "}
            <span className="text-gradient-brand">10x Faster</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-light-2 max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered answers with citations, confidence scores, and full audit
            trails. Upload your questionnaire and get draft answers in minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-light border border-white/10 hover:border-white/20 rounded-full hover:bg-white/[0.04] transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {[
              { icon: Lock, label: "No credit card required" },
              { icon: Clock, label: "14-day free trial" },
              { icon: FileCheck, label: "SOC 2 compliant" },
            ].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-sm text-light-3"
              >
                <item.icon className="w-3.5 h-3.5 text-brand/70 shrink-0" />
                {item.label}
                {i < 2 && (
                  <span className="hidden sm:inline ml-5 w-px h-3.5 bg-white/10 rounded-full" />
                )}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-b from-brand/10 via-brand/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />
          <ProductMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ PRODUCT MOCKUP ═══════ */
function ProductMockup() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const confColor = (c: number) =>
    c >= 80 ? "text-success" : c >= 50 ? "text-warning" : "text-danger";
  const confBar = (c: number) =>
    c >= 80
      ? "from-success to-emerald-400"
      : c >= 50
        ? "from-warning to-amber-400"
        : "from-danger to-red-400";
  const confLabel = (c: number) =>
    c >= 80 ? "High confidence" : c >= 50 ? "Moderate" : "Low — needs review";

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-dark-2/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-dark-3/50 border-b border-white/[0.04]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="text-light-3 text-xs font-mono truncate">
          SOC2_Security_Questionnaire.xlsx
        </span>
        <div className="ml-auto hidden sm:flex items-center gap-3">
          <span className="text-xs text-light-3 bg-dark-4 px-2.5 py-0.5 rounded-md font-mono">
            42/50 Approved
          </span>
          <div className="w-24 h-1.5 rounded-full bg-dark-4 overflow-hidden">
            <div className="w-[84%] h-full bg-gradient-to-r from-brand to-amber-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border-b border-white/[0.04] text-xs overflow-x-auto">
        <span className="text-brand font-semibold bg-brand/10 px-3 py-1 rounded-full whitespace-nowrap">
          All (50)
        </span>
        <span className="text-light-3 px-3 py-1 rounded-full whitespace-nowrap">
          Draft (3)
        </span>
        <span className="text-light-3 px-3 py-1 rounded-full whitespace-nowrap">
          Review (5)
        </span>
        <span className="text-light-3 px-3 py-1 rounded-full whitespace-nowrap">
          Approved (42)
        </span>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[40px_1fr_1fr_80px_90px] gap-3 px-5 py-2 text-xs text-light-3 border-b border-white/[0.04] font-semibold uppercase tracking-wider">
        <span>#</span>
        <span>Question</span>
        <span>AI Answer</span>
        <span>Score</span>
        <span>Status</span>
      </div>

      {/* Table rows */}
      {mockRows.map((row, i) => {
        const isHovered = hoveredRow === i;
        const isDimmed = hoveredRow !== null && !isHovered;

        return (
          <div key={i} className="border-b border-white/[0.03] last:border-0">
            {/* Main row */}
            <motion.div
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              animate={{ opacity: isDimmed ? 0.35 : 1 }}
              transition={{ duration: 0.2 }}
              className={`relative grid grid-cols-1 sm:grid-cols-[40px_1fr_1fr_80px_90px] gap-1 sm:gap-3 px-4 sm:px-5 py-3.5 cursor-pointer transition-colors duration-200 ${isHovered ? "bg-brand/[0.035]" : ""
                }`}
            >
              {/* Left glow accent bar */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-brand via-orange-400 to-amber-500 rounded-r-full"
                initial={{ opacity: 0, scaleY: 0.4 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scaleY: isHovered ? 1 : 0.4,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />

              <span className="hidden sm:block text-light-3 font-mono text-xs leading-5 pt-0.5">
                {i + 1}
              </span>

              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${isHovered ? "text-white" : "text-light"}`}
              >
                {row.q}
              </span>

              <span className="text-light-2 truncate text-xs leading-relaxed pt-0.5">
                {row.a}
              </span>

              <span
                className={`font-mono text-xs font-bold ${confColor(row.conf)}`}
              >
                {row.conf}%
              </span>

              <span>
                <motion.span
                  animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                  className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium transition-all ${row.status === "Approved"
                      ? "bg-success/10 text-success"
                      : row.status === "Review"
                        ? "bg-warning/10 text-warning"
                        : "bg-light-4/10 text-light-3"
                    }`}
                >
                  {row.status}
                </motion.span>
              </span>
            </motion.div>

            {/* ── Expanded detail panel ── */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.28,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="overflow-hidden"
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="mx-4 sm:mx-5 mb-3 rounded-xl bg-dark-3/70 border border-white/[0.07] backdrop-blur-sm overflow-hidden">
                    {/* Brand glow strip at top */}
                    <div className="h-[2px] bg-gradient-to-r from-brand via-orange-400 to-transparent" />

                    <div className="p-4 space-y-4">
                      {/* Full answer */}
                      <p className="text-xs text-light-2 leading-relaxed">
                        {row.full}
                      </p>

                      {/* Confidence bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-light-3 uppercase tracking-wider">
                            Confidence
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${confColor(row.conf)}`}
                          >
                            {row.conf}% · {confLabel(row.conf)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-dark-5 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${confBar(row.conf)} shadow-sm`}
                            initial={{ width: 0 }}
                            animate={{ width: `${row.conf}%` }}
                            transition={{
                              duration: 0.6,
                              ease: "easeOut",
                              delay: 0.05,
                            }}
                          />
                        </div>
                      </div>

                      {/* Citations */}
                      {row.citations.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-light-3 uppercase tracking-wider">
                            Sources
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {row.citations.map((cite, ci) => (
                              <motion.span
                                key={ci}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + ci * 0.06 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-4/80 border border-white/[0.06] text-xs text-light-3 hover:border-brand/30 hover:text-light-2 transition-all cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-brand shrink-0" />
                                {cite}
                                <ExternalLink className="w-2.5 h-2.5 text-light-4" />
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
                        {row.status !== "Approved" && (
                          <motion.button
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-success bg-success/10 hover:bg-success/20 transition-all"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </motion.button>
                        )}
                        <motion.button
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-light-3 bg-white/[0.04] hover:bg-white/[0.08] hover:text-light-2 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.16 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-light-3 bg-white/[0.04] hover:bg-white/[0.08] hover:text-light-2 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════ TRUSTED BY ═══════ */
function TrustedBy() {
  const companies = [
    "CloudKin",
    "VaultStack",
    "TrustLayer",
    "ComplianceHQ",
    "DataForge",
    "SecureOps",
  ];
  return (
    <section className="relative py-16 border-t border-overlay/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-light-3 mb-8 font-medium">
          Trusted by security teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span
              key={name}
              className="text-light-4 text-lg font-heading font-semibold hover:text-light-2 transition-colors duration-300 cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ FEATURES ═══════ */
function AccuracyProof() {
  return (
    <section id="proof" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-2 to-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Accuracy Benchmark
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Where accuracy matters, <span className="text-gradient-brand">Vaultix wins</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg">
            Speed alone is not enough for security reviews. We prioritize reliable,
            source-backed answers your team can trust.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-12 rounded-2xl border border-white/[0.08] bg-dark-3/40 p-6 sm:p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand/25 to-brand/10 border border-brand/30 flex items-center justify-center">
              <VaultixIcon className="w-10 h-10 text-brand" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/15 border border-brand/25">
              <span className="text-xl sm:text-2xl font-heading font-bold text-brand">
                {proofSummary.generated}
              </span>
              <span className="text-sm text-light-2">{proofSummary.label}</span>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {proofMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-xl border border-white/[0.08] bg-dark-4/50 p-4 text-center"
              >
                <p className="font-heading text-2xl sm:text-3xl font-bold text-gradient-brand">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-light">{metric.label}</p>
                <p className="mt-1 text-xs text-light-3">{metric.note}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-8 rounded-2xl border border-white/[0.08] bg-dark-3/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-light-3 bg-dark-4/30">
                  <th className="px-5 sm:px-6 py-3 font-semibold">Capability</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold text-brand">Vaultix</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold">Other Questionnaire Tools</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold">RFP Software</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold">Manual Process</th>
                </tr>
              </thead>
              <tbody>
                {proofTableRows.map((row) => (
                  <tr
                    key={row.capability}
                    className="border-t border-white/[0.05] text-sm text-light-2"
                  >
                    <td className="px-5 sm:px-6 py-4 text-light">{row.capability}</td>
                    <td className="px-5 sm:px-6 py-4 text-success font-medium">{row.vaultix}</td>
                    <td className="px-5 sm:px-6 py-4 text-light-3">{row.questionnaireTools}</td>
                    <td className="px-5 sm:px-6 py-4 text-light-3">{row.rfpTools}</td>
                    <td className="px-5 sm:px-6 py-4 text-light-3">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Bg variation */}
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need to
            <br className="hidden sm:block" />
            <span className="text-gradient-brand"> ace security reviews</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-2xl mx-auto">
            From upload to export, Vaultix handles the heavy lifting while you
            stay in control.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-glow group rounded-2xl bg-dark-3/50 border border-overlay/[0.06] p-6 hover:border-brand/20 hover:bg-dark-3/80 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/15 transition-colors">
                <f.icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2 text-light group-hover:text-white transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-light-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ HOW IT WORKS ═══════ */
/* ── Step preview sub-components ── */
function UploadPreview() {
  const [phase, setPhase] = useState<"idle" | "dropping" | "done">("idle");
  useEffect(() => {
    setPhase("idle");
    const t1 = setTimeout(() => setPhase("dropping"), 800);
    const t2 = setTimeout(() => setPhase("done"), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
      {/* Drop zone */}
      <motion.div
        animate={
          phase === "dropping"
            ? {
              borderColor: "rgba(249,115,22,0.8)",
              boxShadow: "0 0 30px rgba(249,115,22,0.15)",
            }
            : phase === "done"
              ? { borderColor: "rgba(34,197,94,0.6)" }
              : {}
        }
        className="relative w-full max-w-sm h-40 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 overflow-hidden bg-dark-3/40"
      >
        {/* Animated grid lines */}
        <div className="absolute inset-0 bg-grid opacity-10" />

        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <Upload className="w-8 h-8 text-light-3" />
              </motion.div>
              <span className="text-xs text-light-3">
                Drop your questionnaire here
              </span>
              <span className="text-[10px] text-light-4">
                .xlsx · .csv · .xls
              </span>
            </motion.div>
          )}
          {phase === "dropping" && (
            <motion.div
              key="dropping"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-14 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 flex items-center justify-center shadow-lg shadow-brand/10"
              >
                <FileText className="w-6 h-6 text-brand" />
              </motion.div>
              <span className="text-xs text-brand font-medium">
                SOC2_Questionnaire.xlsx
              </span>
              <motion.div className="w-32 h-1 rounded-full bg-dark-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-brand to-amber-400 rounded-full"
                />
              </motion.div>
            </motion.div>
          )}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-success" />
              </motion.div>
              <span className="text-sm text-success font-semibold">
                87 questions detected
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Format chips */}
      <div className="flex gap-2">
        {["SOC 2", "ISO 27001", "HIPAA", "PCI DSS"].map((f, i) => (
          <motion.span
            key={f}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-light-3"
          >
            {f}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function AiPreview() {
  const qItems = [
    { q: "Do you encrypt data at rest?", conf: 97 },
    { q: "Is MFA enforced for all users?", conf: 89 },
    { q: "Describe your incident response plan.", conf: 74 },
    { q: "What is your data retention policy?", conf: 91 },
  ];
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setVisible(0);
    setTyping(true);
    const timers: ReturnType<typeof setTimeout>[] = [];
    qItems.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), 400 + i * 700));
    });
    timers.push(setTimeout(() => setTyping(false), 400 + qItems.length * 700));
    return () => timers.forEach(clearTimeout);
  }, []);

  const barColor = (c: number) =>
    c >= 80
      ? "from-success to-emerald-400"
      : c >= 60
        ? "from-warning to-amber-400"
        : "from-danger to-red-400";

  return (
    <div className="flex flex-col h-full px-4 py-3 gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 rounded-full bg-brand shadow-[0_0_6px_rgba(249,115,22,0.8)]"
        />
        <span className="text-xs text-brand font-mono font-semibold">
          Vaultix AI · RAG Pipeline running
        </span>
        {typing && (
          <span className="ml-auto flex gap-0.5">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="w-1 h-1 rounded-full bg-brand/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Question rows appearing */}
      <div className="flex flex-col gap-2 flex-1">
        {qItems.slice(0, visible).map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-xl bg-dark-3/60 border border-white/[0.06] p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-light-2 leading-snug flex-1">
                {item.q}
              </span>
              <span
                className={`text-[10px] font-mono font-bold shrink-0 ${item.conf >= 80 ? "text-success" : item.conf >= 60 ? "text-warning" : "text-danger"}`}
              >
                {item.conf}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-dark-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.conf}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                className={`h-full rounded-full bg-gradient-to-r ${barColor(item.conf)}`}
              />
            </div>
          </motion.div>
        ))}
        {typing && visible < qItems.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-dark-3/40 border border-white/[0.04] p-3 flex items-center gap-2"
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-brand/40"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: d * 0.15,
                  }}
                />
              ))}
            </span>
            <span className="text-xs text-light-4">Generating answer…</span>
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-1 pt-2 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-[10px] text-light-4 font-mono">
          {visible}/{qItems.length} processed
        </span>
        <div className="w-24 h-1 rounded-full bg-dark-5 overflow-hidden">
          <motion.div
            animate={{ width: `${(visible / qItems.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-brand to-amber-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

function ReviewPreview() {
  const rows = [
    { q: "Encrypt data at rest?", status: "Approved", conf: 97 },
    { q: "MFA for all users?", status: "Approved", conf: 89 },
    { q: "Incident response plan?", status: "Review", conf: 74 },
    { q: "Data retention policy?", status: "Approved", conf: 91 },
    { q: "Penetration testing cadence?", status: "Approved", conf: 85 },
  ];
  const [approved, setApproved] = useState(0);

  useEffect(() => {
    setApproved(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    [0, 1, 3, 4].forEach((idx, order) => {
      timers.push(
        setTimeout(() => setApproved((o) => o + 1), 400 + order * 500),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col h-full px-4 py-3 gap-2">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-light">SOC2 Review</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-mono">
            {approved + 1}/50
          </span>
        </div>
        <motion.button
          animate={
            approved >= 4
              ? {
                boxShadow: [
                  "0 0 0px rgba(249,115,22,0)",
                  "0 0 14px rgba(249,115,22,0.5)",
                  "0 0 0px rgba(249,115,22,0)",
                ],
              }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${approved >= 4 ? "bg-brand text-dark" : "bg-white/[0.06] text-light-3"}`}
        >
          <Download className="w-3 h-3" />
          Export
        </motion.button>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5 flex-1">
        {rows.map((row, i) => {
          const isApproved =
            row.status === "Approved" && approved > [0, 1, 3, 4, 2].indexOf(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-dark-3/50 border border-white/[0.04]"
            >
              <span className="text-[10px] text-light-2 flex-1 truncate">
                {row.q}
              </span>
              <span
                className={`text-[10px] font-mono ${row.conf >= 80 ? "text-success" : "text-warning"}`}
              >
                {row.conf}%
              </span>
              <AnimatePresence mode="wait">
                {isApproved ? (
                  <motion.span
                    key="approved"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium shrink-0"
                  >
                    ✓ Approved
                  </motion.span>
                ) : (
                  <motion.span
                    key="review"
                    className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium shrink-0"
                  >
                    Review
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1 rounded-full bg-dark-5 overflow-hidden">
            <motion.div
              animate={{ width: `${(approved / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400"
            />
          </div>
          <span className="text-[10px] text-light-4 font-mono">
            {approved * 10 + 2}/50 done
          </span>
        </div>
        <span className="text-[10px] text-light-4">avg 97% confidence</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setActiveStep((s) => (s + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const stepDefs = [
    {
      num: "01",
      icon: Upload,
      title: "Upload Questionnaire",
      desc: "Drop your .xlsx or .csv. We auto-detect question columns, preserve formatting, and support all major compliance frameworks.",
      preview: <UploadPreview />,
    },
    {
      num: "02",
      icon: Brain,
      title: "AI Generates Answers",
      desc: "Our RAG pipeline searches your knowledge base, generates answers with citations and confidence scores — in seconds.",
      preview: <AiPreview />,
    },
    {
      num: "03",
      icon: FileCheck,
      title: "Review & Export",
      desc: "Edit inline, approve in bulk, flag for teammates, then export the completed file in the original format. Zero reformatting.",
      preview: <ReviewPreview />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-[0.12]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Three steps to
            <span className="text-gradient-brand"> done</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-xl mx-auto">
            Upload, review, export. It really is that simple.
          </p>
        </motion.div>

        {/* Main interactive block */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/[0.07] bg-dark-2/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40"
        >
          {/* Step selector tabs */}
          <div className="grid grid-cols-3 border-b border-white/[0.06]">
            {stepDefs.map((s, i) => {
              const Icon = s.icon;
              const isActive = activeStep === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActiveStep(i);
                    setPaused(true);
                  }}
                  className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 text-left transition-all duration-300 border-r border-white/[0.06] last:border-r-0 ${isActive ? "bg-brand/[0.05]" : "hover:bg-white/[0.02]"}`}
                >
                  {/* Active bottom bar */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand via-orange-400 to-amber-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />

                  {/* Progress ring around icon */}
                  <div className="relative shrink-0">
                    <svg
                      className="absolute inset-0 -rotate-90"
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="rgba(249,115,22,0.08)"
                        strokeWidth="2"
                      />
                      {isActive && (
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="rgba(249,115,22,0.5)"
                          strokeWidth="2"
                          strokeDasharray={`${2 * Math.PI * 15}`}
                          strokeDashoffset={2 * Math.PI * 15}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 4, ease: "linear" }}
                          key={`ring-${activeStep}`}
                        />
                      )}
                    </svg>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? "bg-brand/20 shadow-[0_0_16px_rgba(249,115,22,0.25)]" : "bg-white/[0.04]"}`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors duration-300 ${isActive ? "text-brand" : "text-light-3"}`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-[10px] font-mono font-bold tracking-widest mb-0.5 transition-colors ${isActive ? "text-brand" : "text-light-4"}`}
                    >
                      STEP {s.num}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-semibold leading-tight transition-colors ${isActive ? "text-white" : "text-light-2"}`}
                    >
                      {s.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Left: description */}
            <div className="flex flex-col justify-center px-8 py-10 border-b lg:border-b-0 lg:border-r border-white/[0.05]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`desc-${activeStep}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5"
                >
                  {/* Big step number */}
                  <div className="font-mono text-7xl font-black text-white/[0.04] leading-none select-none">
                    {stepDefs[activeStep].num}
                  </div>

                  <div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
                      {stepDefs[activeStep].title}
                    </h3>
                    <p className="text-light-2 leading-relaxed">
                      {stepDefs[activeStep].desc}
                    </p>
                  </div>

                  {/* Step bullets per step */}
                  <div className="space-y-2">
                    {[
                      activeStep === 0
                        ? [
                          "Auto-detects question columns",
                          "Preserves original formatting",
                          "SOC2, ISO27001, HIPAA, PCI DSS, GDPR",
                        ]
                        : activeStep === 1
                          ? [
                            "RAG over your knowledge base",
                            "Confidence score per answer",
                            "Source citations included",
                          ]
                          : [
                            "Edit inline or approve in bulk",
                            "Assign rows to teammates",
                            "Export in original file format",
                          ],
                    ][0].map((bullet, bi) => (
                      <motion.div
                        key={bi}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: bi * 0.08 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-4 h-4 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-brand" />
                        </div>
                        <span className="text-sm text-light-2">{bullet}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation dots */}
                  <div className="flex items-center gap-2 pt-2">
                    {stepDefs.map((_, di) => (
                      <button
                        key={di}
                        onClick={() => {
                          setActiveStep(di);
                          setPaused(true);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${di === activeStep ? "w-6 bg-brand" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                      />
                    ))}
                    <button
                      onClick={() => setPaused((p) => !p)}
                      className="ml-auto text-[10px] text-light-4 hover:text-light-3 transition-colors font-mono"
                    >
                      {paused ? "▶ play" : "⏸ pause"}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: animated preview */}
            <div className="relative bg-dark-3/30 min-h-[300px]">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[10px] text-light-4 font-mono">
                  {
                    [
                      "upload.vaultix.app",
                      "ai-engine.vaultix.app",
                      "review.vaultix.app",
                    ][activeStep]
                  }
                </span>
              </div>

              {/* Preview content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`preview-${activeStep}`}
                  initial={{ opacity: 0, scale: 0.97, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 top-[38px]"
                >
                  {stepDefs[activeStep].preview}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ STATS ═══════ */
function KnowledgeEngine() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="absolute top-0 left-[-8%] w-[360px] h-[360px] rounded-full bg-brand/[0.05] blur-[110px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Intelligence Layer
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built to handle what <span className="text-gradient-brand">generic AI cannot</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.08] bg-dark-3/35 p-5 sm:p-6"
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-300/25 bg-amber-300/8 p-4">
                <p className="text-[11px] uppercase tracking-widest text-amber-200/80 mb-2">Inputs</p>
                <div className="flex flex-wrap gap-2">
                  {["Policies", "External Sources", "Past Answers", "Q&A Pairs"].map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-md text-xs bg-dark-4/70 border border-white/[0.08] text-light-2"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-brand/30 bg-brand/10 p-4">
                <p className="text-[11px] uppercase tracking-widest text-brand/85 mb-2">Engine</p>
                <div className="rounded-lg border border-white/[0.08] bg-dark-4/70 p-3">
                  <p className="text-sm font-semibold text-light">Knowledge Graph + Analysis</p>
                  <p className="text-xs text-light-3 mt-1">
                    Auto-refresh keeps answers aligned as source material changes.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-violet-300/25 bg-violet-300/8 p-4">
                <p className="text-[11px] uppercase tracking-widest text-violet-200/80 mb-2">Outputs</p>
                <div className="flex flex-wrap gap-2">
                  {["Security Questionnaires", "Web Portals", "RFPs", "Excel", "PDF", "Email"].map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-md text-xs bg-dark-4/70 border border-white/[0.08] text-light-2"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {engineLayers.map((layer, i) => (
              <motion.div
                key={layer.num}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.08] bg-dark-3/35 p-5 sm:p-6"
              >
                <span className="text-2xl font-heading font-bold text-light-3">{layer.num}</span>
                <h3 className="mt-2 font-heading text-xl sm:text-2xl font-semibold">{layer.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-light-2 leading-relaxed">{layer.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {engineGuardrails.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-xl border border-white/[0.08] bg-dark-3/35 p-4"
            >
              <div className="w-9 h-9 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center mb-3">
                <item.icon className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-sm font-semibold text-light">{item.title}</h4>
              <p className="mt-1.5 text-xs sm:text-sm text-light-3">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiation() {
  const [activeMode, setActiveMode] = useState<
    (typeof differentiationModes)[number]["id"]
  >("trust");

  const activeModeData =
    differentiationModes.find((mode) => mode.id === activeMode) ??
    differentiationModes[0];

  return (
    <section id="why-vaultix" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="absolute top-12 right-[-8%] w-[360px] h-[360px] rounded-full bg-brand/[0.06] blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[320px] h-[320px] rounded-full bg-brand/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Why Vaultix
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built for <span className="text-gradient-brand">defensible speed</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg">
            Most tools optimize for faster typing. Vaultix optimizes for faster
            approvals with proof your team can defend in front of buyers and auditors.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.08] bg-dark-3/40 p-5 sm:p-6"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              {differentiationModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeMode === mode.id
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "bg-dark-4/60 text-light-3 border border-white/[0.08] hover:text-light-2"
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeModeData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-heading text-xl sm:text-2xl font-bold">
                  {activeModeData.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-light-2 leading-relaxed">
                  {activeModeData.desc}
                </p>

                <div className="mt-6 space-y-3">
                  {activeModeData.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-brand" />
                      </div>
                      <p className="text-sm text-light-2">{bullet}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-2xl border border-white/[0.08] bg-dark-3/30 p-5 sm:p-6"
          >
            <h3 className="font-heading text-lg font-semibold mb-5">
              What makes us different
            </h3>
            <div className="space-y-3">
              {differentiationPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-xl border border-white/[0.06] bg-dark-4/40 p-4"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
                      <pillar.icon className="w-4 h-4 text-brand" />
                    </div>
                    <h4 className="text-sm font-semibold text-light">{pillar.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-light-3 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-8 rounded-2xl border border-white/[0.08] bg-dark-3/30 overflow-hidden"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
            <h3 className="font-heading text-base sm:text-lg font-semibold">
              Vaultix vs common alternatives
            </h3>
            <span className="text-[11px] sm:text-xs text-light-3">
              Practical differentiation at a glance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-light-3 bg-dark-4/30">
                  <th className="px-5 sm:px-6 py-3 font-semibold">Capability</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold text-brand">Vaultix</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold">Generic AI Tool</th>
                  <th className="px-5 sm:px-6 py-3 font-semibold">Manual Spreadsheet</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.capability}
                    className="border-t border-white/[0.05] text-sm text-light-2"
                  >
                    <td className="px-5 sm:px-6 py-4 text-light">{row.capability}</td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-success">
                        <Check className="w-3.5 h-3.5" />
                        {row.vaultix}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-light-3">{row.genericAI}</td>
                    <td className="px-5 sm:px-6 py-4 text-light-3">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "10x", label: "Faster completion" },
    { value: "87%", label: "Answers accepted" },
    { value: "120+", label: "Companies trust us" },
    { value: "50K+", label: "Questions answered" },
  ];

  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-brand/[0.04] via-dark-2 to-brand/[0.04]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-3xl sm:text-4xl font-bold text-gradient-brand">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-light-3">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ TESTIMONIALS ═══════ */
function Testimonials() {
  const testimonials = [
    {
      quote:
        "We used to spend 3 days per SOC 2 questionnaire. With Vaultix it's under 4 hours. Our security team went from a bottleneck to a competitive advantage.",
      name: "Sarah Chen",
      title: "Head of Security",
      company: "Meridian Cloud",
      stage: "Series B · 280 employees",
      avatar: "SC",
      rating: 5,
    },
    {
      quote:
        "The confidence scores are a game-changer. I know exactly which answers need human review and which I can approve in bulk. It's cut my review time by 80%.",
      name: "Marcus Reid",
      title: "CISO",
      company: "Lattice Systems",
      stage: "Series C · 600 employees",
      avatar: "MR",
      rating: 5,
    },
    {
      quote:
        "Our sales team can now self-serve security reviews without pulling the security team into every deal. We're closing enterprise contracts 3 weeks faster.",
      name: "Priya Nair",
      title: "VP of Engineering",
      company: "Nexlify",
      stage: "Series A · 95 employees",
      avatar: "PN",
      rating: 5,
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Customer Stories
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Loved by security teams
            <span className="text-gradient-brand"> worldwide</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative rounded-2xl bg-dark-2/60 border border-white/[0.06] p-7 hover:border-white/[0.12] hover:bg-dark-3/60 transition-all duration-300 flex flex-col"
            >
              {/* Top glow on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <svg
                    key={si}
                    className="w-4 h-4 text-brand fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-light-2 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-orange-700/20 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-light">{t.name}</p>
                  <p className="text-xs text-light-3 truncate">
                    {t.title} · {t.company}
                  </p>
                </div>
                <span className="ml-auto text-[10px] text-light-4 bg-dark-4/60 px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:block">
                  {t.stage}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ PRICING ═══════ */
function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple, <span className="text-gradient-brand">transparent</span>{" "}
            pricing
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col ${plan.popular
                  ? "bg-dark-3 border-2 border-brand glow-brand scale-[1.02]"
                  : "bg-dark-3/50 border border-overlay/[0.06] hover:border-overlay/[0.12]"
                } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-lg font-bold mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-light-3">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="font-heading text-4xl font-bold">
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-light-3 text-sm ml-1">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-light-2"
                  >
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={
                  plan.popular
                    ? "/register"
                    : plan.price === "Custom"
                      ? "#contact"
                      : "/register"
                }
                className={`w-full inline-flex items-center justify-center py-3 rounded-full text-sm font-semibold transition-all duration-200 ${plan.popular
                    ? "bg-brand hover:bg-brand-hover text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-light border border-overlay/[0.06]"
                  }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ FAQ ═══════ */
function ResourceCenter() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.1]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-4 mb-8"
        >
          <div>
            <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-3">
              Resources
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              Recent insights for modern security teams
            </h2>
          </div>
          <Link
            href="#"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.12] text-sm text-light-2 hover:text-light hover:border-white/[0.2] transition-all"
          >
            View all posts
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resourcePosts.map((post, i) => (
            <motion.a
              key={post.title}
              href="#"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="group rounded-2xl border border-white/[0.08] bg-dark-3/35 p-5 hover:border-brand/25 hover:bg-dark-3/55 transition-all duration-300"
            >
              <div className="h-24 rounded-xl bg-gradient-to-br from-brand/20 to-amber-600/10 border border-brand/20 mb-4 flex items-center justify-center">
                <span className="text-brand text-xs font-semibold uppercase tracking-wider">
                  {post.tag}
                </span>
              </div>
              <p className="text-sm text-light-3">{post.date}</p>
              <h3 className="mt-2 font-heading text-lg font-semibold text-light group-hover:text-white transition-colors">
                {post.title}
              </h3>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand group-hover:text-brand-light transition-colors">
                Read article
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the AI generate accurate answers?",
      a: "Vaultix uses Retrieval-Augmented Generation (RAG). When you upload a questionnaire, we search your knowledge base — your policies, architecture docs, SOC 2 reports — and use those as grounding context for each answer. The AI never makes things up; every answer cites the specific document and page it pulled from.",
    },
    {
      q: "What file formats are supported?",
      a: "We support .xlsx, .xls, and .csv for questionnaires, and can auto-detect which columns contain questions vs. metadata. For knowledge base documents, we accept PDF, DOCX, and TXT. Exports are returned in the same format you uploaded — no reformatting required.",
    },
    {
      q: "Is my data secure? Who can see my documents?",
      a: "Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). Documents are stored in isolated, per-tenant storage — no data is ever shared between organizations. We never use your data to train AI models. Vaultix is SOC 2 Type II certified.",
    },
    {
      q: "How accurate are the AI-generated answers?",
      a: "Across our customer base, 87% of AI-generated answers are approved without edits. Each answer comes with a confidence score (0–100%) and source citations, so you always know how strong the evidence is. Low-confidence answers are automatically flagged for human review.",
    },
    {
      q: "Can my whole team collaborate on a questionnaire?",
      a: "Yes. You can invite teammates with Editor or Viewer roles. Multiple people can review and approve answers simultaneously. The audit log tracks every change — who edited what, when, and why — giving you a full compliance trail.",
    },
    {
      q: "What happens when my 14-day trial ends?",
      a: "You'll be prompted to add a payment method before the trial ends. If you don't, your account moves to a read-only state — you can still export completed questionnaires, but you won't be able to process new ones. No data is deleted. You can upgrade at any time to restore full access.",
    },
    {
      q: "Do you support custom question mappings?",
      a: "Yes. For enterprise accounts, you can define custom column-to-question mappings, create answer templates for common question types, and build a reusable answer library that persists across questionnaires. Contact sales to learn more.",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.15]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            FAQ
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to
            <span className="text-gradient-brand"> know</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                    ? "border-brand/30 bg-dark-3/60"
                    : "border-white/[0.06] bg-dark-3/30 hover:border-white/[0.1]"
                  }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span
                    className={`text-sm font-semibold transition-colors ${isOpen ? "text-white" : "text-light"}`}
                  >
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isOpen
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-white/[0.1] text-light-3"
                      }`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M6 1v10M1 6h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <div className="px-6 pb-5">
                        <div className="h-px bg-white/[0.06] mb-4" />
                        <p className="text-sm text-light-2 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-light-3 mt-10"
        >
          Still have questions?{" "}
          <a
            href="mailto:hello@vaultix.app"
            className="text-brand hover:text-brand-light transition-colors font-medium"
          >
            Email us at hello@vaultix.app
          </a>
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════ CTA ═══════ */
function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-2 to-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand/[0.08] blur-[120px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to <span className="text-gradient-brand">10x</span> your
            <br className="hidden sm:block" /> questionnaire workflow?
          </h2>
          <p className="text-light-2 text-lg mb-10 max-w-xl mx-auto">
            Join 120+ security teams already using Vaultix to close deals
            faster. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-light border border-white/10 hover:border-white/20 rounded-full hover:bg-white/[0.04] transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ FOOTER ═══════ */
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "API Docs"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy Policy", "Terms of Service", "DPA", "Security"],
  };

  return (
    <footer className="relative border-t border-overlay/[0.06] bg-dark-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center">
                <VaultixIcon className="w-4 h-4" />
              </div>
              <span className="font-heading text-lg font-bold">
                Vault<span className="text-brand">ix</span>
              </span>
            </div>
            <p className="text-sm text-light-3 leading-relaxed max-w-xs">
              Complete security questionnaires 10x faster with AI-powered
              answers, citations, and confidence scoring.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-heading text-sm font-semibold mb-4 text-light">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-light-3 hover:text-light transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-overlay/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-light-4">
            © 2026 Vaultix. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-light-4">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
