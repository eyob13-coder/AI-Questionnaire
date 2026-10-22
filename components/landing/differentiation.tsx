"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Minus, XCircle } from "lucide-react";
import { fadeUp } from "./landing-animations";

export function Differentiation() {
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
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image src="/logo.svg" alt="Vaultix" fill className="object-contain" priority />
              </div>
              <span className="font-heading font-bold text-brand text-sm">Vaultix</span>
              <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded-full font-semibold">
                RECOMMENDED
              </span>
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
              className={`transition-colors duration-200 ${
                hoveredRow === i
                  ? "bg-dark-4/60"
                  : i % 2 === 0
                  ? "bg-dark-3/30"
                  : "bg-dark-3/10"
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
                    <div className="relative w-4 h-4 flex-shrink-0">
                      <Image src="/logo.svg" alt="Vaultix" fill className="object-contain" />
                    </div>
                    Vaultix
                  </div>
                  <StatusBadge level={row.vaultix.level} text={row.vaultix.text} />
                  <div className="pt-1 border-t border-white/[0.04] space-y-1.5">
                    <div className="text-xs text-light-4">
                      Others:{" "}
                      <StatusBadge
                        level={row.questionnaire.level}
                        text={row.questionnaire.text}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden lg:grid grid-cols-[1fr_1.4fr_1fr_1fr] gap-px items-start">
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-light">{row.capability}</p>
                  <p className="text-xs text-light-4 mt-1">{row.capDesc}</p>
                </div>
                <div
                  className={`px-5 py-5 ${
                    hoveredRow === i ? "bg-brand/[0.04]" : ""
                  } border-l border-brand/10 transition-colors`}
                >
                  <StatusBadge level={row.vaultix.level} text={row.vaultix.text} />
                </div>
                <div className="px-5 py-5 border-l border-white/[0.04]">
                  <StatusBadge
                    level={row.questionnaire.level}
                    text={row.questionnaire.text}
                  />
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
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Full support
          </span>
          <span className="flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-warning" /> Partial support
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-danger/70" /> Not supported
          </span>
        </motion.div>
      </div>
    </section>
  );
}
