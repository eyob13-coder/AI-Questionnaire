"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "./landing-animations";

export function Stats() {
  const stats = [
    { value: "10x", label: "Faster completion" },
    { value: "87%", label: "Answers accepted" },
    { value: "120+", label: "Companies trust us" },
    { value: "50K+", label: "Questions answered" },
  ];

  return (
    <section className="relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          {...staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              {...staggerItem}
              className="text-center p-6 rounded-2xl bg-dark-2/40 border border-overlay/[0.04]"
            >
              <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-brand mb-2">
                {s.value}
              </div>
              <div className="text-sm text-light-3">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
