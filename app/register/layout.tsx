import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidatedBackendSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Start Free Trial | Vaultix",
  description: "Create your Vaultix account and start automating security questionnaires.",
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

export default async function RegisterLayout({
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
