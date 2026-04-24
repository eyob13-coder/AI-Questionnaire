"use client";

import { motion } from "framer-motion";

export function VaultixLoader({ className = "w-12 h-12" }: { className?: string }) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          type: "tween",
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
        opacity: { duration: 0.2 },
      },
    },
  } as const;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse" />

      <motion.svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
        initial="hidden"
        animate="visible"
      >
        {/* Outer ring */}
        <motion.circle
          cx="10" cy="10" r="6.5"
          stroke="#f97316" // brand color
          strokeWidth="1.4"
          opacity="0.65"
          variants={draw}
        />
        {/* Cross lines forming the V / X structure */}
        <motion.line
          x1="10" y1="3.5" x2="10" y2="16.5"
          stroke="#f97316"
          strokeWidth="1.4"
          strokeLinecap="round"
          variants={draw}
        />
        <motion.line
          x1="3.5" y1="10" x2="16.5" y2="10"
          stroke="#f97316"
          strokeWidth="1.4"
          strokeLinecap="round"
          variants={draw}
        />
        <motion.line
          x1="5.4" y1="5.4" x2="14.6" y2="14.6"
          stroke="#f97316"
          strokeWidth="1.4"
          strokeLinecap="round"
          variants={draw}
        />
        <motion.line
          x1="14.6" y1="5.4" x2="5.4" y2="14.6"
          stroke="#f97316"
          strokeWidth="1.4"
          strokeLinecap="round"
          variants={draw}
        />
        {/* Inner solid core */}
        <motion.circle
          cx="10" cy="10" r="2.5"
          fill="#f97316"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3, // double the line duration for one full reverse loop
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1],
          }}
        />
      </motion.svg>
    </div>
  );
}
