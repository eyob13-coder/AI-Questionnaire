"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  Shield, Zap, Brain, FileCheck, Clock, Lock,
  ArrowRight, Check, Upload, Search, Download,
  Menu, X, Sparkles, ChevronRight, Play,
  BarChart3, Users, Eye,
} from "lucide-react";

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
  { icon: Brain, title: "AI-Powered Answers", desc: "Generate accurate, contextual answers from your company knowledge base using advanced RAG pipeline." },
  { icon: BarChart3, title: "Confidence Scoring", desc: "Color-coded confidence scores (0-100%) so you instantly know which answers need human review." },
  { icon: FileCheck, title: "Smart Citations", desc: "Every answer backed by source documents with page numbers. Full traceability for auditors." },
  { icon: Zap, title: "Lightning Fast", desc: "Process 300+ questions in minutes, not days. 10x faster than manual copy-paste workflows." },
  { icon: Users, title: "Team Collaboration", desc: "Role-based access with Owner, Editor, and Viewer roles. Review, edit, and approve together." },
  { icon: Lock, title: "Enterprise Security", desc: "SOC 2 ready. AES-256 encryption, audit trails, tenant isolation, and data retention controls." },
];

const steps = [
  { num: "01", icon: Upload, title: "Upload Questionnaire", desc: "Drop your .xlsx or .csv security questionnaire. We auto-detect question columns and preserve formatting." },
  { num: "02", icon: Brain, title: "AI Generates Answers", desc: "Our RAG pipeline searches your knowledge base, generates answers with citations and confidence scores." },
  { num: "03", icon: Download, title: "Review & Export", desc: "Review AI answers, edit inline, approve in bulk, and export the completed file in original format." },
];

