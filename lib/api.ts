import axios from "axios";

/**
 * Pre-configured Axios instance for all frontend → NestJS backend API calls.
 *
 * - Base URL from env: NEXT_PUBLIC_API_URL (default http://localhost:3001/api)
 * - Sends cookies cross-origin (withCredentials)
 * - Global error handling: 401 → redirect to /login
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ──
api.interceptors.request.use(
  (config) => {
    // In browser context, cookies are sent automatically via withCredentials.
    // For SSR/server context, you can manually attach the token here if needed.
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Redirect to login on authentication failure
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Convenience typed helpers ──

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
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return data;
}
