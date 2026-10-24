"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace";
import { useSession } from "@/lib/auth-client";
import { useAuthStore, useQuestionnaireStore } from "@/lib/store";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";

function TrialBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("vaultix_trial_banner_dismissed") === "true";
    }
    return false;
  });
  const [mountedAt] = useState(() => Date.now());
  const { workspace } = useWorkspace();
  const billingInfo = useQuestionnaireStore((s) => s.billingInfo);
  const fetchBillingInfo = useQuestionnaireStore((s) => s.fetchBillingInfo);

  useEffect(() => {
    if (workspace?.id) {
      fetchBillingInfo(workspace.id);
    }
  }, [workspace?.id, fetchBillingInfo]);

  // Derive remaining trial days purely from the mounted timestamp
  const daysLeft = (() => {
    if (workspace?.trialEndsAt) {
      const diffMs = new Date(workspace.trialEndsAt).getTime() - mountedAt;
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
    if (workspace?.createdAt) {
      const createdTime = new Date(workspace.createdAt).getTime();
      const trialEndTime = createdTime + 14 * 24 * 60 * 60 * 1000;
      const diffMs = trialEndTime - mountedAt;
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
    return 11;
  })();

  // Remove the banner when the user/workspace is upgraded, has credits, or paid
  const plan = (billingInfo?.plan || workspace?.plan || "").toUpperCase();
  const exportCredits =
    billingInfo?.exportCredits ?? (workspace as any)?.exportCredits ?? 0;
  const hasPaymentSuccess =
    typeof window !== "undefined" &&
    (window.location.search.includes("success=1") ||
      window.location.search.includes("checkout=success"));

  const isUpgraded =
    plan === "PRO" ||
    plan === "ENTERPRISE" ||
    plan === "STARTER" ||
    Boolean(billingInfo?.isPro) ||
    workspace?.subscriptionStatus === "active" ||
    billingInfo?.subscriptionStatus === "active" ||
    exportCredits > 0 ||
    hasPaymentSuccess;

  if (isUpgraded || dismissed) {
    return null;
  }

  const urgency = daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "brand";
  const colors = {
    danger: {
      bg: "bg-danger/10 border-danger/20",
      text: "text-danger",
      btn: "bg-danger hover:bg-red-500",
      icon: "text-danger",
    },
    warning: {
      bg: "bg-warning/10 border-warning/20",
      text: "text-warning",
      btn: "bg-warning hover:bg-amber-500",
      icon: "text-warning",
    },
    brand: {
      bg: "bg-brand/[0.08] border-brand/20",
      text: "text-brand",
      btn: "bg-brand hover:bg-orange-500",
      icon: "text-brand",
    },
  }[urgency];

  return (
    <div className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 border-b ${colors.bg}`}>
      <FontAwesomeIcon icon={byPrefixAndName.fans["clock"]} className={`w-3.5 h-3.5 shrink-0 ${colors.icon}`} />
      <p className="text-xs sm:text-sm text-light-2 flex-1 min-w-0">
        <span className={`font-semibold ${colors.text}`}>
          {daysLeft === 0 ? "Trial expired" : `${daysLeft} days left`}
        </span>{" "}
        {daysLeft === 0 ? "— upgrade to keep uninterrupted access." : "in your free trial."}
        <span className="hidden sm:inline"> Add a payment method to keep uninterrupted access.</span>
      </p>
      <Link
        href="/dashboard/billing"
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all ${colors.btn}`}
      >
        <FontAwesomeIcon icon={byPrefixAndName.fans["bolt"]} className="w-3 h-3" />
        Upgrade
      </Link>
      <button
        onClick={() => {
          setDismissed(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("vaultix_trial_banner_dismissed", "true");
          }
        }}
        className="shrink-0 p-1 text-light-4 hover:text-light-2 rounded-lg transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <FontAwesomeIcon icon={byPrefixAndName.fans["xmark"]} className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const mobileWorkflowNav = [
  { label: "Overview", icon: byPrefixAndName.fans["house"], href: "/dashboard" },
  { label: "Questionnaires", icon: byPrefixAndName.fans["table-cells"], href: "/dashboard/questionnaires" },
  { label: "Knowledge Base", icon: byPrefixAndName.fans["book-open"], href: "/dashboard/knowledge" },
  { label: "Exports", icon: byPrefixAndName.fans["file-export"], href: "/dashboard/exports" },
];

const mobileManagementNav = [
  { label: "Team & Roles", icon: byPrefixAndName.fans["users"], href: "/dashboard/team" },
  { label: "Billing & Plans", icon: byPrefixAndName.fans["credit-card"], href: "/dashboard/billing" },
  { label: "Audit Log", icon: byPrefixAndName.fans["scroll"], href: "/dashboard/audit" },
  { label: "Settings", icon: byPrefixAndName.fans["gear"], href: "/dashboard/settings" },
];

export default function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: sessionData } = useSession();
  const authStoreUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const user = authStoreUser || sessionData?.user;
  const normalizedEmail = user?.email?.trim() || "";
  const displayName = user?.name?.trim() || (normalizedEmail ? normalizedEmail.split("@")[0] : "Account");
  const displayEmail = normalizedEmail || "Signed in";
  const displayInitial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-dark">
        <Sidebar />

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-dark-2 border-r border-white/[0.08] p-4 flex flex-col justify-between overflow-y-auto animate-slide-up shadow-2xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image src="/logo.svg" alt="Vaultix Logo" fill className="object-contain" priority />
                    </div>
                    <span className="font-heading text-lg font-bold">
                      Vault<span className="text-brand">ix</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-light-3 hover:text-light rounded-lg hover:bg-white/[0.06] transition cursor-pointer"
                    aria-label="Close menu"
                  >
                    <FontAwesomeIcon icon={byPrefixAndName.fans["xmark"]} className="w-4 h-4" />
                  </button>
                </div>

                {/* Workspace Switcher */}
                <div>
                  <WorkspaceSwitcher collapsed={false} />
                </div>

                {/* New Questionnaire Quick Button */}
                <Link
                  href="/dashboard/questionnaires/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-md shadow-brand/20 transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={byPrefixAndName.fans["plus"]} className="w-3.5 h-3.5" />
                    <span>New Questionnaire</span>
                  </div>
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">⌘N</span>
                </Link>

                {/* Workflow Navigation */}
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-light-4 uppercase">
                    Workflow
                  </p>
                  {mobileWorkflowNav.map((item) => {
                    const active = (item.href === "/dashboard" && pathname === "/dashboard") ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-brand/10 text-brand font-semibold"
                            : "text-light-2 hover:text-light hover:bg-white/[0.04]"
                        }`}
                      >
                        <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${active ? "text-brand" : "text-light-3"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Management Navigation */}
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-light-4 uppercase">
                    Management
                  </p>
                  {mobileManagementNav.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-brand/10 text-brand font-semibold"
                            : "text-light-2 hover:text-light hover:bg-white/[0.04]"
                        }`}
                      >
                        <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${active ? "text-brand" : "text-light-3"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Footer: User Profile Section & Logout Button */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2 mt-6">
                {/* Profile Card: Clicking redirects to settings */}
                <div
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] transition cursor-pointer"
                  title="Customize profile"
                >
                  <div className="relative shrink-0">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                        {displayInitial}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-dark-2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-light truncate leading-tight">{displayName}</p>
                    <p className="text-[11px] text-light-4 truncate leading-tight mt-0.5">{displayEmail}</p>
                  </div>
                  <FontAwesomeIcon icon={byPrefixAndName.fans["chevron-right"]} className="w-3 h-3 text-light-4" />
                </div>

                {/* Sign Out / Logout Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setMobileOpen(false);
                    await logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-light-3 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={byPrefixAndName.fans["arrow-right-from-bracket"]}
                    className="w-3.5 h-3.5 text-danger shrink-0"
                  />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <TrialBanner />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
