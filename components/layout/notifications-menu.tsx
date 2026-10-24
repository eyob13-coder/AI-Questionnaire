"use client";

import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";
import { useWorkspace } from "@/lib/workspace";
import { formatRelativeTime } from "@/lib/format";
import type { DashboardNotification } from "@/lib/notifications";
import { useNotifications } from "@/lib/use-notifications";

function notificationIcon(notification: DashboardNotification) {
  const iconClass = "w-3.5 h-3.5";

  switch (notification.kind) {
    case "QUESTIONNAIRE_COMPLETED":
    case "QUESTIONNAIRE_REVIEW_REQUIRED":
    case "QUESTIONNAIRE_FAILED":
      return <FontAwesomeIcon icon={byPrefixAndName.fans["table-cells"]} className={iconClass} />;
    case "KNOWLEDGE_INDEXED":
    case "KNOWLEDGE_FAILED":
      return <FontAwesomeIcon icon={byPrefixAndName.fans["book-open"]} className={iconClass} />;
    case "TEAM_ACTIVITY":
      return <FontAwesomeIcon icon={byPrefixAndName.fans["users"]} className={iconClass} />;
    case "BILLING_ALERT":
      return <FontAwesomeIcon icon={byPrefixAndName.fans["credit-card"]} className={iconClass} />;
    case "SYSTEM":
    default:
      return <FontAwesomeIcon icon={byPrefixAndName.fans["wand-magic-sparkles"]} className={iconClass} />;
  }
}

function notificationColor(priority: DashboardNotification["priority"]) {
  switch (priority) {
    case "success":
      return "text-emerald-400 bg-emerald-500/10";
    case "warning":
      return "text-amber-400 bg-amber-500/10";
    case "danger":
      return "text-rose-400 bg-rose-500/10";
    case "info":
    default:
      return "text-brand bg-brand/10";
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
        className="relative p-2 text-light-4 hover:text-light rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
        onClick={toggleOpen}
      >
        <FontAwesomeIcon icon={byPrefixAndName.fans["bell"]} className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-brand text-[9px] font-mono font-bold text-white flex items-center justify-center">
            {unreadBadge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+0.5rem)] w-[22rem] sm:w-[24rem] rounded-2xl bg-dark-2/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/[0.05]"
          >
            {/* Header: Lean, borderless with subtle separator */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.04]">
              <div>
                <p className="font-heading text-xs uppercase tracking-wider font-semibold text-light">
                  Notifications
                </p>
                <p className="text-[11px] text-light-4">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Refresh notifications"
                  onClick={() => void refresh()}
                  className="p-1.5 rounded-lg text-light-4 hover:text-light-2 hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={byPrefixAndName.fans["arrows-rotate"]}
                    className={clsx("w-3 h-3", isRefreshing && "animate-spin")}
                  />
                </button>
                <button
                  type="button"
                  disabled={unreadCount === 0 || isMarkingAllRead}
                  onClick={() => void markAllAsRead()}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-light-4 hover:text-light-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  {isMarkingAllRead ? (
                    <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-3 h-3 animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={byPrefixAndName.fans["check-double"]} className="w-3 h-3" />
                  )}
                  Mark read
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-3 mt-3 rounded-xl bg-rose-500/[0.08] px-3 py-2.5 text-xs text-rose-300 flex items-start gap-2">
                <FontAwesomeIcon icon={byPrefixAndName.fans["shield-halved"]} className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                <div className="min-w-0">
                  <p className="font-medium">Notifications unavailable</p>
                  <p className="mt-0.5 text-rose-300/80 text-[11px]">{error}</p>
                </div>
              </div>
            )}

            {/* Notification Stream */}
            <div className="max-h-[26rem] overflow-y-auto p-1.5 space-y-0.5">
              {workspaceLoading ? (
                <div className="px-4 py-8 text-center">
                  <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-4 h-4 text-light-4 animate-spin mx-auto" />
                  <p className="text-xs font-medium text-light mt-3">Loading workspace</p>
                  <p className="text-[11px] text-light-4 mt-0.5">
                    Fetching notifications...
                  </p>
                </div>
              ) : workspaceError ? (
                <div className="px-4 py-8 text-center">
                  <FontAwesomeIcon icon={byPrefixAndName.fans["shield-halved"]} className="w-4 h-4 text-rose-400 mx-auto" />
                  <p className="text-xs font-medium text-light mt-3">Workspace unavailable</p>
                  <p className="text-[11px] text-light-4 mt-0.5">{workspaceError}</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-1 p-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white/[0.02] p-3 animate-pulse"
                    >
                      <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
                      <div className="h-2.5 w-full rounded bg-white/[0.04] mt-2.5" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                    <FontAwesomeIcon icon={byPrefixAndName.fans["bell"]} className="w-4 h-4 text-light-4" />
                  </div>
                  <p className="text-xs font-medium text-light mt-3">No notifications</p>
                  <p className="text-[11px] text-light-4 mt-0.5">
                    Review alerts, updates, and notices will appear here.
                  </p>
                </div>
              ) : (
                items.map((notification) => {
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
                        "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors cursor-pointer",
                        notification.isRead
                          ? "hover:bg-white/[0.03] opacity-75 hover:opacity-100"
                          : "bg-white/[0.03] hover:bg-white/[0.05]",
                      )}
                    >
                      {/* Icon Container: borderless with semantic tint */}
                      <div
                        className={clsx(
                          "mt-0.5 flex w-8 h-8 shrink-0 items-center justify-center rounded-lg",
                          notificationColor(notification.priority),
                        )}
                      >
                        {pending ? (
                          <FontAwesomeIcon icon={byPrefixAndName.fans["spinner"]} className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          notificationIcon(notification)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={clsx(
                              "text-xs font-medium leading-snug truncate",
                              notification.isRead ? "text-light-3" : "text-light",
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-light-4 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-light-4 font-mono">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {notification.actorName && (
                            <>
                              <span>·</span>
                              <span className="truncate">{notification.actorName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.04] px-4 py-2.5 flex items-center justify-between">
              <Link
                href="/dashboard/audit"
                onClick={closeMenu}
                className="text-[11px] font-medium text-light-4 hover:text-brand transition-colors"
              >
                View full audit log →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
