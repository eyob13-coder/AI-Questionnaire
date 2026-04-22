"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  CheckCheck,
  CreditCard,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { formatRelativeTime } from "@/lib/format";
import type { DashboardNotification } from "@/lib/notifications";
import { useNotifications } from "@/lib/use-notifications";

function notificationIcon(notification: DashboardNotification) {
  const iconClass = "w-4 h-4";

  switch (notification.kind) {
    case "QUESTIONNAIRE_COMPLETED":
    case "QUESTIONNAIRE_REVIEW_REQUIRED":
    case "QUESTIONNAIRE_FAILED":
      return <FileSpreadsheet className={iconClass} />;
    case "KNOWLEDGE_INDEXED":
    case "KNOWLEDGE_FAILED":
      return <BookOpen className={iconClass} />;
    case "TEAM_ACTIVITY":
      return <Users className={iconClass} />;
    case "BILLING_ALERT":
      return <CreditCard className={iconClass} />;
    case "SYSTEM":
    default:
      return <Sparkles className={iconClass} />;
  }
}

function notificationColor(priority: DashboardNotification["priority"]) {
  switch (priority) {
    case "success":
      return "text-success bg-success/10 border-success/20";
    case "warning":
      return "text-warning bg-warning/10 border-warning/20";
    case "danger":
      return "text-danger bg-danger/10 border-danger/20";
    case "info":
    default:
      return "text-brand bg-brand/10 border-brand/20";
  }
}

export default function NotificationsMenu() {
  const { workspace, isLoading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    items,
    unreadCount,
    isLoading,
    isRefreshing,
    isMarkingAllRead,
    pendingIds,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications(workspace?.id ?? null, { limit: 8, pollIntervalMs: 45_000 });

  const closeMenu = () => {
    setOpen(false);
  };

  const handleDocumentClick = useEffectEvent((event: MouseEvent) => {
    if (!containerRef.current) return;
    const target = event.target;
    if (target instanceof Node && !containerRef.current.contains(target)) {
      closeMenu();
    }
  });

  const handleEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  useEffect(() => {
    if (!open) return;

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current;
      if (!current && workspace?.id) {
        void refresh();
      }
      return next;
    });
  };

  const unreadBadge = unreadCount > 9 ? "9+" : unreadCount.toString();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={open}
        aria-controls={menuId}
        className="relative p-2.5 text-light-3 hover:text-light rounded-xl hover:bg-white/[0.04] transition"
        onClick={toggleOpen}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center border border-dark shadow-[0_0_0_2px_rgba(11,15,20,0.9)]">
            {unreadBadge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[22rem] sm:w-[25rem] rounded-2xl border border-white/[0.08] bg-dark-2/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div>
                <p className="font-heading text-sm font-semibold text-light">Notifications</p>
                <p className="text-xs text-light-4">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Refresh notifications"
                  onClick={() => void refresh()}
                  className="p-2 rounded-lg text-light-4 hover:text-light-2 hover:bg-white/[0.04] transition-colors"
                >
                  <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
                </button>
                <button
                  type="button"
                  disabled={unreadCount === 0 || isMarkingAllRead}
                  onClick={() => void markAllAsRead()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-light-3 hover:text-light disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-colors"
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Mark all read
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-4 mt-4 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2.5 text-xs text-danger flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium">Notifications unavailable</p>
                  <p className="mt-0.5 text-danger/90">{error}</p>
                </div>
              </div>
            )}

            <div className="max-h-[28rem] overflow-y-auto p-2">
              {workspaceLoading ? (
                <div className="px-4 py-10 text-center">
                  <Loader2 className="w-5 h-5 text-light-4 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-light mt-4">Loading workspace</p>
                  <p className="text-xs text-light-4 mt-1">
                    We&apos;re fetching notification context for your active workspace.
                  </p>
                </div>
              ) : workspaceError ? (
                <div className="px-4 py-10 text-center">
                  <ShieldAlert className="w-5 h-5 text-danger mx-auto" />
                  <p className="text-sm font-medium text-light mt-4">Workspace unavailable</p>
                  <p className="text-xs text-light-4 mt-1">{workspaceError}</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 animate-pulse"
                    >
                      <div className="h-3 w-2/3 rounded bg-white/[0.08]" />
                      <div className="h-3 w-full rounded bg-white/[0.05] mt-3" />
                      <div className="h-3 w-1/3 rounded bg-white/[0.05] mt-2" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-light-4" />
                  </div>
                  <p className="text-sm font-medium text-light mt-4">No notifications yet</p>
                  <p className="text-xs text-light-4 mt-1">
                    New review alerts, knowledge updates, and billing notices will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((notification) => {
                    const pending = pendingIds.includes(notification.id);
                    const href = notification.href || "/dashboard/audit";

                    return (
                      <Link
                        key={notification.id}
                        href={href}
                        onClick={() => {
                          void markAsRead(notification.id);
                          closeMenu();
                        }}
                        className={clsx(
                          "group flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                          notification.isRead
                            ? "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
                            : "border-brand/20 bg-brand/[0.05] hover:bg-brand/[0.08]",
                        )}
                      >
                        <div
                          className={clsx(
                            "mt-0.5 flex w-9 h-9 shrink-0 items-center justify-center rounded-xl border",
                            notificationColor(notification.priority),
                          )}
                        >
                          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : notificationIcon(notification)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={clsx(
                                "text-sm font-medium leading-5",
                                notification.isRead ? "text-light-2" : "text-light",
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-brand shrink-0" />
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-light-3">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-light-4">
                            <span>{formatRelativeTime(notification.createdAt)}</span>
                            {notification.actorName && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-white/[0.16]" />
                                <span>{notification.actorName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] px-4 py-3">
              <Link
                href="/dashboard/audit"
                onClick={closeMenu}
                className="text-xs font-medium text-brand hover:text-brand-light transition-colors"
              >
                View all activity
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
