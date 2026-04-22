import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact | Vaultix",
  description: "Contact Vaultix sales, support, and security teams.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

const contacts = [
  { label: "Sales", value: "sales@vaultix.app" },
  { label: "Support", value: "hello@vaultix.app" },
  { label: "Security", value: "security@vaultix.app" },
  { label: "Legal", value: "legal@vaultix.app" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="font-heading text-4xl font-bold mb-8">Contact Vaultix</h1>
        <div className="rounded-2xl border border-white/[0.08] bg-dark-2/60 divide-y divide-white/[0.06]">
          {contacts.map((entry) => (
            <div key={entry.label} className="px-6 py-5 flex items-center justify-between gap-4">
              <p className="text-light-2">{entry.label}</p>
              <a className="text-brand hover:text-brand-light font-medium" href={`mailto:${entry.value}`}>
                {entry.value}
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
