import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const linkGroups = [
    {
      title: "Product",
      items: [
        { label: "Features", href: "/#features" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Changelog", href: "/changelog" },
        { label: "API Docs", href: "/docs/api" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Resource Center", href: "/#resources" },
        { label: "Security Playbook", href: "/resources/cut-questionnaire-review-time" },
        { label: "SOC 2 Template", href: "/resources/soc2-questionnaire-template" },
        { label: "Citation Guide", href: "/resources/citation-first-ai-workflow" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About", href: "/about" },
        { label: "Security", href: "/security" },
        { label: "Status", href: "/status" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "DPA", href: "/dpa" },
        { label: "Security Whitepaper", href: "/security-whitepaper" },
      ],
    },
  ];

  return (
    <footer className="border-t border-overlay/[0.06] bg-dark-2/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="relative w-8 h-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image src="/logo.svg" alt="Vaultix" fill className="object-contain" priority />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight">
                Vault<span className="text-brand">ix</span>
              </span>
            </Link>
            <p className="text-light-3 text-sm leading-relaxed max-w-sm">
              AI-powered security questionnaire automation with verifiable
              answers, citations, and confidence scoring.
            </p>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading text-sm font-semibold mb-4 text-light">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-light-3 hover:text-light transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-overlay/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-light-4">
            &copy; 2026 Vaultix. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/status"
              className="inline-flex items-center gap-1.5 text-xs text-light-4 hover:text-light-3 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
