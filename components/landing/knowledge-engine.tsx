"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Database,
  Cpu,
  FileCheck,
  Check,
} from "lucide-react";
import { fadeUp } from "./landing-animations";

export function KnowledgeEngine() {
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
            <div
              className="absolute left-[55%] top-[-3px] w-1.5 h-1.5 rounded-full bg-brand animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
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
                className={`relative group cursor-default transition-all duration-300 ${
                  i === 0
                    ? "rounded-l-2xl md:rounded-r-none rounded-2xl md:rounded-2xl"
                    : i === 2
                    ? "rounded-r-2xl md:rounded-l-none rounded-2xl md:rounded-2xl"
                    : "rounded-2xl md:rounded-none"
                } border ${col.borderColor} ${
                  isHovered ? col.glowColor : "bg-dark-2/60"
                } p-7 overflow-hidden`}
              >
                {/* Top accent line */}
                <div
                  className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent ${
                    col.accentColor === "info"
                      ? "via-info"
                      : col.accentColor === "brand"
                      ? "via-brand"
                      : "via-success"
                  } to-transparent opacity-${isHovered ? "100" : "40"} transition-opacity`}
                />

                {/* Stage badge */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      col.accentColor === "info"
                        ? "bg-info/10 text-info"
                        : col.accentColor === "brand"
                        ? "bg-brand/10 text-brand"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    Stage {col.stage}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${col.iconBg}`}
                  >
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
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                            col.accentColor === "info"
                              ? "bg-info"
                              : col.accentColor === "brand"
                              ? "bg-brand"
                              : "bg-success"
                          }`}
                        />
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
          {[
            "RAG pipeline purpose-built for security Q&A",
            "Zero hallucinated citations",
            "On-prem deployment available",
            "SOC 2 Type II in progress",
          ].map((t) => (
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
