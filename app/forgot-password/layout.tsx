import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Vaultix",
  description: "Reset your Vaultix password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
