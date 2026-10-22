"use client";

import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Loader2,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

interface BillingInfo {
  plan: "TRIAL" | "STARTER" | "PRO" | "VCISO_AGENCY" | "ENTERPRISE" | "PAY_PER_QUESTIONNAIRE";
  price: string;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  usage: {
    questionsUsed: number;
    questionsLimit: number;
    questionnairesUsed: number;
    questionnairesLimit: number;
    documentsLimit: number;
    membersLimit: number;
  };
  features: {
    support: "standard" | "priority" | "dedicated";
    hasSSO: boolean;
    hasSLA: boolean;
  };
}

interface SubscriptionTier {
  key: "STARTER" | "PRO" | "VCISO_AGENCY";
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  isPopular?: boolean;
  icon: typeof Zap;
  features: string[];
  limits: {
    questionnaires: string;
    questions: string;
    vaultDocs: string;
    teamSeats: string;
  };
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    key: "STARTER",
    name: "Starter",
    tagline: "For early-stage SaaS & solo founders closing vendor reviews.",
    monthlyPrice: 49,
    annualPrice: 39,
    icon: FileSpreadsheet,
    features: [
      "5 questionnaires processed per month",
      "500 questions answered with AI citations",
      "10 compliance docs in knowledge vault",
      "Round-Trip Excel formatting preserved",
      "Standard email support",
    ],
    limits: {
      questionnaires: "5 / mo",
      questions: "500 / mo",
      vaultDocs: "10 documents",
      teamSeats: "1 member",
    },
  },
  {
    key: "PRO",
    name: "Pro",
    tagline: "For scaling security & sales teams answering recurring RFPs.",
    monthlyPrice: 149,
    annualPrice: 119,
    badge: "Most Popular",
    isPopular: true,
    icon: Sparkles,
    features: [
      "Unlimited questionnaires processed",
      "5,000 questions answered per month",
      "100 compliance docs in knowledge vault",
      "Live Technical Sync (GitHub & DevOps)",
      "10 team members with role-based access",
      "Priority dual-model verification queue",
    ],
    limits: {
      questionnaires: "Unlimited",
      questions: "5,000 / mo",
      vaultDocs: "100 documents",
      teamSeats: "10 members",
    },
  },
  {
    key: "VCISO_AGENCY",
    name: "vCISO / Agency",
    tagline: "For security consultants managing multiple isolated client vaults.",
    monthlyPrice: 249,
    annualPrice: 199,
    badge: "Multi-Tenant",
    icon: Building2,
    features: [
      "Everything in Pro included",
      "Up to 25 isolated client company vaults",
      "Cross-client policy templates & playbooks",
      "Unified consultant command switcher",
      "Dedicated account engineer & SLA",
      "White-glove spreadsheet template onboarding",
    ],
    limits: {
      questionnaires: "Unlimited",
      questions: "Unlimited",
      vaultDocs: "Unlimited",
      teamSeats: "Unlimited",
    },
  },
];

