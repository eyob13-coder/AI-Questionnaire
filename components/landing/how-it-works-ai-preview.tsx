"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function AiPreview() {
  const qItems = [
    { q: "Do you encrypt data at rest?", conf: 97 },
    { q: "Is MFA enforced for all users?", conf: 89 },
    { q: "Describe your incident response plan.", conf: 74 },
    { q: "What is your data retention policy?", conf: 91 },
  ];
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setVisible(0);
    setTyping(true);
    const timers: ReturnType<typeof setTimeout>[] = [];
    qItems.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), 400 + i * 700));
    });
    timers.push(setTimeout(() => setTyping(false), 400 + qItems.length * 700));
    return () => timers.forEach(clearTimeout);
  }, []);

  const barColor = (c: number) =>
    c >= 80
      ? "from-success to-emerald-400"
      : c >= 60
      ? "from-warning to-amber-400"
      : "from-danger to-red-400";

  return (
    <div className="flex flex-col h-full px-4 py-3 gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 rounded-full bg-brand shadow-[0_0_6px_rgba(249,115,22,0.8)]"
        />
        <span className="text-xs text-brand font-mono font-semibold">
          Vaultix AI · RAG Pipeline running
        </span>
        {typing && (
          <span className="ml-auto flex gap-0.5">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="w-1 h-1 rounded-full bg-brand/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Question rows appearing */}
      <div className="flex flex-col gap-2 flex-1">
        {qItems.slice(0, visible).map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-xl bg-dark-3/60 border border-white/[0.06] p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-light-2 leading-snug flex-1">
                {item.q}
              </span>
              <span
                className={`text-[10px] font-mono font-bold shrink-0 ${
                  item.conf >= 80
                    ? "text-success"
                    : item.conf >= 60
                    ? "text-warning"
                    : "text-danger"
                }`}
              >
                {item.conf}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-dark-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.conf}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                className={`h-full rounded-full bg-gradient-to-r ${barColor(item.conf)}`}
              />
            </div>
          </motion.div>
        ))}
        {typing && visible < qItems.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-dark-3/40 border border-white/[0.04] p-3 flex items-center gap-2"
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-brand/40"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: d * 0.15,
                  }}
                />
              ))}
            </span>
            <span className="text-xs text-light-4">Generating answer…</span>
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-1 pt-2 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-[10px] text-light-4 font-mono">
          {visible}/{qItems.length} processed
        </span>
        <div className="w-24 h-1 rounded-full bg-dark-5 overflow-hidden">
          <motion.div
            animate={{ width: `${(visible / qItems.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-brand to-amber-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
