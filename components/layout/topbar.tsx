"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import { VaultixIcon } from "@/components/ui/vaultix-icon";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/questionnaires": "Questionnaires",
  "/dashboard/questionnaires/new": "New Questionnaire",
  "/dashboard/knowledge": "Knowledge Base",
  "/dashboard/exports": "Export History",
  "/dashboard/team": "Team & Roles",
  "/dashboard/billing": "Billing",
  "/dashboard/audit": "Audit Log",
  "/dashboard/settings": "Settings",
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith("/dashboard/questionnaires/") && pathname !== "/dashboard/questionnaires/new") {
      return "Questionnaire Review";
    }
    const match = Object.entries(pageTitles)
      .filter(([path]) => pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length);
    return match[0]?.[1] || "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl" />
      <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-light-3 hover:text-light rounded-lg hover:bg-white/[0.04] transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center">
              <VaultixIcon className="w-4 h-4" />
            </div>
          </Link>

          <h1 className="font-heading text-lg font-semibold text-light">
            {getTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-colors w-64">
            <Search className="w-4 h-4 text-light-3" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-light placeholder-light-3 outline-none w-full"
            />
            <kbd className="hidden md:inline-block text-[10px] text-light-4 bg-dark-4 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          </div>

          <button className="relative p-2.5 text-light-3 hover:text-light rounded-xl hover:bg-white/[0.04] transition">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand" />
          </button>

          <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-xs font-bold text-brand">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
