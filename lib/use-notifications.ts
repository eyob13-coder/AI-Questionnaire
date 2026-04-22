"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  DashboardNotification,
  NotificationListResponse,
  NotificationMutationResponse,
} from "@/lib/notifications";

interface UseNotificationsOptions {
  limit?: number;
  pollIntervalMs?: number;
}

const DEFAULT_LIMIT = 8;
const DEFAULT_POLL_INTERVAL_MS = 60_000;

export function useNotifications(
  workspaceId: string | null,
  options: UseNotificationsOptions = {},
) {
  const { limit = DEFAULT_LIMIT, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS } = options;
  const [items, setItems] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(workspaceId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const requestTokenRef = useRef(0);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!workspaceId) {
      startTransition(() => {
        setItems([]);
        setUnreadCount(0);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
      });
      return;
    }

    const token = ++requestTokenRef.current;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await apiGet<NotificationListResponse>(
        `/workspaces/${workspaceId}/notifications`,
        { limit },
      );

      if (token !== requestTokenRef.current) return;

      startTransition(() => {
        setItems(data.items);
        setUnreadCount(
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : data.items.filter((item) => !item.isRead).length,
        );
        setError(null);
      });
    } catch (err: unknown) {
      if (token !== requestTokenRef.current) return;
      startTransition(() => {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      });
    } finally {
      if (token !== requestTokenRef.current) return;
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [limit, workspaceId]);

  useEffect(() => {
    if (!workspaceId) {
      startTransition(() => {
        setItems([]);
        setUnreadCount(0);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
      });
      return;
    }

    void fetchNotifications(false);

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void fetchNotifications(true);
    }, pollIntervalMs);

    const handleFocus = () => {
      void fetchNotifications(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      requestTokenRef.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [workspaceId, pollIntervalMs, fetchNotifications]);

  const refresh = async () => {
    await fetchNotifications(true);
  };

  const markAsRead = async (notificationId: string) => {
    if (!workspaceId) return;

    const current = items.find((item) => item.id === notificationId);
    if (!current || current.isRead) return;

    setPendingIds((prev) => [...prev, notificationId]);

    startTransition(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
                readAt: item.readAt ?? new Date().toISOString(),
              }
            : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setError(null);
    });

    try {
      const response = await apiPatch<NotificationMutationResponse>(
        `/workspaces/${workspaceId}/notifications/${notificationId}/read`,
      );

      startTransition(() => {
        if (response.item) {
          setItems((prev) =>
            prev.map((item) => (item.id === notificationId ? response.item! : item)),
          );
        }
        if (typeof response.unreadCount === "number") {
          setUnreadCount(response.unreadCount);
        }
      });
    } catch (err: unknown) {
      startTransition(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  isRead: current.isRead,
                  readAt: current.readAt,
                }
              : item,
          ),
        );
        setUnreadCount((prev) => prev + 1);
        setError(err instanceof Error ? err.message : "Failed to update notification");
      });
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const markAllAsRead = async () => {
    if (!workspaceId || unreadCount === 0) return;

    const previousItems = items;
    const previousUnreadCount = unreadCount;

    setIsMarkingAllRead(true);

    startTransition(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.isRead
            ? item
            : {
                ...item,
                isRead: true,
                readAt: item.readAt ?? new Date().toISOString(),
              },
        ),
      );
      setUnreadCount(0);
      setError(null);
    });

    try {
      const response = await apiPost<NotificationMutationResponse>(
        `/workspaces/${workspaceId}/notifications/read-all`,
      );

      startTransition(() => {
        if (typeof response.unreadCount === "number") {
          setUnreadCount(response.unreadCount);
        }
      });
    } catch (err: unknown) {
      startTransition(() => {
        setItems(previousItems);
        setUnreadCount(previousUnreadCount);
        setError(err instanceof Error ? err.message : "Failed to mark all notifications as read");
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  return {
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
  };
}
