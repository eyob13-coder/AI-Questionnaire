import { create } from "zustand";
import axios from "axios";
import api, { apiGet, apiDelete, apiPatch, apiPost } from "@/lib/api";

export interface CitationItem {
  id: string;
  sourceDocument: string;
  pageNumber: number | null;
  excerpt: string | null;
}

export interface QuestionRow {
  id: string;
  rowIndex: number;
  questionText: string;
  answerText: string | null;
  confidence: number | null;
  status: "DRAFT" | "REVIEW" | "APPROVED" | string;
  auditorCritique?: string | null;
  verifiedFromVault?: boolean;
  citations: CitationItem[];
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
  isUnlocked?: boolean;
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
  isUnlocked?: boolean;
  roundTripPreserved?: boolean;
  createdAt: string;
}

export interface BillingInfo {
  plan: "FREE" | "PRO";
  isPro: boolean;
  exportCredits: number;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  pricing: {
    singlePass: { amountCents: number; currency: string; formatted: string };
    proMonthly: { amountCents: number; currency: string; formatted: string };
  };
  usage: {
    questionsThisMonth: number;
    questionnairesProcessed: number;
    limits: {
      questions: number;
      questionnaires: number;
      documents: number;
      members: number;
      price: string;
    };
  };
  recentOrders?: Array<{
    id: string;
    purchaseType: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

interface QuestionnaireState {
  questionnaires: QuestionnaireSummary[];
  currentQuestionnaire: QuestionnaireDetail | null;
  isLoading: boolean;
  isExporting: boolean;
  isSavingAnswer: boolean;
  isBulkApproving: boolean;
  isCreatingDemo: boolean;
  isCheckingOut: boolean;
  billingInfo: BillingInfo | null;
  error: string | null;

  fetchQuestionnaires: (workspaceId: string) => Promise<QuestionnaireSummary[]>;
  fetchQuestionnaireById: (workspaceId: string, id: string) => Promise<QuestionnaireDetail | null>;
  updateQuestion: (
    workspaceId: string,
    questionnaireId: string,
    questionId: string,
    data: { answerText?: string; status?: string; saveToVault?: boolean }
  ) => Promise<QuestionRow | null>;
  bulkApproveVerified: (
    workspaceId: string,
    questionnaireId: string
  ) => Promise<{ success: boolean; newlyApprovedCount: number; totalApprovedCount: number }>;
  createDemoSandbox: (workspaceId: string) => Promise<QuestionnaireSummary | null>;
  deleteQuestionnaire: (id: string, workspaceId?: string) => Promise<{ success: boolean; error?: string }>;
  exportQuestionnaire: (
    id: string,
    defaultName: string,
    workspaceId?: string
  ) => Promise<{ success: boolean; error?: string; isLocked?: boolean }>;
  fetchBillingInfo: (workspaceId: string) => Promise<BillingInfo | null>;
  createCheckout: (
    workspaceId: string,
    params: {
      purchaseType: "SINGLE_PASS" | "PRO_SUBSCRIPTION";
      questionnaireId?: string;
      successUrl?: string;
      returnUrl?: string;
    }
  ) => Promise<{ checkoutUrl: string; checkoutId: string }>;
  unlockWithCredit: (
    workspaceId: string,
    questionnaireId: string
  ) => Promise<{ success: boolean; isUnlocked: boolean; remainingCredits: number }>;
  openCustomerPortal: (workspaceId: string) => Promise<{ portalUrl: string }>;
}

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  questionnaires: [],
  currentQuestionnaire: null,
  isLoading: false,
  isExporting: false,
  isSavingAnswer: false,
  isBulkApproving: false,
  isCreatingDemo: false,
  isCheckingOut: false,
  billingInfo: null,
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

  fetchQuestionnaireById: async (workspaceId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiGet<QuestionnaireDetail>(
        `/workspaces/${workspaceId}/questionnaires/${id}`
      );
      set({ currentQuestionnaire: data, isLoading: false });
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load questionnaire";
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  updateQuestion: async (workspaceId, questionnaireId, questionId, data) => {
    set({ isSavingAnswer: true });
    try {
      const updated = await apiPatch<QuestionRow>(
        `/workspaces/${workspaceId}/questionnaires/${questionnaireId}/questions/${questionId}`,
        data
      );

      const current = get().currentQuestionnaire;
      if (current && current.id === questionnaireId) {
        const nextQuestions = current.questions.map((q) =>
          q.id === questionId ? { ...q, ...updated } : q
        );
        const approvedCount = nextQuestions.filter((q) => q.status === "APPROVED").length;
        const answeredCount = nextQuestions.filter(
          (q) => q.answerText && q.answerText.trim().length > 0
        ).length;

        set({
          currentQuestionnaire: {
            ...current,
            questions: nextQuestions,
            approvedCount,
            answeredCount,
          },
          isSavingAnswer: false,
        });
      } else {
        set({ isSavingAnswer: false });
      }

      return updated;
    } catch (err) {
      set({ isSavingAnswer: false });
      throw err;
    }
  },

  bulkApproveVerified: async (workspaceId, questionnaireId) => {
    set({ isBulkApproving: true });
    try {
      const result = await apiPost<{
        success: boolean;
        newlyApprovedCount: number;
        totalApprovedCount: number;
      }>(`/workspaces/${workspaceId}/questionnaires/${questionnaireId}/bulk-approve`);

      const current = get().currentQuestionnaire;
      if (current && current.id === questionnaireId) {
        const nextQuestions = current.questions.map((q) => {
          const conf = Math.round(q.confidence ?? 0);
          if (conf >= 85) {
            return { ...q, status: "APPROVED" as const };
          }
          return q;
        });

        const approvedCount = nextQuestions.filter((q) => q.status === "APPROVED").length;

        set({
          currentQuestionnaire: {
            ...current,
            questions: nextQuestions,
            approvedCount,
          },
          isBulkApproving: false,
        });
      } else {
        set({ isBulkApproving: false });
      }

      return result;
    } catch (err) {
      set({ isBulkApproving: false });
      throw err;
    }
  },

  createDemoSandbox: async (workspaceId: string) => {
    set({ isCreatingDemo: true });
    try {
      const demo = await apiPost<QuestionnaireSummary>(
        `/workspaces/${workspaceId}/questionnaires/demo-sandbox`
      );
      const existing = get().questionnaires;
      if (!existing.some((q) => q.id === demo.id)) {
        set({ questionnaires: [demo, ...existing], isCreatingDemo: false });
      } else {
        set({ isCreatingDemo: false });
      }
      return demo;
    } catch (err) {
      set({ isCreatingDemo: false });
      throw err;
    }
  },

  deleteQuestionnaire: async (id: string, workspaceId?: string) => {
    try {
      const url = workspaceId
        ? `/workspaces/${workspaceId}/questionnaires/${id}`
        : `/questionnaires/${id}`;
      await apiDelete(url);
      set({
        questionnaires: get().questionnaires.filter((q) => q.id !== id),
      });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete questionnaire";
      return { success: false, error: msg };
    }
  },

  exportQuestionnaire: async (
    id: string,
    defaultName: string,
    workspaceId?: string
  ) => {
    set({ isExporting: true });
    try {
      const url = workspaceId
        ? `/workspaces/${workspaceId}/questionnaires/${id}/export`
        : `/questionnaires/${id}/export`;
      const response = await api.get(url, {
        responseType: "blob",
      });

      const disposition = String(response.headers["content-disposition"] || "");
      const match = disposition.match(/filename="?([^";]+)"?/);
      const downloadName = match?.[1] || `${defaultName}_vaultix_export.xlsx`;

      const blob = new Blob([response.data], {
        type: String(
          response.headers["content-type"] ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      set({ isExporting: false });
      return { success: true };
    } catch (err: any) {
      set({ isExporting: false });
      const status = err?.response?.status;
      const isLocked = status === 402;
      let msg = "Failed to export questionnaire";

      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) msg = parsed.message;
        } catch {
          // ignore parsing error
        }
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      return { success: false, error: msg, isLocked };
    }
  },

  fetchBillingInfo: async (workspaceId: string) => {
    try {
      const data = await apiGet<BillingInfo>(`/workspaces/${workspaceId}/billing`);
      set({ billingInfo: data });
      return data;
    } catch {
      return null;
    }
  },

  createCheckout: async (
    workspaceId: string,
    params: {
      purchaseType: "SINGLE_PASS" | "PRO_SUBSCRIPTION";
      questionnaireId?: string;
      successUrl?: string;
      returnUrl?: string;
    }
  ) => {
    set({ isCheckingOut: true });
    try {
      const res = await apiPost<{
        checkoutUrl: string;
        checkoutId: string;
        clientSecret?: string;
      }>(`/workspaces/${workspaceId}/billing/checkout`, params);
      set({ isCheckingOut: false });
      return res;
    } catch (err) {
      set({ isCheckingOut: false });
      throw err;
    }
  },

  unlockWithCredit: async (workspaceId: string, questionnaireId: string) => {
    try {
      const res = await apiPost<{
        success: boolean;
        isUnlocked: boolean;
        remainingCredits: number;
      }>(`/workspaces/${workspaceId}/billing/questionnaires/${questionnaireId}/unlock`);

      const current = get().currentQuestionnaire;
      if (current && current.id === questionnaireId) {
        set({
          currentQuestionnaire: {
            ...current,
            isUnlocked: true,
          },
        });
      }

      // Also update billingInfo credit count if loaded
      const currentBilling = get().billingInfo;
      if (currentBilling) {
        set({
          billingInfo: {
            ...currentBilling,
            exportCredits: res.remainingCredits,
          },
        });
      }

      return res;
    } catch (err) {
      throw err;
    }
  },

  openCustomerPortal: async (workspaceId: string) => {
    try {
      const res = await apiPost<{ portalUrl: string }>(
        `/workspaces/${workspaceId}/billing/portal`
      );
      if (res?.portalUrl) {
        window.open(res.portalUrl, "_blank");
      }
      return res;
    } catch (err) {
      throw err;
    }
  },
}));

export default useQuestionnaireStore;
