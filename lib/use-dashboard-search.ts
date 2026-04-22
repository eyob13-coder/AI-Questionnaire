"use client";

import Fuse from "fuse.js";
import { startTransition, useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

interface SearchQuestionnaire {
  id: string;
  name: string;
  fileName: string;
  status: string;
  totalQuestions: number;
  createdAt: string;
}

interface SearchKnowledgeDoc {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  chunkCount: number;
  createdAt: string;
}

interface SearchMember {
  id: string;
  role: "OWNER" | "EDITOR" | "VIEWER" | string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface SearchAuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

export type DashboardSearchResultType =
  | "questionnaire"
  | "document"
  | "member"
  | "activity";

export interface DashboardSearchResult {
  id: string;
  type: DashboardSearchResultType;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  keywords: string[];
  createdAt: string;
}

interface UseDashboardSearchResult {
  results: DashboardSearchResult[];
  suggestions: DashboardSearchResult[];
  isLoading: boolean;
  error: string | null;
  totalIndexed: number;
}

const RESULT_LIMIT = 8;

const questionnaireStatusLabel: Record<string, string> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Generating",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

const knowledgeStatusLabel: Record<string, string> = {
  PROCESSING: "Processing",
  INDEXED: "Indexed",
  FAILED: "Failed",
};

const memberRoleLabel: Record<string, string> = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

function getAuditMessage(entry: SearchAuditEntry) {
  const details = entry.details ?? {};
  const message = typeof details.message === "string" ? details.message : null;
  if (message) return message;
  return `${entry.action.replace(/\./g, " ")} on ${entry.entity}`;
}

function buildSearchIndex(params: {
  questionnaires: SearchQuestionnaire[];
  documents: SearchKnowledgeDoc[];
  members: SearchMember[];
  activity: SearchAuditEntry[];
}) {
  const questionnaireItems: DashboardSearchResult[] = params.questionnaires.map((item) => ({
    id: `questionnaire:${item.id}`,
    type: "questionnaire",
    title: item.name,
    subtitle: `${item.fileName} - ${item.totalQuestions} questions`,
    meta: questionnaireStatusLabel[item.status] || item.status,
    href: `/dashboard/questionnaires/${item.id}`,
    keywords: [item.name, item.fileName, item.status],
    createdAt: item.createdAt,
  }));

  const documentItems: DashboardSearchResult[] = params.documents.map((item) => ({
    id: `document:${item.id}`,
    type: "document",
    title: item.fileName,
    subtitle: `${item.fileType} - ${item.chunkCount} chunks`,
    meta: knowledgeStatusLabel[item.status] || item.status,
    href: `/dashboard/knowledge?search=${encodeURIComponent(item.fileName)}`,
    keywords: [item.fileName, item.fileType, item.status],
    createdAt: item.createdAt,
  }));

  const memberItems: DashboardSearchResult[] = params.members.map((item) => {
    const name = item.user.name || item.user.email;
    const role = memberRoleLabel[item.role] || item.role;

    return {
      id: `member:${item.id}`,
      type: "member",
      title: name,
      subtitle: item.user.email,
      meta: role,
      href: `/dashboard/team?search=${encodeURIComponent(item.user.email)}`,
      keywords: [name, item.user.email, role],
      createdAt: item.joinedAt,
    };
  });

  const activityItems: DashboardSearchResult[] = params.activity.map((item) => {
    const actor = item.user?.name || item.user?.email || "System";
    const entity = item.entity || "Workspace activity";
    const message = getAuditMessage(item);

    return {
      id: `activity:${item.id}`,
      type: "activity",
      title: message,
      subtitle: `${actor} - ${entity}`,
      meta: item.action.replace(/\./g, " "),
      href: `/dashboard/audit?search=${encodeURIComponent(message)}`,
      keywords: [entity, item.action, actor, message],
      createdAt: item.createdAt,
    };
  });

  return [...questionnaireItems, ...documentItems, ...memberItems, ...activityItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function includesMatch(item: DashboardSearchResult, query: string) {
  const haystack = [item.title, item.subtitle, item.meta, ...item.keywords]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function useDashboardSearch(
  workspaceId: string | null,
  query: string,
): UseDashboardSearchResult {
  const [items, setItems] = useState<DashboardSearchResult[]>([]);
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!workspaceId) return () => {
      cancelled = true;
    };

    (async () => {
      const settled = await Promise.allSettled([
        apiGet<SearchQuestionnaire[]>(`/workspaces/${workspaceId}/questionnaires`),
        apiGet<SearchKnowledgeDoc[]>(`/workspaces/${workspaceId}/knowledge`),
        apiGet<SearchMember[]>(`/workspaces/${workspaceId}/members`),
        apiGet<SearchAuditEntry[]>(`/workspaces/${workspaceId}/audit`, { limit: 80 }),
      ]);

      if (cancelled) return;

      const questionnaires = settled[0].status === "fulfilled" ? settled[0].value : [];
      const documents = settled[1].status === "fulfilled" ? settled[1].value : [];
      const members = settled[2].status === "fulfilled" ? settled[2].value : [];
      const activity = settled[3].status === "fulfilled" ? settled[3].value : [];

      const failures = settled.filter((result) => result.status === "rejected");
      const nextError =
        failures.length > 0
          ? "Some search results may be missing while one or more workspace sources are unavailable."
          : null;

      startTransition(() => {
        setItems(
          buildSearchIndex({
            questionnaires,
            documents,
            members,
            activity,
          }),
        );
        setError(nextError);
        setLoadedWorkspaceId(workspaceId);
      });
    })().catch((err: unknown) => {
      if (cancelled) return;

      startTransition(() => {
        setItems([]);
        setError(err instanceof Error ? err.message : "Failed to build workspace search");
        setLoadedWorkspaceId(workspaceId);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const isLoading = Boolean(workspaceId) && loadedWorkspaceId !== workspaceId;
  const visibleError = loadedWorkspaceId === workspaceId ? error : null;
  const searchableItems = useMemo(
    () => (loadedWorkspaceId === workspaceId ? items : []),
    [items, loadedWorkspaceId, workspaceId],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchableItems, {
        keys: [
          { name: "title", weight: 0.48 },
          { name: "subtitle", weight: 0.24 },
          { name: "meta", weight: 0.08 },
          { name: "keywords", weight: 0.2 },
        ],
        threshold: 0.34,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchableItems],
  );

  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    if (!workspaceId) return [];
    if (!trimmedQuery) return [];
    if (trimmedQuery.length < 2) {
      return searchableItems
        .filter((item) => includesMatch(item, trimmedQuery))
        .slice(0, RESULT_LIMIT);
    }

    return fuse.search(trimmedQuery, { limit: RESULT_LIMIT }).map((match) => match.item);
  }, [fuse, searchableItems, trimmedQuery, workspaceId]);

  const suggestions = useMemo(
    () => (workspaceId ? searchableItems.slice(0, RESULT_LIMIT) : []),
    [searchableItems, workspaceId],
  );

  return {
    results,
    suggestions,
    isLoading,
    error: visibleError,
    totalIndexed: workspaceId ? searchableItems.length : 0,
  };
}
