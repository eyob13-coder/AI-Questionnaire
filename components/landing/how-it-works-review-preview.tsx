"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";

export function ReviewPreview() {
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
        setTimeout(() => setApproved((o) => o + 1), 400 + order * 500)
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
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
            approved >= 4 ? "bg-brand text-dark" : "bg-white/[0.06] text-light-3"
          }`}
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
                className={`text-[10px] font-mono ${
                  row.conf >= 80 ? "text-success" : "text-warning"
                }`}
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
