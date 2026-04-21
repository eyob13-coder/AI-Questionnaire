"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { X, Zap, Clock } from "lucide-react";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Simplified mobile sidebar items
const mobileNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Questionnaires", href: "/dashboard/questionnaires" },
  { label: "Knowledge Base", href: "/dashboard/knowledge" },
  { label: "Exports", href: "/dashboard/exports" },
  { label: "Team & Roles", href: "/dashboard/team" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Audit Log", href: "/dashboard/audit" },
  { label: "Settings", href: "/dashboard/settings" },
];

function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const daysLeft = 11; // Backend will pass real value

  if (dismissed) return null;

  const urgency = daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "brand";
  const colors = {
    danger: { bg: "bg-danger/10 border-danger/20", text: "text-danger", btn: "bg-danger hover:bg-red-500", icon: "text-danger" },
    warning: { bg: "bg-warning/10 border-warning/20", text: "text-warning", btn: "bg-warning hover:bg-amber-500", icon: "text-warning" },
    brand: { bg: "bg-brand/[0.08] border-brand/20", text: "text-brand", btn: "bg-brand hover:bg-orange-500", icon: "text-brand" },
  }[urgency];

  return (
    <div className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 border-b ${colors.bg} border-b`}>
      <Clock className={`w-4 h-4 shrink-0 ${colors.icon}`} />
      <p className="text-xs sm:text-sm text-light-2 flex-1 min-w-0">
        <span className={`font-semibold ${colors.text}`}>{daysLeft} days left</span> in your free trial.
        <span className="hidden sm:inline"> Add a payment method to keep uninterrupted access.</span>
      </p>
      <Link
        href="/dashboard/billing"
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all ${colors.btn}`}
      >
        <Zap className="w-3 h-3" />
        Upgrade
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 text-light-4 hover:text-light-2 rounded-lg transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-dark-2 border-r border-white/[0.06] p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6">
                  <Image src="/logo.svg" alt="Vaultix Logo" fill className="object-contain" priority />
                </div>
                <span className="font-heading text-lg font-bold">
                  Vault<span className="text-brand">ix</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-light-3 hover:text-light rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${(item.href === "/dashboard" && pathname === "/dashboard") ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href))
                      ? "bg-brand/10 text-brand"
                      : "text-light-2 hover:text-light hover:bg-white/[0.04]"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <TrialBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
