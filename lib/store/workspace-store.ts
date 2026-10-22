import { create } from "zustand";
import axios from "axios";
import { apiGet, apiPost } from "@/lib/api";

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  _count?: {
    questionnaires?: number;
    documents?: number;
    members?: number;
  };
}

interface WorkspaceState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;

  setActiveWorkspaceId: (id: string) => void;
  fetchWorkspaces: () => Promise<WorkspaceItem[]>;
  createWorkspace: (name: string) => Promise<{ success: boolean; workspace?: WorkspaceItem; error?: string }>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId:
    typeof window !== "undefined"
      ? localStorage.getItem("vaultix.activeWorkspaceId")
      : null,
  isLoading: false,
  error: null,

  setActiveWorkspaceId: (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vaultix.activeWorkspaceId", id);
    }
    set({ activeWorkspaceId: id });
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Try dedicated route via axios
      let items: WorkspaceItem[] = [];
      const res = await axios
        .get<WorkspaceItem[]>("/api/workspaces", { validateStatus: () => true })
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300 && Array.isArray(res.data)) {
        items = res.data;
      } else {
        // Fallback to backend /v1/workspaces
        items = await apiGet<WorkspaceItem[]>("/workspaces");
      }

      const currentActive = get().activeWorkspaceId;
      const validActive = items.find((w) => w.id === currentActive) ? currentActive : items[0]?.id || null;

      if (validActive && validActive !== currentActive) {
        get().setActiveWorkspaceId(validActive);
      }

      set({ workspaces: items, isLoading: false, activeWorkspaceId: validActive });
      return items;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load workspaces";
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  createWorkspace: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      let created: WorkspaceItem | null = null;
      const res = await axios
        .post<WorkspaceItem>("/api/workspaces", { name }, { validateStatus: () => true })
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300 && res.data) {
        created = res.data;
      } else {
        created = await apiPost<WorkspaceItem>("/workspaces", { name });
      }

      if (created) {
        const nextList = [created, ...get().workspaces];
        get().setActiveWorkspaceId(created.id);
        set({ workspaces: nextList, isLoading: false });
        return { success: true, workspace: created };
      }

      throw new Error("Server returned no workspace data");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create client vault";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },
}));

export default useWorkspaceStore;
