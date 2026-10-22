"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "./landing-animations";

export function FAQ() {
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
      q: "Can I pay for a single questionnaire without an ongoing subscription?",
      a: "Yes. Our Pay-Per-Questionnaire pass ($59 one-time) unlocks a complete questionnaire up to 300 questions with zero recurring monthly charges or subscription commitments.",
    },
    {
      q: "Will my original spreadsheet formatting and formulas stay intact?",
      a: "Yes. Vaultix uses Round-Trip cell injection. We never rewrite your sheet from scratch: formulas, dropdown validations, fonts, tabs, and styles remain 100% untouched.",
    },
    {
      q: "How does the Live Technical Sync work?",
      a: "Pro and vCISO tiers connect read-only GitHub or Azure DevOps repositories to verify technical security claims (e.g. encryption at rest, branch protections) with cryptographic evidence citations.",
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
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-brand/30 bg-dark-3/60"
                    : "border-white/[0.06] bg-dark-3/30 hover:border-white/[0.1]"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isOpen ? "text-light dark:text-white" : "text-light"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                      isOpen
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
                        <div className="h-px bg-white/10 mb-4" />
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
