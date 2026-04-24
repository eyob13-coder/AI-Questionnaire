/**
 * Server-side API helpers for Next.js server components and route handlers.
 *
 * These mirror the client-side helpers in `lib/api.ts` but use native `fetch`
 * so they are safe to call from server components, `generateMetadata`, and
 * middleware.  They share the same `NEXT_PUBLIC_API_URL` base URL so every
 * backend call goes through a single, consistent origin.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ServerFetchOptions {
  /** Extra headers to forward (e.g. cookies). */
  headers?: HeadersInit;
  /** Next.js fetch cache strategy. Defaults to the framework default. */
  cache?: RequestCache;
  /** ISR revalidation period in seconds. */
  revalidate?: number | false;
  /** Next.js fetch tags for on-demand revalidation. */
  tags?: string[];
}

async function serverFetch<T>(
  method: string,
  path: string,
  body?: unknown,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { headers, cache, revalidate, tags } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache,
    next:
      revalidate !== undefined || tags
        ? { revalidate: revalidate as number, tags }
        : undefined,
  });

  if (!res.ok) {
    throw new Error(
      `API ${method} ${path} failed with status ${res.status}`,
    );
  }

  // Handle 204 No Content
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// ── Convenience helpers ──────────────────────────────────────────────

export async function serverGet<T>(
  path: string,
  options?: ServerFetchOptions,
): Promise<T> {
  return serverFetch<T>("GET", path, undefined, options);
}

export async function serverPost<T>(
  path: string,
  body?: unknown,
  options?: ServerFetchOptions,
): Promise<T> {
  return serverFetch<T>("POST", path, body, options);
}

export async function serverPut<T>(
  path: string,
  body?: unknown,
  options?: ServerFetchOptions,
): Promise<T> {
  return serverFetch<T>("PUT", path, body, options);
}

export async function serverPatch<T>(
  path: string,
  body?: unknown,
  options?: ServerFetchOptions,
): Promise<T> {
  return serverFetch<T>("PATCH", path, body, options);
}

export async function serverDelete<T>(
  path: string,
  options?: ServerFetchOptions,
): Promise<T> {
  return serverFetch<T>("DELETE", path, undefined, options);
}

/**
 * Low-level server fetch that returns the raw Response.
 * Useful when you only need to check `res.ok` without parsing JSON
 * (e.g. session validation).
 */
export async function serverFetchRaw(
  method: string,
  path: string,
  options: ServerFetchOptions = {},
): Promise<Response> {
  const { headers, cache } = options;

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(headers as Record<string, string>),
    },
    cache,
  });
}
