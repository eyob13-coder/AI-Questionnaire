"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Brain, FileCheck } from "lucide-react";
import { fadeUp } from "./landing-animations";
import { UploadPreview } from "./how-it-works-upload-preview";
import { AiPreview } from "./how-it-works-ai-preview";
import { ReviewPreview } from "./how-it-works-review-preview";
import { HowItWorksStepDetail } from "./how-it-works-step-detail";

export function HowItWorks() {
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
                  className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 text-left transition-all duration-300 border-r border-white/[0.06] last:border-r-0 cursor-pointer ${
                    isActive ? "bg-brand/[0.05]" : "hover:bg-white/[0.02]"
                  }`}
                >
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-brand/20 shadow-[0_0_16px_rgba(249,115,22,0.25)]"
                          : "bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors duration-300 ${
                          isActive ? "text-brand" : "text-light-3"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-[10px] font-mono font-bold tracking-widest mb-0.5 transition-colors ${
                        isActive ? "text-brand" : "text-light-4"
                      }`}
                    >
                      STEP {s.num}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-semibold leading-tight transition-colors ${
                        isActive ? "text-light dark:text-white" : "text-light-2"
                      }`}
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
            {/* Left: Step details */}
            <HowItWorksStepDetail
              activeStep={activeStep}
              step={stepDefs[activeStep]}
              stepCount={stepDefs.length}
              paused={paused}
              onSelectStep={(i) => {
                setActiveStep(i);
                setPaused(true);
              }}
              onTogglePause={() => setPaused((p) => !p)}
            />

            {/* Right: animated preview */}
            <div className="relative bg-dark-3/30 min-h-[300px]">
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
