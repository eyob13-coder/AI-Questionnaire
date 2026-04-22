import type { Metadata } from "next";
import LandingPageClient from "@/app/landing-page-client";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Vaultix - Complete Security Questionnaires 10x Faster",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Vaultix - Complete Security Questionnaires 10x Faster",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Vaultix",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaultix - Complete Security Questionnaires 10x Faster",
    description: SITE_DESCRIPTION,
    images: ["/logo.svg"],
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
