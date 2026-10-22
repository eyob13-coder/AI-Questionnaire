"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface StepItem {
  num: string;
  title: string;
  desc: string;
}

interface HowItWorksStepDetailProps {
  activeStep: number;
  step: StepItem;
  stepCount: number;
  paused: boolean;
  onSelectStep: (i: number) => void;
  onTogglePause: () => void;
}

export function HowItWorksStepDetail({
  activeStep,
  step,
  stepCount,
  paused,
  onSelectStep,
  onTogglePause,
}: HowItWorksStepDetailProps) {
  const bullets =
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
        ];

  return (
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
          <div className="font-mono text-7xl font-black text-white/[0.04] leading-none select-none">
            {step.num}
          </div>

          <div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
              {step.title}
            </h3>
            <p className="text-light-2 leading-relaxed">{step.desc}</p>
          </div>

          {/* Step bullets */}
          <div className="space-y-2">
            {bullets.map((bullet, bi) => (
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

          {/* Navigation dots & controls */}
          <div className="flex items-center gap-2 pt-2">
            {Array.from({ length: stepCount }).map((_, di) => (
              <button
                key={di}
                onClick={() => onSelectStep(di)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  di === activeStep
                    ? "w-6 bg-brand"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
            <button
              onClick={onTogglePause}
              className="ml-auto text-[10px] text-light-4 hover:text-light-3 transition-colors font-mono cursor-pointer"
            >
              {paused ? "▶ play" : "⏸ pause"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
