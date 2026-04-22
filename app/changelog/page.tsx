import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Changelog | Vaultix",
  description: "Latest product updates and improvements in Vaultix.",
  alternates: { canonical: `${SITE_URL}/changelog` },
};

const releases = [
  {
    version: "v1.8.0",
    date: "April 2026",
    notes: [
      "Added dynamic questionnaire route protection for authenticated sessions.",
      "Improved landing page with proof, differentiation, and resource center sections.",
      "Added production SEO setup (robots, sitemap, manifest, metadata hardening).",
    ],
  },
  {
    version: "v1.7.0",
    date: "March 2026",
    notes: [
      "Expanded review workflow UI for answer approval and citation visibility.",
      "Added legal pages for Terms of Service and Privacy Policy.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h1 className="font-heading text-4xl font-bold">Changelog</h1>
        {releases.map((release) => (
          <section key={release.version} className="rounded-2xl border border-white/[0.08] bg-dark-2/60 p-6">
            <p className="text-sm text-light-4 mb-2">{release.date}</p>
            <h2 className="font-heading text-xl font-semibold mb-4">{release.version}</h2>
            <ul className="list-disc pl-5 space-y-2 text-light-2">
              {release.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
