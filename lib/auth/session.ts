import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";
import { serverFetchRaw } from "@/lib/api-server";

export function hasRequestSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(AUTH_SESSION_COOKIE)?.value);
}

export async function hasServerSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}

export async function hasValidatedBackendSession(
  requestHeaders: Headers,
): Promise<boolean> {
  const cookieHeader = requestHeaders.get("cookie");

  if (!cookieHeader) {
    return false;
  }

  try {
    const response = await serverFetchRaw("GET", "/auth/me", {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
