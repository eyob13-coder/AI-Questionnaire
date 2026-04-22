import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Data Processing Addendum | Vaultix",
  description: "Vaultix Data Processing Addendum (DPA) request and processing terms.",
  alternates: { canonical: `${SITE_URL}/dpa` },
};

export default function DpaPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h1 className="font-heading text-4xl font-bold">Data Processing Addendum (DPA)</h1>
        <p className="text-light-2 leading-7">
          Vaultix provides a standard Data Processing Addendum for customers handling personal data subject to GDPR,
          UK GDPR, and similar privacy frameworks.
        </p>
        <p className="text-light-2 leading-7">
          To request a signed DPA, email{" "}
          <a className="text-brand hover:text-brand-light" href="mailto:legal@vaultix.app?subject=DPA%20Request">
            legal@vaultix.app
          </a>{" "}
          with your company legal entity name and billing workspace ID.
        </p>
      </div>
    </main>
  );
}
