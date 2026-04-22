type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  statusText?: string;
};

const NETWORK_PATTERNS = [
  "network error",
  "failed to fetch",
  "fetch failed",
  "load failed",
  "err_network",
  "ecconnrefused",
  "econnrefused",
  "connection refused",
];

function messageContainsNetworkHint(message?: string) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return NETWORK_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function formatAuthError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const offline =
    typeof navigator !== "undefined" &&
    typeof navigator.onLine === "boolean" &&
    !navigator.onLine;

  if (offline) {
    return "You're offline. Reconnect to the internet and try again.";
  }

  const authError = (error ?? {}) as AuthErrorLike;
  const status = authError.status;
  const message = authError.message;

  if (status === 401) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  if (status && status >= 500) {
    return "Authentication service is temporarily unavailable. Please try again shortly.";
  }

  if (messageContainsNetworkHint(message) || authError.code === "ERR_NETWORK") {
    return "We can't reach the server right now. Check your connection and make sure the backend is running.";
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return fallback;
}

export function getOfflineMessage() {
  return "You're offline. Reconnect to continue.";
}
