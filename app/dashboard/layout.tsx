import type { Metadata } from "next";
import DashboardLayoutShell from "@/components/layout/dashboard-layout-shell";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Vaultix",
  description: "Vaultix workspace dashboard for managing questionnaires and knowledge.",
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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();

  const session = await auth.api.getSession({
    headers: headerStore,
  });

  if (!session) {
    redirect("/login?next=/dashboard");
  }

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
