"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./landing-animations";
import { features } from "./landing-data";

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background variation */}
      <div className="absolute inset-0 bg-dark-2" />
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block text-brand text-sm font-semibold tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need to
            <br className="hidden sm:block" />
            <span className="text-gradient-brand"> ace security reviews</span>
          </h2>
          <p className="mt-4 text-light-2 text-lg max-w-2xl mx-auto">
            From upload to export, Vaultix handles the heavy lifting while you
            stay in control.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-glow group rounded-2xl bg-dark-3/50 border border-overlay/[0.06] p-6 hover:border-brand/20 hover:bg-dark-3/80 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/15 transition-colors">
                <f.icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2 text-light dark:group-hover:text-white transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-light-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
