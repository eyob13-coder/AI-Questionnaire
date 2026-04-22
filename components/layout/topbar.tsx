"use client";

import { usePathname } from "next/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { VaultixIcon } from "@/components/ui/vaultix-icon";
import { useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSearch from "@/components/layout/dashboard-search";
import NotificationsMenu from "@/components/layout/notifications-menu";

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
          <DashboardSearch />

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-dark-4/60 hover:bg-dark-5/80 text-light-3 hover:text-light transition-all duration-200 hover:border-white/[0.16] group overflow-hidden"
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
                  <Sun className="w-4 h-4" />
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
                  <Moon className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-brand/10 to-transparent" />
          </button>

          <NotificationsMenu />

          <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-xs font-bold text-brand">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
