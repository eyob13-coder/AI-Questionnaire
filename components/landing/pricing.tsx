"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp } from "./landing-animations";
import { plans } from "./landing-data";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple, <span className="text-gradient-brand">transparent</span>{" "}
            pricing
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col ${
                plan.popular
                  ? "bg-dark-3 border-2 border-brand glow-brand scale-[1.02]"
                  : "bg-dark-3/50 border border-overlay/[0.06] hover:border-overlay/[0.12]"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-lg font-bold mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-light-3">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="font-heading text-4xl font-bold">
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-light-3 text-sm ml-1">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-light-2"
                  >
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={
                  plan.popular
                    ? "/register"
                    : plan.price === "Custom"
                    ? "/contact"
                    : "/register"
                }
                className={`w-full inline-flex items-center justify-center py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-brand hover:bg-brand-hover text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-light border border-overlay/[0.06]"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
