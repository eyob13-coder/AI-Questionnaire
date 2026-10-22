"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Activity,
  FileCheck,
} from "lucide-react";
import { fadeUp } from "./landing-animations";

export function AccuracyProof() {
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
                <div
                  className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${
                    stat.color === "brand"
                      ? "bg-brand"
                      : stat.color === "info"
                      ? "bg-info"
                      : stat.color === "success"
                      ? "bg-success"
                      : "bg-warning"
                  }`}
                />
                <div
                  className={`absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent ${
                    stat.color === "brand"
                      ? "via-brand/60"
                      : stat.color === "info"
                      ? "via-info/60"
                      : stat.color === "success"
                      ? "via-success/60"
                      : "via-warning/60"
                  } to-transparent`}
                />
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 mb-3 ${
                      stat.color === "brand"
                        ? "text-brand"
                        : stat.color === "info"
                        ? "text-info"
                        : stat.color === "success"
                        ? "text-success"
                        : "text-warning"
                    }`}
                  />
                  <p
                    className={`font-heading text-3xl sm:text-4xl font-bold mb-1 ${
                      stat.color === "brand"
                        ? "text-brand"
                        : stat.color === "info"
                        ? "text-info"
                        : stat.color === "success"
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {stat.value}
                  </p>
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
                        className={`h-full rounded-full ${
                          item.conf >= 85
                            ? "bg-success"
                            : item.conf >= 60
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        style={{ width: `${item.conf}%` }}
                      />
                    </div>
                    <span className="text-xs text-light-4 w-7">{item.conf}%</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      item.status === "Approved"
                        ? "bg-success/10 text-success border border-success/20"
                        : item.status === "In Review"
                        ? "bg-info/10 text-info border border-info/20"
                        : "bg-danger/10 text-danger border border-danger/20"
                    }`}
                  >
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
