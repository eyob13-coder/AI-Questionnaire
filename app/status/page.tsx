import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Status | Vaultix",
  description: "Current status of Vaultix platform services.",
  alternates: { canonical: `${SITE_URL}/status` },
};

const services = [
  { name: "Application", status: "Operational" },
  { name: "API", status: "Operational" },
  { name: "Document Processing", status: "Operational" },
  { name: "Exports", status: "Operational" },
  { name: "Authentication", status: "Operational" },
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h1 className="font-heading text-4xl font-bold">System Status</h1>
        <div className="rounded-2xl border border-white/[0.08] bg-dark-2/60 divide-y divide-white/[0.06]">
          {services.map((service) => (
            <div key={service.name} className="px-6 py-4 flex items-center justify-between">
              <p className="text-light-2">{service.name}</p>
              <p className="inline-flex items-center gap-2 text-success text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success" />
                {service.status}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-light-3">No active incidents reported.</p>
      </div>
    </main>
  );
}
