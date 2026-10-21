"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Sparkles, Shield, Zap, CheckCircle2, Maximize2 } from "lucide-react";

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-dark-2/60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] rounded-full bg-brand/[0.07] blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Live Motion Showcase
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            See your compliance engine
            <span className="text-gradient-brand"> in continuous motion</span>
          </h2>
          <p className="mt-4 text-light-2 text-base sm:text-lg max-w-2xl mx-auto">
            From SOC 2 policies to live CISO approvals, watch how Vaultix orchestrates
            12 knowledge layers into flawless, audit-ready questionnaire responses.
          </p>
        </motion.div>

        {/* Video Player Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-3xl border border-white/[0.12] bg-dark-3/70 backdrop-blur-2xl p-3 sm:p-5 shadow-[0_20px_70px_-15px_rgba(249,115,22,0.15)] group"
        >
          {/* Top chrome / status header */}
          <div className="flex items-center justify-between px-3 py-2.5 mb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
              </span>
              <span className="text-xs font-mono font-semibold tracking-wider text-light-2 uppercase">
                Vaultix Ticker Tilt &bull; 12 Knowledge Slots
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg border border-white/10 bg-white/[0.04] text-light-2 hover:text-white hover:bg-white/[0.08] hover:border-brand/40 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-brand" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-brand" />
                    <span className="hidden sm:inline">Play</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                className="p-1.5 text-xs rounded-lg border border-white/10 bg-white/[0.04] text-light-3 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/[0.06] shadow-2xl">
            <video
              ref={videoRef}
              src="/animo-ticker-tilt-720p.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover rounded-2xl cursor-pointer"
              onClick={togglePlay}
            />

            {/* Play overlay indicator if paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Feature Highlights beneath video */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Zap className="w-4 h-4 text-brand shrink-0" />
              <span className="text-xs text-light-2 font-medium">
                10x faster review cycles
              </span>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-light-2 font-medium">
                SOC 2 &amp; ISO 27001 verified
              </span>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs text-light-2 font-medium">
                100% citation traceability
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
