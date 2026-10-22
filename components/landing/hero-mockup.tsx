"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mockRows } from "./landing-data";

export function TypewriterText({ text, isHovered }: { text: string; isHovered: boolean }) {
  const [displayedText, setDisplayedText] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return (
    <span className="relative">
      {displayedText}
      {isHovered && displayedText.length < text.length && (
        <span className="inline-block w-1 h-2.5 ml-0.5 bg-brand animate-pulse align-middle" />
      )}
    </span>
  );
}

export function ProductMockup() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const confColor = (c: number) =>
    c >= 80 ? "text-success" : c >= 50 ? "text-warning" : "text-danger";

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
            <motion.div
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              animate={{ opacity: isDimmed ? 0.35 : 1 }}
              transition={{ duration: 0.2 }}
              className={`relative grid grid-cols-1 sm:grid-cols-[40px_1fr_1fr_80px_90px] gap-1 sm:gap-3 px-4 sm:px-5 py-3.5 cursor-pointer transition-colors duration-200 ${
                isHovered ? "bg-brand/[0.035]" : ""
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
                className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  isHovered ? "text-light dark:text-white" : "text-light"
                }`}
              >
                {row.q}
              </span>

              <span className="text-light-2 truncate text-xs leading-relaxed pt-0.5">
                <TypewriterText text={row.a} isHovered={isHovered} />
              </span>

              <span className={`font-mono text-xs font-bold ${confColor(row.conf)}`}>
                {row.conf}%
              </span>

              <span>
                <motion.span
                  animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                  className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium transition-all ${
                    row.status === "Approved"
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
          </div>
        );
      })}
    </div>
  );
}
