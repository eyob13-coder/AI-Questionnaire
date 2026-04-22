import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | Vaultix",
  description:
    "Vaultix Privacy Policy describing what personal data we collect, how we use it, how long we keep it, and your rights.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

type PrivacySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const effectiveDate = "April 21, 2026";

const sections: PrivacySection[] = [
  {
    title: "1. Scope and Controller",
    paragraphs: [
      "This Privacy Policy explains how Vaultix (\"Vaultix\", \"we\", \"us\", or \"our\") collects, uses, discloses, and protects personal data when you use our website, applications, APIs, and related services (the \"Services\").",
      "For purposes of applicable privacy laws, Vaultix is the data controller for personal data collected directly from users. Where we process personal data on behalf of customers, we act as a data processor.",
    ],
  },
  {
    title: "2. Personal Data We Collect",
    paragraphs: [
      "We collect personal data that you provide directly, data generated through use of the Services, and limited data from third parties.",
    ],
    bullets: [
      "Account and profile data: name, work email, company, role, authentication credentials, and account preferences.",
      "Customer Content: uploaded documents, questionnaire files, prompts, review edits, and exported files.",
      "Usage data: features used, timestamps, event logs, error reports, device/browser details, and IP address.",
      "Billing data: subscription plan and payment status (card details are processed by certified payment providers, not stored directly by Vaultix).",
      "Support data: communications with our support, sales, or security teams.",
    ],
  },
  {
    title: "3. How We Use Personal Data",
    paragraphs: [
      "We use personal data to provide, maintain, secure, and improve the Services.",
    ],
    bullets: [
      "Authenticate users, create accounts, and manage workspace access.",
      "Process files and generate AI-assisted outputs, including citations and confidence scoring.",
      "Operate collaboration, audit logging, exports, and workspace administration features.",
      "Send transactional notices, billing updates, product communications, and service alerts.",
      "Monitor performance, detect abuse, prevent fraud, and enforce our Terms.",
      "Comply with legal obligations and respond to lawful requests.",
    ],
  },
  {
    title: "4. Legal Bases (EEA/UK Users)",
    paragraphs: [
      "Where GDPR or equivalent laws apply, our legal bases include: (a) performance of a contract; (b) legitimate interests (for example service security and product improvement); (c) compliance with legal obligations; and (d) consent where required.",
    ],
  },
  {
    title: "5. AI Processing and Human Review",
    paragraphs: [
      "To provide AI functionality, selected Customer Content may be processed by trusted model and infrastructure providers acting under contractual obligations.",
      "We implement controls to reduce misuse, and we restrict internal access to Customer Content to authorized personnel who need access for support, security, or legal compliance.",
      "You are responsible for validating AI outputs before relying on them for legal or compliance decisions.",
    ],
  },
  {
    title: "6. Sharing and Disclosure",
    paragraphs: [
      "We do not sell personal data. We may disclose personal data only as described below:",
    ],
    bullets: [
      "Service providers and subprocessors supporting hosting, storage, analytics, billing, customer support, and AI infrastructure.",
      "Within your organization, according to workspace role permissions.",
      "In connection with mergers, acquisitions, financing, or sale of assets, subject to confidentiality safeguards.",
      "To comply with law, enforce rights, protect safety, or respond to valid legal process.",
    ],
  },
  {
    title: "7. International Data Transfers",
    paragraphs: [
      "Vaultix may process data in multiple countries. Where required, we use recognized transfer safeguards such as standard contractual clauses and equivalent protections.",
    ],
  },
  {
    title: "8. Data Retention",
    paragraphs: [
      "We retain personal data for as long as needed to provide the Services, comply with legal obligations, resolve disputes, and enforce agreements.",
      "Customers may configure retention settings for certain uploaded files. Backups and security logs may persist for a limited additional period.",
    ],
  },
  {
    title: "9. Security Measures",
    paragraphs: [
      "We use administrative, technical, and organizational safeguards designed to protect personal data, including encryption in transit, access controls, and security monitoring.",
      "No system is completely secure. You should use strong passwords, enable available security controls, and notify us immediately of suspected account compromise.",
    ],
  },
  {
    title: "10. Cookies and Similar Technologies",
    paragraphs: [
      "We use cookies and similar technologies for authentication, security, session management, and product analytics.",
      "You can manage certain cookie preferences in your browser settings. Disabling some cookies may affect service functionality.",
    ],
  },
  {
    title: "11. Your Privacy Rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, or export your personal data, and to object to or restrict specific processing activities.",
    ],
    bullets: [
      "EEA/UK: rights under GDPR, including access, rectification, erasure, portability, and objection.",
      "California: rights to know, delete, and correct personal information and to receive equal service without discrimination.",
      "You may submit requests by emailing privacy@vaultix.app. We may need to verify your identity before completing requests.",
    ],
  },
  {
    title: "12. Children's Privacy",
    paragraphs: [
      "The Services are not directed to children under 16, and we do not knowingly collect personal data from children under 16. If you believe a child has provided personal data, contact us so we can take appropriate action.",
    ],
  },
  {
    title: "13. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy periodically. If changes are material, we will provide notice through the Services or by email. The updated policy becomes effective on the date stated at the top of this page.",
    ],
  },
  {
    title: "14. Contact Us",
    paragraphs: [
      "For privacy questions or requests, contact: privacy@vaultix.app",
      "For legal notices, contact: legal@vaultix.app",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="border-b border-white/[0.08] bg-dark-2/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/register" className="text-sm text-brand hover:text-brand-light transition-colors">
            Back to Register
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-3">Privacy Policy</h1>
          <p className="text-sm text-light-3 mt-2">Effective date: {effectiveDate}</p>
          <p className="text-sm text-light-2 mt-4">
            This policy should be read together with our{" "}
            <Link href="/terms" className="text-brand hover:text-brand-light transition-colors">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-7">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-white/[0.08] bg-dark-2/40 p-6">
            <h2 className="font-heading text-xl font-semibold">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-light-2">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-5 space-y-2">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