function BillingContent({ workspaceId }: { workspaceId: string }) {
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  async function startCheckout(planKey: string) {
    setCheckoutError(null);
    setCheckoutPlan(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, workspaceId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout");
      }
      window.location.assign(data.url);
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : "Checkout failed");
      setCheckoutPlan(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<BillingInfo>(`/workspaces/${workspaceId}/billing`);
        if (!cancelled) setInfo(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load billing details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (loading) return <PageLoading />;
  if (error || !info) return <PageError message={error || "Unable to retrieve billing details"} />;

  const questionsQuota = info.usage.questionsLimit === -1 ? Infinity : info.usage.questionsLimit;
  const questionsUsed = info.usage.questionsUsed;
  const questionsPercent = questionsQuota === Infinity ? 0 : Math.min(100, Math.round((questionsUsed / Math.max(1, questionsQuota)) * 100));

  const daysRemaining = info.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(info.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-4 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              Subscription & Usage
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
              {info.plan === "TRIAL" ? "Free Trial" : `${info.plan} Plan`}
            </span>
          </div>
          <p className="text-sm text-light-3">
            Manage your workspace capacity, billing cycle, and compliance quotas.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center self-start md:self-auto bg-dark-3/80 p-1 rounded-xl border border-dark-4">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-dark-5 text-light shadow-sm"
                : "text-light-3 hover:text-light"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "annual"
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "text-light-3 hover:text-light"
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] bg-white/20 text-white font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              20% off
            </span>
          </button>
        </div>
      </div>

      {/* ── Status Banner Messages ── */}
      {canceled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning flex items-center justify-between"
        >
          <span>Checkout was canceled. You can pick your desired plan whenever you&apos;re ready.</span>
        </motion.div>
      )}

      {checkoutError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center justify-between"
        >
          <span>{checkoutError}</span>
        </motion.div>
      )}

      {/* ── Current Usage & Quotas (Bento Cards) ── */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-light-4 font-semibold mb-3">
          Current Workspace Quotas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Plan Card */}
          <div className="rounded-2xl border border-dark-4 bg-dark-3/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-light-3 font-medium">Active Plan</span>
                <Zap className="w-4 h-4 text-brand" />
              </div>
              <p className="font-heading text-xl font-bold capitalize text-light">
                {info.plan === "TRIAL" ? "14-Day Trial" : info.plan.toLowerCase()}
              </p>
              <p className="text-xs text-light-3 mt-1">
                {daysRemaining !== null
                  ? `${daysRemaining} days remaining in trial`
                  : info.price !== "Custom"
                    ? `${info.price}/month billing`
                    : "Custom contract"}
              </p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Status</span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* Questions Quota */}
          <div className="rounded-2xl border border-dark-4 bg-dark-3/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-light-3 font-medium">Questions Usage</span>
                <span className="text-xs font-mono text-light-2 font-semibold">
                  {questionsUsed.toLocaleString()} /{" "}
                  {questionsQuota === Infinity ? "∞" : questionsQuota.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-dark-4 overflow-hidden my-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    questionsPercent > 85 ? "bg-danger" : "bg-brand"
                  }`}
                  style={{ width: `${Math.max(4, questionsPercent)}%` }}
                />
              </div>
              <p className="text-xs text-light-3">
                {questionsQuota === Infinity
                  ? "Unlimited generation active"
                  : `${Math.max(0, questionsQuota - questionsUsed).toLocaleString()} questions remaining this cycle`}
              </p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Dual-Model Audit</span>
              <span className="text-[11px] font-semibold text-light-2">Enabled</span>
            </div>
          </div>

          {/* Questionnaires Processed */}
          <div className="rounded-2xl border border-dark-4 bg-dark-3/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-light-3 font-medium">Questionnaires</span>
                <FileSpreadsheet className="w-4 h-4 text-brand" />
              </div>
              <p className="font-heading text-xl font-bold text-light">
                {info.usage.questionnairesUsed}
                {info.usage.questionnairesLimit !== -1 && (
                  <span className="text-xs text-light-4 font-normal"> / {info.usage.questionnairesLimit} max</span>
                )}
              </p>
              <p className="text-xs text-light-3 mt-1">Sheets processed in current cycle</p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Round-Trip Excel</span>
              <span className="text-[11px] font-semibold text-emerald-400">100% Preserved</span>
            </div>
          </div>

          {/* Vault Documents & Storage */}
          <div className="rounded-2xl border border-dark-4 bg-dark-3/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-light-3 font-medium">Knowledge Vault</span>
                <Database className="w-4 h-4 text-light-3" />
              </div>
              <p className="font-heading text-xl font-bold text-light">
                {info.usage.documentsLimit === -1 ? "Unlimited" : `${info.usage.documentsLimit} docs`}
              </p>
              <p className="text-xs text-light-3 mt-1">Security policies & SOC2 audit docs</p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Tech Sync</span>
              <span className="text-[11px] font-semibold text-light-2">
                {info.plan === "PRO" || info.plan === "VCISO_AGENCY" || info.plan === "ENTERPRISE"
                  ? "Connected"
                  : "Pro Tier Only"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Subscription Tiers (3-Column Layout) ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-light">Choose a Subscription Tier</h2>
            <p className="text-sm text-light-3">
              Scale capacity as your security questionnaires and customer diligence volume grow.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs text-brand hover:text-brand-light font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            {showComparison ? "Hide full feature matrix" : "Compare all limits & features"}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showComparison ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {subscriptionTiers.map((tier) => {
            const isCurrent = tier.key === info.plan;
            const price = billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;
            const busy = checkoutPlan === tier.key;

            return (
              <div
                key={tier.key}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  tier.isPopular
                    ? "border-2 border-brand bg-gradient-to-b from-brand/[0.08] via-dark-3/60 to-dark-3/40 shadow-xl shadow-brand/10 ring-1 ring-brand/30"
                    : "border border-dark-4 bg-dark-3/30 hover:border-dark-5 hover:bg-dark-3/50"
                }`}
              >
                {/* Popular / Multi-tenant Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand text-white shadow-md shadow-brand/30 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tier.isPopular ? "bg-brand/20 text-brand" : "bg-dark-4 text-light-3"
                        }`}
                      >
                        <tier.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-light">{tier.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-light-3 min-h-[36px] mb-6 leading-relaxed">
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-dark-4">
                    <span className="font-heading text-4xl font-extrabold text-light">${price}</span>
                    <span className="text-sm text-light-3">/month</span>
                    {billingCycle === "annual" && (
                      <span className="text-xs text-emerald-400 font-mono ml-2 font-medium">
                        billed annually
                      </span>
                    )}
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-light-2">
                        <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  disabled={isCurrent || busy || checkoutPlan !== null}
                  onClick={() => {
                    if (isCurrent) return;
                    void startCheckout(tier.key);
                  }}
                  className={`w-full py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrent
                      ? "bg-dark-4 text-light-4 cursor-default border border-dark-5"
                      : tier.isPopular
                        ? "bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/25 hover:shadow-brand/40"
                        : "bg-dark-4 hover:bg-dark-5 text-light hover:text-white border border-dark-5"
                  }`}
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent ? "Current Plan" : busy ? "Connecting Stripe..." : `Upgrade to ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feature Comparison Matrix (Collapsible) ── */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-dark-4 overflow-hidden bg-dark-3/30"
        >
          <div className="p-5 border-b border-dark-4 bg-dark-3/60">
            <h3 className="font-heading text-base font-bold text-light">Detailed Tier Comparison</h3>
            <p className="text-xs text-light-3">Compare exact limits and feature entitlements across plans.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-4 text-light-4 uppercase tracking-wider font-mono">
                  <th className="py-3 px-5">Capability</th>
                  <th className="py-3 px-5">Starter</th>
                  <th className="py-3 px-5 text-brand">Pro</th>
                  <th className="py-3 px-5">vCISO / Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-4/60 text-light-2">
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Monthly Questionnaires</td>
                  <td className="py-3 px-5">5 / month</td>
                  <td className="py-3 px-5 text-brand font-semibold">Unlimited</td>
                  <td className="py-3 px-5 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Question Volume</td>
                  <td className="py-3 px-5">500 / month</td>
                  <td className="py-3 px-5 text-brand font-semibold">5,000 / month</td>
                  <td className="py-3 px-5 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Knowledge Base Docs</td>
                  <td className="py-3 px-5">10 documents</td>
                  <td className="py-3 px-5 text-brand font-semibold">100 documents</td>
                  <td className="py-3 px-5 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Live Technical Sync (GitHub/DevOps)</td>
                  <td className="py-3 px-5 text-light-4">—</td>
                  <td className="py-3 px-5 text-emerald-400 font-semibold">Included</td>
                  <td className="py-3 px-5 text-emerald-400 font-semibold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Multi-Tenant Client Vaults</td>
                  <td className="py-3 px-5 text-light-4">—</td>
                  <td className="py-3 px-5 text-light-4">—</td>
                  <td className="py-3 px-5 text-brand font-semibold">25 Isolated Vaults</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Team Seats</td>
                  <td className="py-3 px-5">1 member</td>
                  <td className="py-3 px-5 text-brand font-semibold">10 seats</td>
                  <td className="py-3 px-5 font-semibold">Unlimited seats</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-medium text-light">Support Level</td>
                  <td className="py-3 px-5">Standard Email</td>
                  <td className="py-3 px-5 text-brand font-semibold">Priority Support</td>
                  <td className="py-3 px-5 font-semibold">Dedicated Engineer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Dedicated Pay-As-You-Go Single Unlock Card ── */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-dark-3/60 to-dark-3/40 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Pay As You Go
            </span>
            <span className="text-xs text-light-4 font-mono">No Recurring Commitment</span>
          </div>
          <h3 className="font-heading text-xl font-bold text-light">
            Just need a single questionnaire answered right now?
          </h3>
          <p className="text-xs sm:text-sm text-light-3 mt-1.5 leading-relaxed">
            Get an instant one-time export pass for <strong className="text-light">$59</strong>. Includes up to 300 questions, dual-model adversary verification, and full Round-Trip Excel preservation. Zero subscription required.
          </p>
        </div>

        <button
          type="button"
          disabled={checkoutPlan !== null}
          onClick={() => void startCheckout("PAY_PER_QUESTIONNAIRE")}
          className="shrink-0 px-6 py-3.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {checkoutPlan === "PAY_PER_QUESTIONNAIRE" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>Buy 1 Questionnaire Pass ($59)</span>
        </button>
      </div>

      {/* ── Enterprise / Custom Compliance ── */}
      <div className="rounded-3xl border border-dark-4 bg-dark-3/20 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">Enterprise & Compliance</span>
          </div>
          <h3 className="font-heading text-xl font-bold text-light">
            Need private VPC deployment or custom SLA agreements?
          </h3>
          <p className="text-xs sm:text-sm text-light-3 leading-relaxed">
            Vaultix Enterprise delivers custom AI fine-tuning against proprietary governance frameworks, SAML 2.0 / Okta SSO, custom SLAs, and dedicated compliance architect assistance.
          </p>
        </div>

        <a
          href="mailto:sales@vaultix.ai?subject=Vaultix%20Enterprise%20Inquiry"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-light bg-dark-4 hover:bg-dark-5 hover:text-white border border-dark-5 transition-all cursor-pointer"
        >
          <span>Talk to Compliance Architect</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <WorkspaceGate>
      {(id) => <BillingContent workspaceId={id} />}
    </WorkspaceGate>
  );
}
