import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasValidatedBackendSession } from "@/lib/auth/session";
import { VaultixLogo } from "@/components/ui/vaultix-logo";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";

export const metadata: Metadata = {
  title: "Vaultix Auth | Security Questionnaire Automation",
  description: "Sign in or create your Vaultix account to automate security questionnaires.",
};

const stats = [
  { icon: "bolt", value: "10x", label: "Faster" },
  { icon: "chart-pie", value: "87%", label: "Acceptance" },
  { icon: "circle-check", value: "50K+", label: "Verified" },
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore,
  });
  const hasBackendSession = await hasValidatedBackendSession(headerStore);

  if (session && hasBackendSession) {
    redirect("/dashboard");
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-dark flex flex-col lg:flex-row relative overflow-hidden select-none">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 bg-grid opacity-[0.06] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand/[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-0 w-[450px] h-[450px] rounded-full bg-brand/[0.05] blur-[140px] pointer-events-none" />

      {/* ── Left Showcase Panel (Desktop) ── */}
      <aside className="hidden lg:flex flex-col justify-between w-[440px] xl:w-[480px] shrink-0 h-full max-h-[100dvh] relative bg-dark-2/80 backdrop-blur-2xl border-r border-white/[0.06] p-8 xl:p-10 z-10 overflow-hidden">
        {/* Brand Header */}
        <div>
          <VaultixLogo size="md" priority />
        </div>

        {/* Value Proposition & Visual Preview */}
        <div className="space-y-8 my-auto py-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand mb-4">
              <FontAwesomeIcon icon={byPrefixAndName.fans["shield-halved"]} className="w-3 h-3 text-brand" />
              SOC 2 · ISO 27001 · HIPAA
            </span>
            <h2 className="font-heading text-3xl xl:text-4xl font-bold leading-tight text-light">
              Security questionnaires,
              <span className="text-gradient-brand"> answered in minutes</span>
            </h2>
            <p className="text-light-3 text-sm mt-3 leading-relaxed">
              Upload spreadsheets or web forms. Vaultix synthesizes exact answers from your knowledge base with citation proof.
            </p>
          </div>

          {/* Key Metric Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-dark-3/60 border border-white/[0.05] text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-brand mb-1">
                  <FontAwesomeIcon icon={byPrefixAndName.fans[s.icon]} className="w-3 h-3" />
                  <span className="font-heading text-lg font-bold text-light">
                    {s.value}
                  </span>
                </div>
                <span className="text-[10px] text-light-4 font-mono uppercase tracking-wider block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Mini Interactive Preview Card */}
          <div className="rounded-2xl bg-dark-3/80 border border-white/[0.08] p-4 shadow-xl shadow-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono font-semibold text-light">
                  SOC2_TypeII_Review.xlsx
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success">
                48/50 Ready
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-dark-4/60 border border-white/[0.04] flex items-center justify-between gap-2">
                <span className="text-light-2 truncate">Do you enforce AES-256 at rest?</span>
                <span className="font-mono text-brand font-bold shrink-0">98% match</span>
              </div>
              <div className="p-2 rounded-lg bg-dark-4/60 border border-white/[0.04] flex items-center justify-between gap-2">
                <span className="text-light-2 truncate">Describe your annual audit cadence</span>
                <span className="font-mono text-brand font-bold shrink-0">94% match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security & Trust Badge */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-light-4">
          <span className="text-[11px] font-mono text-light-4 flex items-center gap-1.5">
            <FontAwesomeIcon icon={byPrefixAndName.fans["shield-halved"]} className="w-3 h-3 text-brand" />
            AES-256 Encrypted
          </span>
          <span className="text-[11px] font-mono text-light-4">
            SOC 2 Type II Certified
          </span>
        </div>
      </aside>

      {/* ── Right Content Area (Mobile & Desktop) ── */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 relative z-10 h-full max-h-[100dvh] overflow-hidden">
        {/* Mobile Header & Desktop Back Link */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-2 sm:mb-3 shrink-0">
          <div className="lg:hidden">
            <VaultixLogo size="sm" />
          </div>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-light-3 hover:text-light transition-colors py-1 px-3 rounded-full hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]"
          >
            <FontAwesomeIcon icon={byPrefixAndName.fans["house"]} className="w-3 h-3 text-brand" />
            Back to home
          </Link>
        </div>

        {/* Centered Auth Card Container */}
        <div className="w-full max-w-md mx-auto my-auto py-1 sm:py-2">
          {children}
        </div>

        {/* Footer info */}
        <div className="w-full max-w-md mx-auto pt-2 sm:pt-3 text-center text-[11px] text-light-4 shrink-0">
          <p>© {new Date().getFullYear()} Vaultix Inc. Enterprise Security Compliance.</p>
        </div>
      </main>
    </div>
  );
}
