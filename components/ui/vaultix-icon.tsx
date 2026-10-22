import React from "react";

export function VaultixIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="vxi-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1c1308" />
          <stop offset="55%" stopColor="#0d0d10" />
          <stop offset="100%" stopColor="#08080a" />
        </linearGradient>
        <linearGradient id="vxi-orange" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#b8460a" />
        </linearGradient>
        <linearGradient id="vxi-sheen" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="vxi-glow" cx="32" cy="46" r="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="1" y="1" width="62" height="62" rx="15" fill="url(#vxi-bg)" />
      <rect x="1" y="1" width="62" height="62" rx="15" fill="url(#vxi-glow)" />
      <rect x="1" y="1" width="62" height="62" rx="15" fill="url(#vxi-sheen)" />
      <rect x="1.25" y="1.25" width="61.5" height="61.5" rx="14.75" fill="none" stroke="#f97316" strokeOpacity="0.32" strokeWidth="0.75" />

      <rect x="22" y="11" width="20" height="3.2" rx="1.6" fill="url(#vxi-orange)" opacity="0.9" />
      <circle cx="22" cy="12.6" r="1.4" fill="#fdba74" />
      <circle cx="42" cy="12.6" r="1.4" fill="#fdba74" />

      <path
        d="M14.5 19 L31.2 49.5 Q32 51 32.8 49.5 L49.5 19"
        stroke="url(#vxi-orange)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <path
        d="M16.5 19.6 L24 19.6"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <circle cx="32" cy="50" r="5.5" fill="#08080a" />
      <circle cx="32" cy="50" r="3.6" fill="url(#vxi-orange)" />
      <circle cx="32" cy="50" r="1.2" fill="#ffffff" />
    </svg>
  );
}

export default VaultixIcon;
