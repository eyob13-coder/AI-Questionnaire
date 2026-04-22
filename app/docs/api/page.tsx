import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "API Docs | Vaultix",
  description: "Vaultix API quick reference for auth, questionnaires, knowledge, and exports.",
  alternates: { canonical: `${SITE_URL}/docs/api` },
};

const endpoints = [
  { method: "POST", path: "/v1/auth/login", description: "Authenticate a user session." },
  { method: "POST", path: "/v1/questionnaires/upload", description: "Upload and parse questionnaire files." },
  { method: "POST", path: "/v1/questionnaires/:id/generate", description: "Generate AI answers with citations." },
  { method: "GET", path: "/v1/questionnaires/:id/answers", description: "Fetch answer rows for review UI." },
  { method: "POST", path: "/v1/knowledge/upload", description: "Upload knowledge base documents." },
  { method: "GET", path: "/v1/exports", description: "List generated exports." },
];

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div>
          <h1 className="font-heading text-4xl font-bold">API Docs</h1>
          <p className="text-light-2 mt-2">
            Quick reference for frontend integration. For full spec, expose your backend OpenAPI definition.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="px-5 py-4 border-b border-white/[0.06] last:border-b-0 bg-dark-2/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand/10 text-brand">{endpoint.method}</span>
                <code className="text-sm text-light">{endpoint.path}</code>
              </div>
              <p className="text-sm text-light-3 mt-1">{endpoint.description}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-light-3">
          Need implementation help?{" "}
          <Link href="/contact" className="text-brand hover:text-brand-light">
            Contact engineering support
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