const plans = [
  {
    name: "Starter",
    price: "$49",
    desc: "For small teams getting started",
    features: ["5 questionnaires/month", "500 questions/month", "10 knowledge docs", "1 workspace member", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    desc: "For growing security teams",
    features: ["Unlimited questionnaires", "5,000 questions/month", "100 knowledge docs", "10 workspace members", "Priority support", "Custom AI tone", "API access"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
    features: ["Everything in Pro", "Unlimited everything", "SSO / SAML", "Dedicated support", "Custom retention", "SLA guarantee", "SCIM provisioning"],
    cta: "Contact Sales",
    popular: false,
  },
];

const mockRows = [
  { q: "Do you encrypt all data at rest?", a: "Yes. All data at rest is encrypted using AES-256 encryption via AWS KMS with automatic key rotation...", conf: 96, status: "Approved" },
  { q: "Describe your incident response process", a: "Our IR follows a structured 4-phase approach based on NIST SP 800-61: Preparation, Detection...", conf: 82, status: "Review" },
  { q: "What is your business continuity plan?", a: "Our BCP includes redundant systems across multiple availability zones with automatic failover...", conf: 91, status: "Approved" },
  { q: "How do you handle data subject requests?", a: "Insufficient information in knowledge base to fully answer this question.", conf: 28, status: "Draft" },
  { q: "Do you perform penetration testing?", a: "Yes. We engage third-party security firms for annual penetration testing covering OWASP Top 10...", conf: 88, status: "Approved" },
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
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              Shield<span className="text-brand">AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
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
            <a href="#features" onClick={() => setOpen(false)} className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all">Features</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all">How It Works</a>
            <a href="#pricing" onClick={() => setOpen(false)} className="px-3 py-2 text-light-2 hover:text-light rounded-lg hover:bg-white/[0.04] transition-all">Pricing</a>
            <hr className="border-overlay/[0.06]" />
            <Link href="/login" className="px-3 py-2 text-light-2 hover:text-light transition-colors">Sign In</Link>
            <Link href="/register" className="mt-1 bg-brand text-white font-semibold px-5 py-3 rounded-full text-center text-sm">Start Free Trial</Link>
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
            <br className="hidden sm:block" />
            {" "}Questionnaires{" "}
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

          {/* Trust text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm text-light-3"
          >
            No credit card required · 14-day free trial · SOC 2 compliant
          </motion.p>
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
  return (
    <div className="relative rounded-2xl  border-overlay/[0.08] bg-dark-2/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-dark-3/50 border-overlay/[0.06]">
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
      <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5  border-overlay/[0.06] text-xs overflow-x-auto">
        <span className="text-brand font-semibold bg-brand/10 px-3 py-1 rounded-full whitespace-nowrap">All (50)</span>
        <span className="text-light-3 hover:text-light-2 cursor-pointer px-3 py-1 rounded-full hover:bg-white/[0.04] transition whitespace-nowrap">Draft (3)</span>
        <span className="text-light-3 hover:text-light-2 cursor-pointer px-3 py-1 rounded-full hover:bg-white/[0.04] transition whitespace-nowrap">Review (5)</span>
        <span className="text-light-3 hover:text-light-2 cursor-pointer px-3 py-1 rounded-full hover:bg-white/[0.04] transition whitespace-nowrap">Approved (42)</span>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[40px_1fr_1fr_80px_90px] gap-3 px-5 py-2 text-xs text-light-3  border-overlay/[0.06] font-semibold uppercase tracking-wider">
        <span>#</span>
        <span>Question</span>
        <span>AI Answer</span>
        <span>Score</span>
        <span>Status</span>
      </div>

      {/* Table rows */}
      {mockRows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-1 sm:grid-cols-[40px_1fr_1fr_80px_90px] gap-1 sm:gap-3 px-4 sm:px-5 py-3 text-sm  border-overlay/[0.04] hover:bg-white/[0.02] transition-colors"
        >
          <span className="hidden sm:block text-light-3 font-mono text-xs leading-5">{i + 1}</span>
          <span className="text-light truncate text-xs sm:text-sm">{row.q}</span>
          <span className="text-light-2 truncate text-xs">{row.a}</span>
          <span
            className={`font-mono text-xs font-semibold ${row.conf >= 80
              ? "text-success"
              : row.conf >= 50
                ? "text-warning"
                : "text-danger"
              }`}
          >
            {row.conf}%
          </span>
          <span>
            <span
              className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${row.status === "Approved"
                ? "bg-success/10 text-success"
                : row.status === "Review"
                  ? "bg-warning/10 text-warning"
                  : "bg-light-4/10 text-light-3"
                }`}
            >
              {row.status}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════ TRUSTED BY ═══════ */
function TrustedBy() {
  const companies = ["CloudKin", "VaultStack", "TrustLayer", "ComplianceHQ", "DataForge", "SecureOps"];
  return (
    <section className="relative py-16 border-t border-overlay/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-light-3 mb-8 font-medium">
          Trusted by security teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span key={name} className="text-light-4 text-lg font-heading font-semibold hover:text-light-2 transition-colors duration-300 cursor-default">
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
            From upload to export, ShieldAI handles the heavy lifting while you stay in control.
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
              <p className="text-sm text-light-2 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════ HOW IT WORKS ═══════ */
function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center md:text-left"
            >
              {/* Connecting line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-brand/30 to-transparent" />
              )}

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/15 to-brand/5 border border-brand/20 mb-5">
                <s.icon className="w-7 h-7 text-brand" />
              </div>

              <div className="font-mono text-brand/50 text-xs font-bold tracking-widest mb-2">
                STEP {s.num}
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-light-2 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
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
            Simple,{" "}
            <span className="text-gradient-brand">transparent</span> pricing
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
                <h3 className="font-heading text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-light-3">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="font-heading text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-light-3 text-sm ml-1">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-light-2">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.popular ? "/register" : plan.price === "Custom" ? "#contact" : "/register"}
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

/* ═══════ CTA ═══════ */
function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-2 to-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand/[0.08] blur-[120px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to{" "}
            <span className="text-gradient-brand">10x</span> your
            <br className="hidden sm:block" /> questionnaire workflow?
          </h2>
          <p className="text-light-2 text-lg mb-10 max-w-xl mx-auto">
            Join 120+ security teams already using ShieldAI to close deals
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
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-lg font-bold">
                Shield<span className="text-brand">AI</span>
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
            © 2026 ShieldAI. All rights reserved.
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
