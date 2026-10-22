import { create } from "zustand";
import axios from "axios";
import api, { apiGet, apiDelete } from "@/lib/api";

export interface QuestionRow {
  id: string;
  rowIndex: number;
  questionText: string;
  answerText: string | null;
  confidence: number | null;
  status: "DRAFT" | "REVIEW" | "APPROVED" | string;
  citations: Array<{
    id: string;
    sourceDocument: string;
    pageNumber: number | null;
    excerpt: string | null;
  }>;
}

export interface QuestionnaireDetail {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  status: string;
  totalQuestions: number;
  answeredCount: number;
  approvedCount: number;
  roundTripPreserved?: boolean;
  createdAt: string;
  questions: QuestionRow[];
}

export interface QuestionnaireSummary {
  id: string;
  name: string;
  fileName: string;
  status: string;
  totalQuestions: number;
  answeredCount: number;
  approvedCount: number;
  roundTripPreserved?: boolean;
  createdAt: string;
}

interface QuestionnaireState {
  questionnaires: QuestionnaireSummary[];
  currentQuestionnaire: QuestionnaireDetail | null;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;

  fetchQuestionnaires: (workspaceId: string) => Promise<QuestionnaireSummary[]>;
  fetchQuestionnaireById: (id: string) => Promise<QuestionnaireDetail | null>;
  deleteQuestionnaire: (id: string) => Promise<{ success: boolean; error?: string }>;
  exportQuestionnaire: (id: string, defaultName: string) => Promise<{ success: boolean; error?: string }>;
}

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  questionnaires: [],
  currentQuestionnaire: null,
  isLoading: false,
  isExporting: false,
  error: null,

  fetchQuestionnaires: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      let items: QuestionnaireSummary[] = [];
      const res = await axios
        .get<QuestionnaireSummary[]>(`/api/questionnaires?workspaceId=${workspaceId}`, {
          validateStatus: () => true,
        })
        .catch(() => null);

      if (res && res.status >= 200 && res.status < 300 && Array.isArray(res.data)) {
        items = res.data;
      } else {
        items = await apiGet<QuestionnaireSummary[]>(`/workspaces/${workspaceId}/questionnaires`);
      }

      set({ questionnaires: items, isLoading: false });
      return items;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load questionnaires";
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  fetchQuestionnaireById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGet<QuestionnaireDetail>(`/questionnaires/${id}`);
      set({ currentQuestionnaire: data, isLoading: false });
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load questionnaire";
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  deleteQuestionnaire: async (id: string) => {
    try {
      await apiDelete(`/questionnaires/${id}`);
      set({
        questionnaires: get().questionnaires.filter((q) => q.id !== id),
      });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete questionnaire";
      return { success: false, error: msg };
    }
  },

  exportQuestionnaire: async (id: string, defaultName: string) => {
    set({ isExporting: true });
    try {
      const response = await api.get(`/questionnaires/${id}/export`, {
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^";]+)"?/);
      const downloadName = match?.[1] || `${defaultName}_vaultix_export.xlsx`;

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      set({ isExporting: false });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export questionnaire";
      set({ isExporting: false });
      return { success: false, error: msg };
    }
  },
}));

export default useQuestionnaireStore;
