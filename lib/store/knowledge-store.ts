import { create } from "zustand";
import axios from "axios";
import { apiGet, apiDelete, apiPost } from "@/lib/api";

export interface KnowledgeDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
  pageCount?: number | null;
  _count?: {
    chunks: number;
  };
}

interface KnowledgeState {
  documents: KnowledgeDocument[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  fetchDocuments: (workspaceId: string) => Promise<KnowledgeDocument[]>;
  deleteDocument: (workspaceId: string, id: string) => Promise<{ success: boolean; error?: string }>;
  triggerTechSync: (workspaceId: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  documents: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchDocuments: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      let items: KnowledgeDocument[] = [];
      const res = await axios
        .get<KnowledgeDocument[]>(`/api/knowledge?workspaceId=${workspaceId}`, {
          validateStatus: () => true,
        })
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300 && Array.isArray(res.data)) {
        items = res.data;
      } else {
        items = await apiGet<KnowledgeDocument[]>(`/workspaces/${workspaceId}/knowledge`);
      }

      set({ documents: items, isLoading: false });
      return items;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load knowledge documents";
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  deleteDocument: async (workspaceId: string, id: string) => {
    try {
      await apiDelete(`/workspaces/${workspaceId}/knowledge/${id}`);
      set({
        documents: get().documents.filter((d) => d.id !== id),
      });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete document";
      return { success: false, error: msg };
    }
  },

  triggerTechSync: async (workspaceId: string) => {
    set({ isSyncing: true, error: null });
    try {
      const result = await apiPost(`/workspaces/${workspaceId}/knowledge/tech-sync`, {});
      await get().fetchDocuments(workspaceId);
      set({ isSyncing: false });
      return { success: true, data: result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sync technical codebase";
      set({ isSyncing: false, error: msg });
      return { success: false, error: msg };
    }
  },
}));

export default useKnowledgeStore;
