import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Vaultix",
  description: "Choose a new Vaultix password.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
