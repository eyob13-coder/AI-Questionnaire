"use client";

import React from "react";

interface Company {
  name: string;
  tag: string;
  icon: React.ReactNode;
}

const companies: Company[] = [
  {
    name: "CloudKin",
    tag: "Enterprise Cloud",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "VaultStack",
    tag: "FinTech Vault",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    name: "TrustLayer",
    tag: "Zero Trust",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    name: "ComplianceHQ",
    tag: "SOC 2 & ISO",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "DataForge",
    tag: "AI Pipelines",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    name: "Sentinels",
    tag: "SecOps & GRC",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    name: "Acuity Risk",
    tag: "vCISO Agency",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="3.6" y1="9" x2="20.4" y2="9" />
        <line x1="3.6" y1="15" x2="20.4" y2="15" />
        <path d="M11.5 3a17 17 0 0 0 0 18" />
        <path d="M12.5 3a17 17 0 0 1 0 18" />
      </svg>
    ),
  },
  {
    name: "HyperScale",
    tag: "DevOps Infra",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

export function TrustedBy() {
  return (
    <section className="relative py-14 overflow-hidden bg-transparent">
      {/* Ambient soft glow background without harsh borders */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(249, 115, 22, 0.08), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle pill label with live pulse indicator */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <p className="text-center text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-light-3/90 font-medium">
            Trusted by fast-moving security &amp; compliance teams
          </p>
        </div>

        {/* Infinite auto-scrolling marquee with smooth gradient mask edges */}
        <div
          className="group relative overflow-hidden py-3"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="flex w-fit gap-4 sm:gap-6 items-center animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
            {[...companies, ...companies].map((c, idx) => (
              <div
                key={`${c.name}-${idx}`}
                className="flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md transition-all duration-300 text-light-3 hover:text-light group/logo cursor-default hover:scale-105"
              >
                <span className="text-light-3/70 group-hover/logo:text-brand transition-colors duration-300">
                  {c.icon}
                </span>
                <span className="font-heading text-sm sm:text-base font-semibold tracking-tight whitespace-nowrap">
                  {c.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider uppercase text-light-4/70 px-1.5 py-0.5 rounded bg-white/[0.04]">
                  {c.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee-scroll 34s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
