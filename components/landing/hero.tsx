"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  Play,
  Lock,
  Clock,
  FileCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ProductMockup } from "./hero-mockup";

export function Hero() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-brand/[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-brand/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={false}
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
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
          >
            Complete Security
            <br className="hidden sm:block" /> Questionnaires{" "}
            <span className="text-gradient-brand">10x Faster</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-light-2 max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered answers with citations, confidence scores, and full audit
            trails. Upload your questionnaire and get draft answers in minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {mounted && session ? (
              <Link
                href="/dashboard"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-brand hover:bg-brand-hover rounded-full transition-all duration-200 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            <a
              href="#how-it-works"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-light border border-white/10 hover:border-white/20 rounded-full hover:bg-white/[0.04] transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {[
              { icon: Lock, label: "No credit card required" },
              { icon: Clock, label: "14-day free trial" },
              { icon: FileCheck, label: "SOC 2 compliant" },
            ].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-sm text-light-3"
              >
                <item.icon className="w-3.5 h-3.5 text-brand/70 shrink-0" />
                {item.label}
                {i < 2 && (
                  <span className="hidden sm:inline ml-5 w-px h-3.5 bg-white/10 rounded-full" />
                )}
              </span>
            ))}
          </motion.div>
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
