import type { Metadata } from "next";

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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
