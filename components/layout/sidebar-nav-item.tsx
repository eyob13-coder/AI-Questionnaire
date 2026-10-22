"use client";

import Link from "next/link";
import { FontAwesomeIcon, type IconDefinition } from "@/lib/fontawesome";

interface SidebarNavItemProps {
  label: string;
  icon: IconDefinition;
  href: string;
  active: boolean;
  collapsed: boolean;
}

export function SidebarNavItem({
  label,
  icon,
  href,
  active,
  collapsed,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center transition-all duration-150 group rounded-xl text-xs font-medium
        ${collapsed ? "w-10 h-10 mx-auto justify-center p-0" : "gap-3 px-3 py-2.5"}
        ${active
          ? "bg-brand/10 text-brand font-semibold shadow-sm shadow-brand/5"
          : "text-light-2 hover:text-light hover:bg-white/[0.04]"
        }
      `}
      title={collapsed ? label : undefined}
    >
      {/* Modern Active Indicator Pip */}
      {active && (
        <span
          className={`absolute bg-brand rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)] ${
            collapsed
              ? "left-0.5 top-1/2 -translate-y-1/2 w-1 h-4"
              : "left-1 top-1/2 -translate-y-1/2 w-1 h-4"
          }`}
        />
      )}

      <FontAwesomeIcon
        icon={icon}
        className={`w-4 h-4 shrink-0 transition-colors ${
          active ? "text-brand" : "text-light-3 group-hover:text-light"
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
