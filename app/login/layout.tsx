import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidatedBackendSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign In | Vaultix",
  description: "Sign in to your Vaultix workspace.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });
  const hasBackendSession = await hasValidatedBackendSession(headerStore);

  if (session && hasBackendSession) {
    redirect("/dashboard");
  }

  return children;
}
