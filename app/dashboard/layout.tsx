import type { Metadata } from "next";
import DashboardLayoutShell from "@/components/layout/dashboard-layout-shell";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
