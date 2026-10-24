import type { Metadata, Viewport } from "next";
import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vaultix - Complete Security Questionnaires 10x Faster",
    template: "%s | Vaultix",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Vaultix - Complete Security Questionnaires 10x Faster",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Vaultix Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaultix - Complete Security Questionnaires 10x Faster",
    description: SITE_DESCRIPTION,
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0b0f14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          theme="dark"
          closeButton
          toastOptions={{
            style: {
              background: "#121215",
              color: "#FAFAFA",
              border: "none",
              boxShadow: "0 16px 36px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
