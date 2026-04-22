"use client";
// Client-rendered marketing landing page.

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
  Shield,
  TrendingUp,
  BookOpen,
  Mail,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Minus,
  Activity,
  Database,
  Cpu,
  ArrowUpRight,
  Filter,
  Tag,
  Sun,
  Moon,
} from "lucide-react";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import { SITE_URL } from "@/lib/seo";
import { subscribeNewsletter } from "@/lib/resources";

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

const comparisonRows = [
  {
    capability: "Citation-backed answers",
    vaultix: "Every answer with source excerpt + page",
    questionnaireTools: "Partial",
    genericLlm: "No source guarantees",
  },
  {
    capability: "Confidence-based review routing",
    vaultix: "Auto-route low confidence to review queue",
    questionnaireTools: "Basic flags",
    genericLlm: "No workflow controls",
  },
  {
    capability: "Reusable approved answer library",
    vaultix: "Learns from approved answers across projects",
    questionnaireTools: "Limited templates",
    genericLlm: "Manual copy/paste",
  },
  {
    capability: "Portal + spreadsheet workflows",
    vaultix: "Single workflow for XLSX, CSV, and portal-ready answers",
    questionnaireTools: "Spreadsheet-first",
    genericLlm: "Chat only",
  },
  {
    capability: "Audit-ready change history",
    vaultix: "Full action trail with actor and timestamp",
    questionnaireTools: "Minimal logs",
    genericLlm: "Not audit-focused",
  },
];

const resourcePosts = [
  {
    slug: "cut-questionnaire-review-time",
    title: "How to cut questionnaire review time by 60%",
    category: "Playbook",
    readTime: "6 min read",
    description: "A step-by-step workflow used by top security teams to go from questionnaire upload to approved export in under a business day.",
    featured: true,
    date: "Mar 2026",
    gradient: "from-brand/20 to-orange-700/10",
  },
  {
    slug: "citation-first-ai-workflow",
    title: "Build a citation-first AI security workflow",
    category: "Guide",
    readTime: "8 min read",
    description: "Why citation-backed answers win audits, and how to configure your knowledge base for maximum answer coverage.",
    featured: false,
    date: "Feb 2026",
    gradient: "from-info/20 to-blue-700/10",
  },
  {
    slug: "enterprise-buyer-questions-2026",
    title: "What enterprise buyers ask in 2026 security reviews",
    category: "Research",
    readTime: "5 min read",
    description: "Analysis of 3,400 real security questionnaire questions across fintech, healthcare, and B2B SaaS deals.",
    featured: false,
    date: "Jan 2026",
    gradient: "from-success/20 to-green-700/10",
  },
  {
    slug: "soc2-questionnaire-template",
    title: "SOC 2 questionnaire starter template",
    category: "Template",
    readTime: "Free download",
    description: "Pre-filled SOC 2 Type II questionnaire with 120 questions mapped to common trust service criteria.",
    featured: false,
    date: "Dec 2025",
    gradient: "from-warning/20 to-yellow-700/10",
  },
  {
    slug: "meridian-cloud-case-study",
    title: "How Meridian Cloud closed 4 enterprise deals in one quarter",
    category: "Case Study",
    readTime: "4 min read",
    description: "Reducing security review cycles from 3 days to 4 hours unlocked a new tier of enterprise buyer for their sales team.",
    featured: false,
    date: "Nov 2025",
    gradient: "from-purple-500/20 to-purple-800/10",
  },
  {
    slug: "confidence-scoring-explained",
    title: "Confidence scoring explained: how Vaultix knows what it doesn't know",
    category: "Guide",
    readTime: "7 min read",
    description: "Deep dive into how confidence scores are calculated, calibrated, and why they beat simple hallucination detection.",
    featured: false,
    date: "Oct 2025",
    gradient: "from-info/20 to-blue-700/10",
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

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vaultix",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hello@vaultix.app",
    },
  ],
};

const softwareStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vaultix",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  offers: [
    {
      "@type": "Offer",
      price: "49",
      priceCurrency: "USD",
      category: "Starter",
    },
    {
      "@type": "Offer",
      price: "149",
      priceCurrency: "USD",
      category: "Pro",
    },
  ],
  description:
    "AI-powered security questionnaire automation with citations, confidence scoring, and audit-ready workflows.",
};

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark text-light overflow-x-hidden">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareStructuredData) }}
      />
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Stats />
      <AccuracyProof />
      <KnowledgeEngine />
      <Differentiation />
      <Testimonials />
      <ResourceCenter />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}

