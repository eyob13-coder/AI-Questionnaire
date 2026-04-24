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
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-brand/25 blur-2xl rounded-full animate-pulse" />

      <motion.svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_10px_rgba(249,115,22,0.85)]"
        initial="hidden"
        animate="visible"
      >
        {/* Vault hinge bar */}
        <motion.rect
          x="6"
          y="3.4"
          width="8"
          height="1.4"
          rx="0.7"
          fill="#f97316"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0] }}
          style={{ transformOrigin: "10px 4.1px" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1],
          }}
        />

        {/* The animated V */}
        <motion.path
          d="M3.6 6.2 L9.5 16.4 Q10 17.2 10.5 16.4 L16.4 6.2"
          stroke="#f97316"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={draw}
        />

        {/* Apex spark */}
        <motion.circle
          cx="10"
          cy="16.6"
          r="1.7"
          fill="#f97316"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1],
          }}
        />
      </motion.svg>
    </div>
  );
}
