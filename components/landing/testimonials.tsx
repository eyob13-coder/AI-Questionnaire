"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import { fadeUp } from "./landing-animations";
import {
  Testimonial,
  testimonialsCol1,
  testimonialsCol2,
  testimonialsCol3,
} from "./testimonials-data";

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="group relative rounded-2xl bg-dark-2/70 border border-white/[0.07] p-6 hover:border-brand/30 hover:bg-dark-3/80 transition-all duration-300 shadow-lg shadow-black/20 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {/* Rating stars */}
        <div className="flex gap-1">
          {Array.from({ length: item.rating }).map((_, si) => (
            <Star key={si} className="w-3.5 h-3.5 text-brand fill-brand" />
          ))}
        </div>

        {item.highlight && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand">
            <ShieldCheck className="w-3 h-3 text-brand" />
            {item.highlight}
          </span>
        )}
      </div>

      {/* Quote */}
      <blockquote className="text-light text-xs sm:text-sm leading-relaxed flex-1 mb-5">
        &ldquo;{item.quote}&rdquo;
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/25 flex items-center justify-center text-xs font-bold text-brand shrink-0">
          {item.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-light truncate">{item.name}</p>
          <p className="text-[11px] text-light-3 truncate">
            {item.title} · {item.company}
          </p>
        </div>
        <span className="text-[10px] text-light-4 font-mono hidden sm:block shrink-0">
          {item.stage.split("·")[0]}
        </span>
      </div>
    </div>
  );
}

function MarqueeColumn({
  items,
  direction,
}: {
  items: Testimonial[];
  direction: "up" | "down";
}) {
  const animationClass =
    direction === "up"
      ? "animate-marquee-vertical-up"
      : "animate-marquee-vertical-down";

  // Duplicate items for continuous seamless loop
  const duplicated = [...items, ...items];

  return (
    <div className="relative overflow-hidden h-[580px] group-pause">
      <div className={`flex flex-col gap-5 ${animationClass}`}>
        {duplicated.map((item, index) => (
          <TestimonialCard key={`${item.name}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-brand/[0.04] blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-block text-brand text-xs font-semibold tracking-wider uppercase mb-3 px-3 py-1 rounded-full bg-brand/10 border border-brand/20">
            Customer Stories
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Loved by security teams
            <span className="text-gradient-brand"> worldwide</span>
          </h2>
          <p className="mt-3 text-light-2 text-sm sm:text-base max-w-xl mx-auto">
            See how high-growth security, compliance, and sales engineering teams
            automate questionnaires with confidence.
          </p>
        </motion.div>

        {/* 90-Degree Moving Columns in Opposite Directions */}
        <div className="relative group-pause">
          {/* Top & Bottom Fade Masks for seamless vanishing & appearing */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-dark via-dark/80 to-transparent z-10 [data-theme='light']:from-[#F7F5F0] [data-theme='light']:via-[#F7F5F0]/80" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-dark via-dark/80 to-transparent z-10 [data-theme='light']:from-[#F7F5F0] [data-theme='light']:via-[#F7F5F0]/80" />

          {/* Grid of 90-degree opposite direction marquees */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1: Moves UP (90 degrees) */}
            <MarqueeColumn items={testimonialsCol1} direction="up" />

            {/* Column 2: Moves DOWN (90 degrees, opposite direction) */}
            <MarqueeColumn items={testimonialsCol2} direction="down" />

            {/* Column 3: Moves UP (90 degrees) */}
            <div className="hidden lg:block">
              <MarqueeColumn items={testimonialsCol3} direction="up" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
