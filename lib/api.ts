import axios, { type AxiosError } from "axios";

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
};

export interface ApiErrorInfo {
  message: string;
  status?: number;
  code?: string;
  isNetworkError: boolean;
  isTimeout: boolean;
}

/**
 * Pre-configured Axios instance for all frontend -> NestJS backend API calls.
 *
 * - Base URL from env: NEXT_PUBLIC_API_URL (default http://localhost:3001/api)
 * - Sends cookies cross-origin (withCredentials)
 * - Global error handling: 401 -> redirect to /login
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRedirectingToLogin = false;

function isLowQualityServerMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();

  if (!normalized) return true;

  return (
    normalized.startsWith("cannot get ") ||
    normalized.startsWith("cannot post ") ||
    normalized.startsWith("cannot put ") ||
    normalized.startsWith("cannot patch ") ||
    normalized.startsWith("cannot delete ") ||
    normalized.startsWith("request failed with status code ") ||
    normalized.includes("<!doctype html") ||
    normalized.includes("<html")
  );
}

function firstMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);
      if (message) return message;
    }
  }

  return null;
}

function readServerMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") {
    const message = firstMessage(data);
    if (!message || isLowQualityServerMessage(message)) {
      return null;
    }
    return message;
  }

  if (typeof data === "object") {
    const body = data as ApiErrorBody;
    const message = firstMessage(body.message) || firstMessage(body.error);
    if (!message || isLowQualityServerMessage(message)) {
      return null;
    }
    return message;
  }

  return null;
}

function statusMessage(status: number): string {
  if (status === 400) {
    return "The request could not be completed. Please review your input and try again.";
  }
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested resource could not be found.";
  }
  if (status === 408) {
    return "The request timed out. Please try again.";
  }
  if (status === 409) {
    return "This action could not be completed due to a conflict. Refresh and try again.";
  }
  if (status === 413) {
    return "The uploaded file is too large. Please use a smaller file and try again.";
  }
  if (status === 422) {
    return "Some details are invalid. Please review the form and try again.";
  }
  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "Our server is temporarily unavailable. Please try again in a moment.";
  }

  return "Something went wrong. Please try again.";
}

function looksTechnicalMessage(message: string): boolean {
  return /request failed with status code|network error|econn|socket|tls|axioserror|fetch failed|internal server error|stack|exception/i.test(
    message,
  );
}

function mapUploadMessage(message: string): string | null {
  if (/file too large|max.?size|payload too large/i.test(message)) {
    return "This file is too large. Please upload a smaller file and try again.";
  }

  if (/unexpected field|multipart|invalid multipart/i.test(message)) {
    return "The uploaded file format is invalid. Please select a supported file and try again.";
  }

  if (/unsupported|invalid file|invalid mime|mimetype/i.test(message)) {
    return "This file type is not supported. Please upload a supported file format.";
  }

  if (/current file type|expected type|validation failed/i.test(message)) {
    return "This file type is not supported. Please upload a valid file and try again.";
  }

  return null;
}

function sanitizeServerMessage(serverMessage: string | null, status?: number): string | null {
  if (!serverMessage) return null;

  const trimmed = serverMessage.trim();
  if (!trimmed) return null;

  const mappedUploadMessage = mapUploadMessage(trimmed);
  if (mappedUploadMessage) return mappedUploadMessage;

  // For server-side failures, never expose raw backend internals.
  if (typeof status === "number" && status >= 500) {
    return null;
  }

  if (looksTechnicalMessage(trimmed)) {
    return null;
  }

  return trimmed;
}

function toApiErrorInfo(error: unknown, fallback?: string): ApiErrorInfo {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) {
      return {
        message: error.message,
        isNetworkError: false,
        isTimeout: false,
      };
    }

    return {
      message: fallback || "Something went wrong. Please try again.",
      isNetworkError: false,
      isTimeout: false,
    };
  }

  const status = error.response?.status;
  const code = error.code;
  const isTimeout = code === "ECONNABORTED";
  const isNetworkError = !error.response;

  if (isTimeout) {
    return {
      message: "The request timed out. Please check your connection and try again.",
      status,
      code,
      isNetworkError,
      isTimeout: true,
    };
  }

  if (isNetworkError) {
    const offline =
      typeof navigator !== "undefined" &&
      typeof navigator.onLine === "boolean" &&
      !navigator.onLine;

    return {
      message: offline
        ? "You're offline. Reconnect to the internet and try again."
        : "We can't reach the backend right now. Please check your connection and confirm the API service is running.",
      status,
      code,
      isNetworkError: true,
      isTimeout: false,
    };
  }

  const serverMessage = sanitizeServerMessage(readServerMessage(error.response?.data), status);
  const fallbackMessage = status ? statusMessage(status) : "Something went wrong. Please try again.";

  return {
    message: serverMessage || fallback || fallbackMessage,
    status,
    code,
    isNetworkError: false,
    isTimeout: false,
  };
}

export function formatApiError(error: unknown, fallback?: string): string {
  return toApiErrorInfo(error, fallback).message;
}

export function getApiErrorInfo(error: unknown, fallback?: string): ApiErrorInfo {
  return toApiErrorInfo(error, fallback);
}

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = toApiErrorInfo(error);
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (axios.isAxiosError(error)) {
      const mutableError = error as AxiosError & { userMessage?: string; status?: number };
      mutableError.message = normalized.message;
      mutableError.userMessage = normalized.message;
      mutableError.status = normalized.status;
    }

    if (typeof window !== "undefined" && status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === "/login" || currentPath === "/register";

      if (!isAuthPage && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        const nextPath = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Convenience typed helpers
export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<T>(url, body);
  return data;
}

export async function apiPut<T>(url: string, body?: unknown) {
  const { data } = await api.put<T>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await api.patch<T>(url, body);
  return data;
}

export async function apiDelete<T>(url: string) {
  const { data } = await api.delete<T>(url);
  return data;
}

/**
 * Upload a file via multipart/form-data.
 * Usage: apiUpload('/workspaces/xxx/knowledge/upload', file)
 */
export async function apiUpload<T>(
  url: string,
  file: File,
  fieldName = "file",
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData();
  formData.append(fieldName, file);

  const { data } = await api.post<T>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return data;
}
