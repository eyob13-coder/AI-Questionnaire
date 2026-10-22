"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";

const mainNav = [
  { label: "Overview", icon: byPrefixAndName.fans["house"], href: "/dashboard" },
  { label: "Questionnaires", icon: byPrefixAndName.fans["table-cells"], href: "/dashboard/questionnaires" },
  { label: "Knowledge Base", icon: byPrefixAndName.fans["book-open"], href: "/dashboard/knowledge" },
  { label: "Exports", icon: byPrefixAndName.fans["file-export"], href: "/dashboard/exports" },
];

const workspaceNav = [
  { label: "Team & Roles", icon: byPrefixAndName.fans["users"], href: "/dashboard/team" },
  { label: "Billing & Plans", icon: byPrefixAndName.fans["credit-card"], href: "/dashboard/billing" },
  { label: "Audit Log", icon: byPrefixAndName.fans["scroll"], href: "/dashboard/audit" },
  { label: "Settings", icon: byPrefixAndName.fans["gear"], href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: sessionData } = useSession();
  const authStoreUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const user = authStoreUser || sessionData?.user;
  const normalizedEmail = user?.email?.trim() || "";
  const displayName = user?.name?.trim() || (normalizedEmail ? normalizedEmail.split("@")[0] : "Account");
  const displayEmail = normalizedEmail || "Signed in";
  const displayInitial = displayName.charAt(0).toUpperCase() || "U";

  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-dark-2/95 backdrop-blur-2xl border-r border-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none z-30 ${collapsed ? "w-[72px]" : "w-[264px]"
        }`}
    >
      {/* Brand Header — Single clean logo area with no duplicate opener and no version tag */}
      <div className={`h-16 px-4 flex items-center border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-sm shadow-brand/10">
            <Image src="/logo.svg" alt="Vaultix" fill className="object-contain p-1" priority />
          </div>
          {!collapsed && (
            <span className="font-heading text-lg font-bold tracking-tight">
              Vault<span className="text-brand">ix</span>
            </span>
          )}
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className={`pt-3 shrink-0 ${collapsed ? "px-2" : "px-3"}`}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Quick Action Button with comfortable gap when collapsed */}
      <div className={`shrink-0 ${collapsed ? "pt-3.5 pb-2 px-2 flex justify-center" : "px-3 pt-3 pb-2"}`}>
        <Link
          href="/dashboard/questionnaires/new"
          className={`group flex items-center bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-brand/20 hover:shadow-brand/35 active:scale-[0.98] ${collapsed ? "w-10 h-10 rounded-xl justify-center p-0" : "justify-between gap-2.5 px-3 py-2.5 rounded-xl"
            }`}
          title={collapsed ? "New Questionnaire" : undefined}
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={byPrefixAndName.fans["plus"]} className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-90" />
            {!collapsed && <span>New Questionnaire</span>}
          </div>
          {!collapsed && (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-black/20 rounded text-white/80 border border-white/10">
              ⌘N
            </kbd>
          )}
        </Link>
      </div>

      {/* Navigation Sections with generous icon gaps in collapsed mode */}
      <nav className={`flex-1 py-2 overflow-y-auto overflow-x-hidden ${collapsed ? "px-2 space-y-6" : "px-3 space-y-5"}`}>
        <div>
          {!collapsed && (
            <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-mono font-semibold tracking-wider text-light-4 uppercase">
              <span>Workflow</span>
              <FontAwesomeIcon icon={byPrefixAndName.fans["wand-magic-sparkles"]} className="w-3 h-3 text-brand/50" />
            </div>
          )}
          <div className={collapsed ? "space-y-3" : "space-y-1"}>
            {mainNav.map((item) => (
              <SidebarNavItem key={item.href} label={item.label} icon={item.icon} href={item.href} active={isActive(item.href)} collapsed={collapsed} />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-mono font-semibold tracking-wider text-light-4 uppercase">
              Management
            </div>
          )}
          <div className={collapsed ? "space-y-3" : "space-y-1"}>
            {workspaceNav.map((item) => (
              <SidebarNavItem key={item.href} label={item.label} icon={item.icon} href={item.href} active={isActive(item.href)} collapsed={collapsed} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer: User Profile & Dedicated Single Sidebar Opener */}
      <div className={`border-t border-white/[0.06] bg-dark-3/30 shrink-0 ${collapsed ? "p-2.5" : "p-3"}`}>
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer ${collapsed ? "justify-center p-1.5" : ""}`}
          onClick={() => router.push("/dashboard/settings")}
          title={collapsed ? displayName : undefined}
        >
          <div className="relative shrink-0">
            {user?.image ? (
              <img src={user.image} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand ring-1 ring-brand/20">
                {displayInitial}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-dark-2" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-light truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-light-4 truncate leading-tight mt-0.5">{displayEmail}</p>
            </div>
          )}
        </div>

        {/* Action strip with generous gap when collapsed */}
        <div className="mt-2 pt-2 border-t border-white/[0.04]">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-light-3 hover:text-brand hover:bg-brand/10 transition-all cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fans["angles-right"]} className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-light-3 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right-from-bracket"]} className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-light-3 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fans["arrow-right-from-bracket"]} className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex items-center justify-center p-1.5 rounded-lg text-light-3 hover:text-light hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <FontAwesomeIcon icon={byPrefixAndName.fans["angles-left"]} className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
