import Link from "next/link";
import { VaultixLogo } from "@/components/ui/vaultix-logo";
import { FontAwesomeIcon, byPrefixAndName } from "@/lib/fontawesome";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* ── Background Ambient Glows & Grid ── */}
      <div className="absolute inset-0 bg-grid opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand/[0.06] blur-[150px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/[0.04] blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <VaultixLogo size="md" />
        <Link
          href="/"
          className="text-xs text-light-3 hover:text-light transition-colors py-1.5 px-3.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] flex items-center gap-2"
        >
          <FontAwesomeIcon icon={byPrefixAndName.fans["house"]} className="w-3 h-3 text-brand" />
          <span>Home</span>
        </Link>
      </div>

      {/* Center 404 Hero */}
      <div className="relative z-10 my-auto py-12 text-center max-w-xl mx-auto space-y-6">
        {/* Giant Number Backdrop */}
        <div className="relative inline-block">
          <span className="font-heading text-8xl sm:text-9xl md:text-[11rem] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/[0.05] to-transparent leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-mono font-semibold tracking-wider uppercase shadow-lg shadow-brand/10">
              <FontAwesomeIcon icon={byPrefixAndName.fans["shield-halved"]} className="w-3 h-3 text-brand" />
              Vault Asset Not Found
            </span>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-light tracking-tight">
            Lost in the compliance matrix?
          </h1>
          <p className="text-light-3 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            The page or questionnaire artifact you are looking for does not exist, has been moved to an isolated client vault, or is no longer accessible.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-brand/20 hover:shadow-brand/35 cursor-pointer active:scale-[0.98]"
          >
            <FontAwesomeIcon icon={byPrefixAndName.fans["table-cells-large"]} className="w-3.5 h-3.5" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/dashboard/questionnaires"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.16] text-light text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
          >
            <FontAwesomeIcon icon={byPrefixAndName.fans["table-cells"]} className="w-3.5 h-3.5 text-light-4" />
            <span>View Questionnaires</span>
          </Link>
        </div>

        {/* Quick Links Help Strip */}
        <div className="pt-8 border-t border-white/[0.06] flex items-center justify-center gap-6 text-xs text-light-4">
          <Link href="/dashboard/knowledge" className="hover:text-light transition flex items-center gap-1.5">
            <FontAwesomeIcon icon={byPrefixAndName.fans["book-open"]} className="w-3 h-3 text-brand" />
            <span>Knowledge Base</span>
          </Link>
          <span>·</span>
          <Link href="/dashboard/billing" className="hover:text-light transition flex items-center gap-1.5">
            <FontAwesomeIcon icon={byPrefixAndName.fans["credit-card"]} className="w-3 h-3 text-brand" />
            <span>Billing</span>
          </Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-light transition flex items-center gap-1.5">
            <FontAwesomeIcon icon={byPrefixAndName.fans["headset"]} className="w-3 h-3 text-brand" />
            <span>Help Desk</span>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-light-4 pt-6 border-t border-white/[0.04]">
        <span>Vaultix Security Intelligence</span>
        <span className="font-mono text-[11px]">HTTP 404 STATUS</span>
      </div>
    </div>
  );
}
