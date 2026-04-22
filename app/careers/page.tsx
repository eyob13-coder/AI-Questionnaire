import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Careers | Vaultix",
  description: "Join Vaultix and build the future of security questionnaire automation.",
  alternates: { canonical: `${SITE_URL}/careers` },
};

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h1 className="font-heading text-4xl font-bold">Careers</h1>
        <p className="text-light-2 leading-7">
          We are building products that unblock security teams and accelerate go-to-market cycles.
        </p>
        <p className="text-light-2 leading-7">
          Interested in joining? Send your resume and portfolio to{" "}
          <a className="text-brand hover:text-brand-light" href="mailto:careers@vaultix.app">
            careers@vaultix.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
