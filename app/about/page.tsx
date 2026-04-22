import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About | Vaultix",
  description: "Learn about Vaultix and how we help security teams complete questionnaires faster.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h1 className="font-heading text-4xl font-bold">About Vaultix</h1>
        <p className="text-light-2 leading-7">
          Vaultix helps security and compliance teams answer vendor questionnaires with trustworthy AI responses,
          citations, and confidence scoring.
        </p>
        <p className="text-light-2 leading-7">
          Our focus is simple: reduce review cycles without sacrificing accuracy, security, or auditability.
        </p>
        <Link href="/register" className="inline-flex px-5 py-2.5 rounded-full bg-brand text-white font-semibold">
          Start free trial
        </Link>
      </div>
    </main>
  );
}
