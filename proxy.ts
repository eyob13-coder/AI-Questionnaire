import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";

const QUESTIONNAIRE_BASE_PATH = "/dashboard/questionnaires";
const QUESTIONNAIRE_PUBLIC_PATHS = new Set([
  QUESTIONNAIRE_BASE_PATH,
  `${QUESTIONNAIRE_BASE_PATH}/new`,
]);

function isProtectedQuestionnaireRoute(pathname: string): boolean {
  if (!pathname.startsWith(`${QUESTIONNAIRE_BASE_PATH}/`)) {
    return false;
  }

  return !QUESTIONNAIRE_PUBLIC_PATHS.has(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedQuestionnaireRoute(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(AUTH_SESSION_COOKIE)?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/questionnaires/:path*"],
};
