"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface VaultixLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

export function VaultixLogo({
  size = "md",
  showText = true,
  className = "",
  href = "/",
  priority = true,
}: VaultixLogoProps) {
  const iconDimensions =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-10 h-10" : "w-9 h-9";
  const textClass =
    size === "sm" ? "text-lg" : size === "lg" ? "text-xl sm:text-2xl" : "text-xl";

  const content = (
    <div className={`flex items-center gap-2.5 group overflow-hidden ${className}`}>
      <div
        className={`relative ${iconDimensions} flex-shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
      >
        <Image
          src="/logo.svg"
          alt="Vaultix"
          fill
          className="object-contain"
          priority={priority}
        />
      </div>
      {showText && (
        <span className={`font-heading ${textClass} font-bold tracking-tight select-none`}>
          Vault<span className="text-brand">ix</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default VaultixLogo;