/* ═══════ NAVBAR ═══════ */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vaultix-theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("vaultix-theme", next);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]">
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
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Proof", href: "#proof" },
              { label: "Why Vaultix", href: "#why-vaultix" },
              { label: "Pricing", href: "#pricing" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-light-2 hover:text-light transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-brand scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out rounded-full" />
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-dark-4/60 hover:bg-dark-5/80 text-light-3 hover:text-light transition-all duration-200 hover:border-white/[0.16] group overflow-hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "dark" ? (
                    <motion.span
                      key="sun"
                      initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sun className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Moon className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Subtle glow on hover */}
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-brand/10 to-transparent" />
              </button>
            )}

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

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-dark-4/60 text-light-3 hover:text-light transition-all overflow-hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "dark" ? (
                    <motion.span
                      key="sun-m"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon-m"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Moon className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-light-2 hover:text-light rounded-lg"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden relative bg-dark-2 border-b border-white/[0.06] px-4 py-5"
        >
          <div className="flex flex-col gap-3">
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
              href="#proof"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Proof
            </a>
            <a
              href="#why-vaultix"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Why Vaultix
            </a>
            <hr className="border-white/[0.06]" />
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
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
function AccuracyProof() {
  const proofStats = [
    { value: "87%", label: "Answers approved unedited", sub: "vs 12% industry average", color: "brand", icon: CheckCircle2 },
    { value: "2.4x", label: "Faster security reviews", sub: "end-to-end cycle time", color: "info", icon: TrendingUp },
    { value: "<15m", label: "Median first draft", sub: "from upload to complete", color: "success", icon: Zap },
    { value: "99.9%", label: "Answer traceability", sub: "full source coverage", color: "warning", icon: Shield },
  ];

  const liveItems = [
    { org: "MC", orgName: "Meridian Cloud", q: "Do you encrypt all data at rest?", conf: 96, status: "Approved" },
    { org: "LS", orgName: "Lattice Systems", q: "Describe your incident response process", conf: 82, status: "In Review" },
    { org: "NX", orgName: "Nexlify", q: "What is your penetration testing cadence?", conf: 91, status: "Approved" },
    { org: "AC", orgName: "Acme Corp", q: "Do you have a Business Continuity Plan?", conf: 88, status: "Approved" },
    { org: "TC", orgName: "TechCo", q: "How do you handle data subject requests?", conf: 28, status: "Flagged" },
  ];

  const pillars = [
    { label: "Answer Quality", desc: "Confidence + citation checks before any answer is approved or exported", icon: CheckCircle2 },
    { label: "Smart Routing", desc: "Low-confidence answers are auto-queued for human review — nothing slips through", icon: Activity },
    { label: "Audit Readiness", desc: "Every edit, approval, and export captured in a timestamped timeline log", icon: FileCheck },
  ];

  return (
    <section id="proof" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.14]" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand/[0.035] blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-info/[0.035] blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Verified Proof
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Metrics teams can defend
            <span className="text-gradient-brand"> in audits and board reviews</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-2xl mx-auto">
            Vaultix prioritizes verifiable, citation-backed answers — not just fast text generation.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {proofStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group rounded-2xl bg-dark-3/60 border border-white/[0.06] p-6 overflow-hidden hover:border-white/[0.14] transition-all duration-300 cursor-default"
              >
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${stat.color === "brand" ? "bg-brand" :
                  stat.color === "info" ? "bg-info" :
                    stat.color === "success" ? "bg-success" : "bg-warning"
                  }`} />
                <div className={`absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent ${stat.color === "brand" ? "via-brand/60" :
                  stat.color === "info" ? "via-info/60" :
                    stat.color === "success" ? "via-success/60" : "via-warning/60"
                  } to-transparent`} />
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-3 ${stat.color === "brand" ? "text-brand" :
                    stat.color === "info" ? "text-info" :
                      stat.color === "success" ? "text-success" : "text-warning"
                    }`} />
                  <p className={`font-heading text-3xl sm:text-4xl font-bold mb-1 ${stat.color === "brand" ? "text-brand" :
                    stat.color === "info" ? "text-info" :
                      stat.color === "success" ? "text-success" : "text-warning"
                    }`}>{stat.value}</p>
                  <p className="text-sm font-semibold text-light">{stat.label}</p>
                  <p className="text-xs text-light-4 mt-0.5">{stat.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live approval stream */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/[0.08] bg-dark-3/40 overflow-hidden mb-5"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-dark-4/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-light-3">Live verification stream</span>
            </div>
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-xs text-light-4">Real-time answer approvals</span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {liveItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-white/[0.015] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-dark-5 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-light-3 shrink-0">
                  {item.org}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-light-4 mb-0.5 hidden sm:block">{item.orgName}</p>
                  <p className="text-sm text-light-2 truncate">{item.q}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-dark-5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.conf >= 85 ? "bg-success" : item.conf >= 60 ? "bg-warning" : "bg-danger"}`}
                        style={{ width: `${item.conf}%` }}
                      />
                    </div>
                    <span className="text-xs text-light-4 w-7">{item.conf}%</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${item.status === "Approved" ? "bg-success/10 text-success border border-success/20" :
                    item.status === "In Review" ? "bg-info/10 text-info border border-info/20" :
                      "bg-danger/10 text-danger border border-danger/20"
                    }`}>
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 3 pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3.5 p-5 rounded-xl bg-dark-3/30 border border-white/[0.05]"
              >
                <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-light mb-1">{p.label}</p>
                  <p className="text-xs text-light-3 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function KnowledgeEngine() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const columns = [
    {
      stage: "01",
      title: "Inputs",
      subtitle: "Your security knowledge, organized",
      icon: Database,
      accentColor: "info",
      borderColor: "border-info/20",
      glowColor: "bg-info/[0.06]",
      iconBg: "bg-info/10 border-info/20",
      iconColor: "text-info",
      items: [
        { label: "Policies and standards", detail: "ISO 27001, SOC 2, NIST" },
        { label: "Architecture docs", detail: "System diagrams, data flows" },
        { label: "Past approved answers", detail: "Reuse what already works" },
        { label: "Control mappings", detail: "Link answers to frameworks" },
      ],
    },
    {
      stage: "02",
      title: "Engine",
      subtitle: "AI purpose-built for security",
      icon: Cpu,
      accentColor: "brand",
      borderColor: "border-brand/30",
      glowColor: "bg-brand/[0.06]",
      iconBg: "bg-brand/10 border-brand/20",
      iconColor: "text-brand",
      items: [
        { label: "Hybrid retrieval + reranking", detail: "BM25 + dense vector search" },
        { label: "Citation-constrained generation", detail: "Never hallucinates sources" },
        { label: "Confidence calibration", detail: "Scores tuned on security Q&A" },
        { label: "Policy drift detection", detail: "Flags stale knowledge docs" },
      ],
    },
    {
      stage: "03",
      title: "Outputs",
      subtitle: "Reviewer-ready, audit-proof answers",
      icon: FileCheck,
      accentColor: "success",
      borderColor: "border-success/20",
      glowColor: "bg-success/[0.06]",
      iconBg: "bg-success/10 border-success/20",
      iconColor: "text-success",
      items: [
        { label: "Business-ready draft answers", detail: "Professional tone, right length" },
        { label: "Linked evidence excerpts", detail: "Source + page number inline" },
        { label: "Risk-based review queue", detail: "Sorted by confidence score" },
        { label: "Audit export metadata", detail: "Who approved, when, from what" },
      ],
    },
  ];

  return (
    <section id="why-vaultix" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-brand/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Why Vaultix
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built for security workflows,
            <span className="text-gradient-brand"> not generic chat</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-2xl mx-auto">
            Multiple layers of evidence handling keep answers current, explainable, and reviewer-ready.
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px z-10 pointer-events-none">
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-info/40 via-brand/60 to-success/40" />
            <div className="absolute left-[40%] top-[-3px] w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <div className="absolute left-[55%] top-[-3px] w-1.5 h-1.5 rounded-full bg-brand animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {columns.map((col, i) => {
            const Icon = col.icon;
            const isHovered = hoveredCol === i;
            return (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                onMouseEnter={() => setHoveredCol(i)}
                onMouseLeave={() => setHoveredCol(null)}
                className={`relative group cursor-default transition-all duration-300 ${i === 0 ? "rounded-l-2xl md:rounded-r-none rounded-2xl md:rounded-2xl" :
                  i === 2 ? "rounded-r-2xl md:rounded-l-none rounded-2xl md:rounded-2xl" :
                    "rounded-2xl md:rounded-none"
                  } border ${col.borderColor} ${isHovered ? col.glowColor : "bg-dark-2/60"
                  } p-7 overflow-hidden`}
              >
                {/* Top accent line */}
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent ${col.accentColor === "info" ? "via-info" :
                  col.accentColor === "brand" ? "via-brand" : "via-success"
                  } to-transparent opacity-${isHovered ? "100" : "40"} transition-opacity`} />

                {/* Stage badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${col.accentColor === "info" ? "bg-info/10 text-info" :
                    col.accentColor === "brand" ? "bg-brand/10 text-brand" : "bg-success/10 text-success"
                    }`}>
                    Stage {col.stage}
                  </span>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${col.iconBg}`}>
                    <Icon className={`w-5 h-5 ${col.iconColor}`} />
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold mb-1">{col.title}</h3>
                <p className="text-xs text-light-4 mb-6">{col.subtitle}</p>

                <ul className="space-y-3.5">
                  {col.items.map((item, j) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.1 + j * 0.06 }}
                      className="group/item"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${col.accentColor === "info" ? "bg-info" :
                          col.accentColor === "brand" ? "bg-brand" : "bg-success"
                          }`} />
                        <div>
                          <p className="text-sm font-medium text-light">{item.label}</p>
                          <p className="text-xs text-light-4 mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                {/* Arrow connector for mobile */}
                {i < 2 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-4 bg-white/[0.1]" />
                      <ChevronRight className="w-4 h-4 text-light-4 rotate-90" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-light-4"
        >
          {["RAG pipeline purpose-built for security Q&A", "Zero hallucinated citations", "On-prem deployment available", "SOC 2 Type II in progress"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-brand shrink-0" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Differentiation() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const fullRows = [
    {
      capability: "Citation-backed answers",
      capDesc: "Source evidence attached to every answer",
      vaultix: { text: "Every answer with source excerpt + page number", level: "full" },
      questionnaire: { text: "Partial — some tools offer template answers", level: "partial" },
      llm: { text: "No source guarantees — hallucination risk", level: "none" },
    },
    {
      capability: "Confidence-based review routing",
      capDesc: "Know which answers need human attention",
      vaultix: { text: "Auto-route low-confidence answers to review queue", level: "full" },
      questionnaire: { text: "Basic flagging — manual review workflow", level: "partial" },
      llm: { text: "No workflow controls — you figure it out", level: "none" },
    },
    {
      capability: "Reusable approved answer library",
      capDesc: "Get smarter from every completed questionnaire",
      vaultix: { text: "Learns from approved answers across all projects", level: "full" },
      questionnaire: { text: "Limited templates — not AI-personalized", level: "partial" },
      llm: { text: "Manual copy-paste — nothing is retained", level: "none" },
    },
    {
      capability: "Portal + spreadsheet workflows",
      capDesc: "Handle any format customers throw at you",
      vaultix: { text: "Single workflow for XLSX, CSV, and portal answers", level: "full" },
      questionnaire: { text: "Spreadsheet-first — portal answers are manual", level: "partial" },
      llm: { text: "Chat interface only — no file handling", level: "none" },
    },
    {
      capability: "Audit-ready change history",
      capDesc: "Full traceability for enterprise buyers",
      vaultix: { text: "Full action trail: actor, timestamp, source cited", level: "full" },
      questionnaire: { text: "Minimal logs — hard to produce for auditors", level: "partial" },
      llm: { text: "Not audit-focused — conversation history only", level: "none" },
    },
  ];

  const StatusBadge = ({ level, text }: { level: string; text: string }) => {
    if (level === "full") {
      return (
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <span className="text-sm text-light leading-snug">{text}</span>
        </div>
      );
    }
    if (level === "partial") {
      return (
        <div className="flex items-start gap-2">
          <Minus className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span className="text-sm text-light-3 leading-snug">{text}</span>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-2">
        <XCircle className="w-4 h-4 text-danger/70 shrink-0 mt-0.5" />
        <span className="text-sm text-light-4 leading-snug">{text}</span>
      </div>
    );
  };

  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-2 via-dark to-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.10]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-dark-4 border border-white/[0.08] text-light-3 text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-5">
            <BarChart3 className="w-3.5 h-3.5" />
            Competitive Comparison
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            How Vaultix stands out
            <span className="text-gradient-brand"> against every alternative</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-2xl mx-auto">
            Generic LLMs and spreadsheet tools leave gaps. Vaultix was built to close them.
          </p>
        </motion.div>

        {/* Column headers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-[1fr_1.4fr_1fr_1fr] gap-px mb-2 hidden lg:grid"
        >
          <div className="px-5 py-3" />
          <div className="px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center">
                <VaultixIcon className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-brand text-sm">Vaultix</span>
              <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded-full font-semibold">RECOMMENDED</span>
            </div>
          </div>
          <div className="px-5 py-3">
            <span className="text-sm font-semibold text-light-3">Questionnaire Tools</span>
          </div>
          <div className="px-5 py-3">
            <span className="text-sm font-semibold text-light-3">Generic LLM</span>
          </div>
        </motion.div>

        {/* Rows */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
          {fullRows.map((row, i) => (
            <motion.div
              key={row.capability}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`transition-colors duration-200 ${hoveredRow === i ? "bg-dark-4/60" : i % 2 === 0 ? "bg-dark-3/30" : "bg-dark-3/10"
                } ${i < fullRows.length - 1 ? "border-b border-white/[0.05]" : ""}`}
            >
              {/* Mobile layout */}
              <div className="lg:hidden p-5 space-y-3">
                <div>
                  <p className="font-semibold text-light text-sm">{row.capability}</p>
                  <p className="text-xs text-light-4 mt-0.5">{row.capDesc}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-brand font-semibold mb-1">
                    <VaultixIcon className="w-3 h-3" /> Vaultix
                  </div>
                  <StatusBadge level={row.vaultix.level} text={row.vaultix.text} />
                  <div className="pt-1 border-t border-white/[0.04] space-y-1.5">
                    <div className="text-xs text-light-4">Others: <StatusBadge level={row.questionnaire.level} text={row.questionnaire.text} /></div>
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden lg:grid grid-cols-[1fr_1.4fr_1fr_1fr] gap-px items-start">
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-light">{row.capability}</p>
                  <p className="text-xs text-light-4 mt-1">{row.capDesc}</p>
                </div>
                <div className={`px-5 py-5 ${hoveredRow === i ? "bg-brand/[0.04]" : ""} border-l border-brand/10 transition-colors`}>
                  <StatusBadge level={row.vaultix.level} text={row.vaultix.text} />
                </div>
                <div className="px-5 py-5 border-l border-white/[0.04]">
                  <StatusBadge level={row.questionnaire.level} text={row.questionnaire.text} />
                </div>
                <div className="px-5 py-5 border-l border-white/[0.04]">
                  <StatusBadge level={row.llm.level} text={row.llm.text} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 justify-center text-xs text-light-4"
        >
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Full support</span>
          <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-warning" /> Partial support</span>
          <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-danger/70" /> Not supported</span>
        </motion.div>
      </div>
    </section>
  );
}

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
function ResourceCenter() {
  const allCategories = ["All", "Playbook", "Guide", "Research", "Template", "Case Study"];
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = resourcePosts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p !== featured);

  const categoryColors: Record<string, string> = {
    Playbook: "bg-brand/10 text-brand border-brand/20",
    Guide: "bg-info/10 text-info border-info/20",
    Research: "bg-success/10 text-success border-success/20",
    Template: "bg-warning/10 text-warning border-warning/20",
    "Case Study": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    setSubscribeError(null);
    try {
      await subscribeNewsletter(email.trim(), "landing");
      setSubscribed(true);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setSubscribeError(
        e?.response?.data?.message || "Could not subscribe — please try again.",
      );
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section id="resources" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-[0.12]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-brand/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeUp} className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                Resource Center
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Learn what top
                <span className="text-gradient-brand"> security teams do differently</span>
              </h2>
              <p className="mt-3 text-light-2 text-lg max-w-xl">
                Playbooks, guides, and research for security teams that want to move faster without cutting corners.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-light transition-colors shrink-0 group"
            >
              View all resources
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${activeCategory === cat
                    ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                    : "bg-dark-4/60 border-white/[0.08] text-light-3 hover:border-white/[0.16] hover:text-light"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-dark-4/60 border border-white/[0.08] rounded-lg text-light placeholder:text-light-4 focus:outline-none focus:border-brand/40 transition-colors w-full sm:w-56"
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-light-4"
            >
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No resources match your search.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Featured post */}
              {featured && (
                <Link
                  href={`/resources/${featured.slug}`}
                  className="group block rounded-2xl border border-white/[0.08] bg-dark-3/50 overflow-hidden mb-5 hover:border-brand/30 transition-all duration-300"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${featured.gradient}`} />
                  <div className="p-7 sm:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[featured.category] ?? "bg-dark-5 text-light-3 border-white/10"}`}>
                          {featured.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-light-4">
                          <Clock className="w-3 h-3" />
                          {featured.readTime}
                        </span>
                        <span className="text-xs text-light-4">{featured.date}</span>
                        <span className="text-xs bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded-full font-semibold">Featured</span>
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-light group-hover:text-brand-light transition-colors leading-snug mb-3">
                        {featured.title}
                      </h3>
                      <p className="text-light-2 text-sm leading-relaxed max-w-2xl">{featured.description}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand font-medium">
                        Read article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                    <div className="hidden md:flex w-32 h-32 rounded-xl bg-gradient-to-br from-dark-4 to-dark-5 border border-white/[0.06] items-center justify-center shrink-0">
                      <BookOpen className="w-10 h-10 text-light-4 opacity-40" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Rest of posts */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((post) => (
                    <Link
                      key={post.title}
                      href={`/resources/${post.slug}`}
                      className="group rounded-2xl border border-white/[0.07] bg-dark-3/40 overflow-hidden hover:border-brand/25 hover:bg-dark-3/60 transition-all duration-300 flex flex-col"
                    >
                      <div className={`h-1 w-full bg-gradient-to-r ${post.gradient} opacity-70`} />
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColors[post.category] ?? "bg-dark-5 text-light-3 border-white/10"}`}>
                            {post.category}
                          </span>
                          <span className="text-xs text-light-4 ml-auto">{post.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-light leading-snug group-hover:text-brand-light transition-colors mb-2 flex-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-light-3 leading-relaxed line-clamp-2 mb-4">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
                          <span className="flex items-center gap-1 text-xs text-light-4">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-brand font-medium">
                            Read
                            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.07] via-dark-3/60 to-dark-3/60 p-8 sm:p-10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[200px] rounded-full bg-brand/[0.06] blur-[80px] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4.5 h-4.5 text-brand" />
                <span className="text-xs font-semibold text-brand uppercase tracking-wider">Security Digest</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-light mb-1">
                Get the security team playbook
              </h3>
              <p className="text-sm text-light-3">
                Biweekly guides on questionnaire automation, AI adoption, and closing enterprise deals faster. No spam.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 text-success font-semibold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
                You&apos;re subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col w-full sm:w-auto shrink-0">
                <div className="flex gap-2.5">
                  <input
                    type="email"
                    placeholder="Work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={subscribing}
                    className="px-4 py-2.5 text-sm bg-dark-4/80 border border-white/[0.1] rounded-xl text-light placeholder:text-light-4 focus:outline-none focus:border-brand/50 transition-colors w-full sm:w-52 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-colors shrink-0 disabled:opacity-60"
                  >
                    {subscribing ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
                {subscribeError && (
                  <p className="text-xs text-danger mt-2">{subscribeError}</p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

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
                      ? "/contact"
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
                        <div className="h-px `bg-white/[0.06]` mb-4" />
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
              href="/contact"
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
  const linkGroups = [
    {
      title: "Product",
      items: [
        { label: "Features", href: "/#features" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Changelog", href: "/changelog" },
        { label: "API Docs", href: "/docs/api" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "DPA", href: "/dpa" },
        { label: "Security", href: "/security" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "System Status", href: "/status" },
        { label: "Email Support", href: "mailto:hello@vaultix.app" },
        { label: "Sales", href: "mailto:sales@vaultix.app" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-overlay/[0.06] bg-dark-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
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
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading text-sm font-semibold mb-4 text-light">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-light-3 hover:text-light transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
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
            <Link
              href="/status"
              className="inline-flex items-center gap-1.5 text-xs text-light-4 hover:text-light-3 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
