"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  BookOpen,
  Download,
  Users,
  CreditCard,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
} from "lucide-react";
import { VaultixIcon } from "@/components/ui/vaultix-icon";

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Questionnaires", icon: FileSpreadsheet, href: "/dashboard/questionnaires" },
  { label: "Knowledge Base", icon: BookOpen, href: "/dashboard/knowledge" },
  { label: "Exports", icon: Download, href: "/dashboard/exports" },
];

const bottomNav = [
  { label: "Team & Roles", icon: Users, href: "/dashboard/team" },
  { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
  { label: "Audit Log", icon: ScrollText, href: "/dashboard/audit" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-screen sticky top-0
        bg-dark-2 border-r border-white/[0.06]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/[0.06] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center shadow-lg shadow-brand/20 shrink-0">
          <VaultixIcon className="w-5 h-5" />
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-bold tracking-tight whitespace-nowrap">
            Vault<span className="text-brand">ix</span>
          </span>
        )}
      </div>

      {/* New Questionnaire button */}
      <div className="px-3 mt-4 mb-2 shrink-0">
        <Link
          href="/dashboard/questionnaires/new"
          className={`
            flex items-center gap-2 px-3 py-2.5 rounded-xl
            bg-brand hover:bg-brand-hover text-white text-sm font-semibold
            transition-all duration-200 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Questionnaire</span>}
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${collapsed ? "justify-center" : ""}
                ${isActive(item.href)
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-light-2 hover:text-light hover:bg-white/[0.04] border border-transparent"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive(item.href) ? "text-brand" : "text-light-3 group-hover:text-light-2"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="my-4 mx-3 h-px bg-white/[0.06]" />

        <div className="space-y-1">
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${collapsed ? "justify-center" : ""}
                ${isActive(item.href)
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-light-2 hover:text-light hover:bg-white/[0.04] border border-transparent"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive(item.href) ? "text-brand" : "text-light-3 group-hover:text-light-2"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer: User + collapse toggle */}
      <div className="px-3 py-3 border-t border-white/[0.06] shrink-0">
        {/* User */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-xs font-bold text-brand shrink-0">
            U
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light truncate">User</p>
              <p className="text-xs text-light-3 truncate">user@company.com</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-light-3 hover:text-light-2 hover:bg-white/[0.04] transition-all text-xs"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
