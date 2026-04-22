import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service | Vaultix",
  description:
    "Vaultix Terms of Service covering account use, subscriptions, acceptable use, data handling, and legal terms.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

type TermsSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const effectiveDate = "April 21, 2026";

const sections: TermsSection[] = [
  {
    title: "1. Agreement and Scope",
    paragraphs: [
      "These Terms of Service (\"Terms\") are a binding agreement between you and Vaultix (\"Vaultix\", \"we\", \"us\", or \"our\") governing your access to and use of the Vaultix website, applications, APIs, and related services (collectively, the \"Services\").",
      "By creating an account, clicking an acceptance button, or using the Services, you agree to these Terms. If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization, and \"you\" includes that organization.",
    ],
  },
  {
    title: "2. Eligibility and Accounts",
    paragraphs: [
      "You must be at least 18 years old and legally able to enter into contracts. You are responsible for all activity under your account and for maintaining the confidentiality of your login credentials.",
      "You must provide accurate registration information and keep it current. You must promptly notify us at legal@vaultix.app of any unauthorized account use or security incident.",
    ],
  },
  {
    title: "3. Service Access and License",
    paragraphs: [
      "Subject to these Terms, Vaultix grants you a limited, non-exclusive, non-transferable, revocable right to access and use the Services for your internal business purposes.",
      "You may not copy, resell, lease, distribute, or create derivative works of the Services except as expressly permitted in writing by Vaultix.",
    ],
  },
  {
    title: "4. Acceptable Use",
    paragraphs: [
      "You agree not to misuse the Services, interfere with operation, or access the Services through unauthorized means.",
    ],
    bullets: [
      "Do not upload malicious code, viruses, or harmful content.",
      "Do not attempt to bypass security, rate limits, or access controls.",
      "Do not use the Services for unlawful, fraudulent, or deceptive activity.",
      "Do not submit content that infringes intellectual property or privacy rights.",
      "Do not use the Services to train competing models using Vaultix outputs unless expressly authorized.",
    ],
  },
  {
    title: "5. Customer Content and Data",
    paragraphs: [
      "You retain ownership of content, files, prompts, questionnaire data, and materials you submit to the Services (\"Customer Content\"). You grant Vaultix a limited license to host, process, transmit, and display Customer Content solely to provide, secure, and improve the Services.",
      "You are responsible for ensuring you have all rights and permissions needed to submit Customer Content and for your compliance with applicable data protection laws.",
      "Our handling of personal data is described in the Privacy Policy.",
    ],
  },
  {
    title: "6. AI Features and Outputs",
    paragraphs: [
      "The Services may generate draft responses, confidence scores, summaries, and recommendations (\"Outputs\"). Outputs are generated algorithmically and may be inaccurate, incomplete, or outdated.",
      "You are solely responsible for reviewing and validating Outputs before relying on them for legal, compliance, security, or business decisions. Vaultix does not provide legal advice.",
    ],
  },
  {
    title: "7. Fees, Billing, and Taxes",
    paragraphs: [
      "Paid plans are billed in advance on a recurring basis according to your selected plan. Unless otherwise stated, fees are non-refundable except where required by law.",
      "You authorize Vaultix and its payment processors to charge the payment method on file for subscription and usage fees, plus applicable taxes.",
      "You are responsible for all applicable taxes, duties, and government charges other than taxes based on Vaultix net income.",
    ],
  },
  {
    title: "8. Suspension and Termination",
    paragraphs: [
      "You may stop using the Services at any time. Vaultix may suspend or terminate access immediately if you materially breach these Terms, pose security risk, or use the Services unlawfully.",
      "Upon termination, your right to use the Services ends. We may delete or anonymize Customer Content in accordance with our retention obligations and applicable law.",
    ],
  },
  {
    title: "9. Intellectual Property",
    paragraphs: [
      "Vaultix and its licensors own all rights, title, and interest in and to the Services, including software, models, interfaces, trademarks, and related intellectual property.",
      "No ownership rights are transferred to you under these Terms.",
    ],
  },
  {
    title: "10. Confidentiality",
    paragraphs: [
      "Each party may receive non-public information from the other party. The receiving party will protect confidential information using reasonable care and use it only to perform or exercise rights under these Terms.",
      "Confidentiality obligations do not apply to information that is public through no fault of the receiving party, already known without restriction, independently developed, or rightfully obtained from a third party.",
    ],
  },
  {
    title: "11. Security",
    paragraphs: [
      "Vaultix implements administrative, technical, and organizational security measures designed to protect the Services and Customer Content.",
      "No security safeguards are perfect. You acknowledge that use of online services involves inherent risk.",
    ],
  },
  {
    title: "12. Disclaimer of Warranties",
    paragraphs: [
      "THE SERVICES ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE.\" TO THE MAXIMUM EXTENT PERMITTED BY LAW, VAULTIX DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE.",
    ],
  },
  {
    title: "13. Limitation of Liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, VAULTIX WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL.",
      "VAULTIX AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THE SERVICES OR THESE TERMS WILL NOT EXCEED THE AMOUNT PAID BY YOU TO VAULTIX FOR THE SERVICES IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO LIABILITY.",
    ],
  },
  {
    title: "14. Indemnification",
    paragraphs: [
      "You will defend, indemnify, and hold harmless Vaultix and its affiliates, officers, directors, employees, and agents from and against third-party claims, liabilities, damages, and costs (including reasonable attorneys' fees) arising from your Customer Content, your use of the Services, or your breach of these Terms.",
    ],
  },
  {
    title: "15. Governing Law and Disputes",
    paragraphs: [
      "These Terms are governed by the laws of the State of Delaware, USA, excluding conflict-of-law rules. Any dispute that is not resolved informally will be brought exclusively in the state or federal courts located in Delaware, and each party consents to personal jurisdiction and venue there.",
    ],
  },
  {
    title: "16. Changes to Terms",
    paragraphs: [
      "We may update these Terms from time to time. If changes are material, we will provide notice through the Services or by email. Your continued use of the Services after the updated Terms become effective constitutes acceptance of the updated Terms.",
    ],
  },
  {
    title: "17. Contact Information",
    paragraphs: [
      "Questions about these Terms may be sent to legal@vaultix.app.",
      "For privacy-related questions, please review our Privacy Policy or contact privacy@vaultix.app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-dark text-light">
      <div className="border-b border-white/[0.08] bg-dark-2/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/register" className="text-sm text-brand hover:text-brand-light transition-colors">
            Back to Register
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-3">Terms of Service</h1>
          <p className="text-sm text-light-3 mt-2">Effective date: {effectiveDate}</p>
          <p className="text-sm text-light-2 mt-4">
            Please read these Terms carefully. By using Vaultix, you agree to these Terms and our{" "}
            <Link href="/privacy" className="text-brand hover:text-brand-light transition-colors">
              Privacy Policy
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
