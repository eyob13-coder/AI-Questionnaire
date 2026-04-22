export type NotificationPriority = "info" | "success" | "warning" | "danger";

export type NotificationKind =
  | "QUESTIONNAIRE_COMPLETED"
  | "QUESTIONNAIRE_REVIEW_REQUIRED"
  | "QUESTIONNAIRE_FAILED"
  | "KNOWLEDGE_INDEXED"
  | "KNOWLEDGE_FAILED"
  | "TEAM_ACTIVITY"
  | "BILLING_ALERT"
  | "SYSTEM"
  | string;

/**
 * Backend contract for the dashboard bell.
 *
 * Expected endpoints:
 * - GET    /workspaces/:workspaceId/notifications?limit=10
 * - PATCH  /workspaces/:workspaceId/notifications/:notificationId/read
 * - POST   /workspaces/:workspaceId/notifications/read-all
 */
export interface DashboardNotification {
  id: string;
  workspaceId: string;
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  actorName?: string | null;
}

export interface NotificationListResponse {
  items: DashboardNotification[];
  unreadCount: number;
}

export interface NotificationMutationResponse {
  unreadCount?: number;
  item?: DashboardNotification;
}
