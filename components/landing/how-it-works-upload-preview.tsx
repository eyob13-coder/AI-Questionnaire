"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Check } from "lucide-react";

export function UploadPreview() {
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
