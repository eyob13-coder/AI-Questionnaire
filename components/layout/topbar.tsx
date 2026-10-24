"use client";

import { usePathname } from "next/navigation";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSearch from "@/components/layout/dashboard-search";
import NotificationsMenu from "@/components/layout/notifications-menu";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";

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

const THEME_STORAGE_KEY = "vaultix-theme";
const THEME_EVENT_NAME = "vaultix-theme-change";

type ThemeMode = "dark" | "light";

function resolveTheme(value: string | null): ThemeMode {
  return value === "light" ? "light" : "dark";
}

function subscribeTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener: EventListener = () => onStoreChange();

  window.addEventListener("storage", listener);
  window.addEventListener(THEME_EVENT_NAME, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(THEME_EVENT_NAME, listener);
  };
}

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return resolveTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "dark");
  const { data: sessionData } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || sessionData?.user;
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  const userInitial = displayName.charAt(0).toUpperCase() || "A";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT_NAME));
  };

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
    <header className="sticky top-0 z-40 border-b border-dark-4">
      <div className="absolute inset-0 bg-dark-2/80 backdrop-blur-xl" />
      <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-light-3 hover:text-light rounded-lg hover:bg-white/[0.04] transition cursor-pointer"
            aria-label="Open navigation menu"
          >
            <FontAwesomeIcon icon={byPrefixAndName.fans["bars"]} className="w-4 h-4" />
          </button>

          {/* Page Title: hidden on mobile (<sm) per user request, visible on tablet/desktop */}
          <h1 className="hidden sm:block font-heading text-lg font-semibold text-light">
            {getTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <DashboardSearch />

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-dark-4 bg-dark-3/60 hover:bg-dark-4 text-light-3 hover:text-light transition-all duration-200 hover:border-dark-5 group overflow-hidden cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={byPrefixAndName.fans["sun"]} className="w-3.5 h-3.5" />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={byPrefixAndName.fans["moon"]} className="w-3.5 h-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-brand/10 to-transparent" />
          </button>

          <NotificationsMenu />

          {/* Profile Section: Click redirects to profile settings page */}
          <Link
            href="/dashboard/settings"
            className="lg:hidden relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 hover:ring-brand/50 active:scale-95 transition-all cursor-pointer"
            title="Profile & Settings"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                {userInitial}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
