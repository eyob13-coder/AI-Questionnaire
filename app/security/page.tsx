import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Security | Vaultix",
  description: "Vaultix security overview, controls, and reporting channels.",
  alternates: { canonical: `${SITE_URL}/security` },
};

const controls = [
  "Encryption in transit (TLS 1.2+) and at rest (AES-256)",
  "Role-based access controls with least-privilege principles",
  "Comprehensive audit trails for workspace and answer events",
  "Security monitoring and incident response procedures",
  "Data retention controls and deletion workflows",
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h1 className="font-heading text-4xl font-bold">Security</h1>
        <p className="text-light-2 leading-7">
          Vaultix is designed for enterprise security workflows and compliance reviews. Below is a high-level summary
          of our baseline controls.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-light-2">
          {controls.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-light-2 leading-7">
          To report a vulnerability, contact{" "}
          <a className="text-brand hover:text-brand-light" href="mailto:security@vaultix.app">
            security@vaultix.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
