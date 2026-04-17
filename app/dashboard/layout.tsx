"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Shield, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading text-lg font-bold">
                  Shield<span className="text-brand">AI</span>
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
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    (item.href === "/dashboard" && pathname === "/dashboard") ||
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
