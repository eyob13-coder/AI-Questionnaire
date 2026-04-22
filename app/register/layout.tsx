import type { Metadata } from "next";

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

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
