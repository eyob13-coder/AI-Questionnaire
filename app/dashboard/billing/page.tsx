"use client";

import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Loader2,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Globe,
  Receipt,
  ExternalLink,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuestionnaireStore } from "@/lib/store";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";
import { toast } from "sonner";

function BillingContent({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const billingInfo = useQuestionnaireStore((s) => s.billingInfo);
  const fetchBillingInfo = useQuestionnaireStore((s) => s.fetchBillingInfo);
  const createCheckout = useQuestionnaireStore((s) => s.createCheckout);
  const openCustomerPortal = useQuestionnaireStore((s) => s.openCustomerPortal);

  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const success =
    searchParams.get("success") === "1" || searchParams.get("checkout") === "success";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchBillingInfo(workspaceId);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load billing details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, fetchBillingInfo]);

  const handleCheckout = async (purchaseType: "SINGLE_PASS" | "PRO_SUBSCRIPTION") => {
    setCheckoutLoading(purchaseType);
    try {
      const returnUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const res = await createCheckout(workspaceId, {
        purchaseType,
        successUrl: returnUrl,
        returnUrl,
      });

      if (res?.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
      } else {
        toast.error("Could not initialize Polar checkout session");
      }
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal(workspaceId);
    } catch (e: any) {
      toast.error(e?.message || "Could not open customer billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error || !billingInfo) {
    return <PageError message={error || "Unable to retrieve billing details"} />;
  }

  const isPro = Boolean(billingInfo.isPro || billingInfo.plan === "PRO");
  const limits = billingInfo.usage?.limits;
  const questionsLimit = limits?.questions ?? (billingInfo.usage as any)?.questionsLimit ?? 250;
  const questionsCount = billingInfo.usage?.questionsThisMonth ?? (billingInfo.usage as any)?.questionsUsed ?? 0;
  const questionnairesCount = billingInfo.usage?.questionnairesProcessed ?? (billingInfo.usage as any)?.questionnairesUsed ?? 0;
  const documentsLimit = limits?.documents ?? (billingInfo.usage as any)?.documentsLimit ?? 5;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-4/70 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-light">
              Licensing &amp; Billing
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isPro
                  ? "bg-brand/15 text-brand"
                  : "bg-dark-3 text-light-3 border border-dark-4"
              }`}
            >
              {isPro ? "Pro Subscription" : "Free Plan"}
            </span>
          </div>
          <p className="text-sm text-light-3">
            Merchant of Record billing via Polar.sh supporting global cards, Apple Pay,
            and automatic EU VAT / UK VAT validation.
          </p>
        </div>

        <button
          onClick={handleOpenPortal}
          disabled={portalLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-light hover:text-brand bg-dark-2 hover:bg-dark-3 transition-all cursor-pointer border border-dark-4 shadow-sm"
        >
          {portalLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Receipt className="w-3.5 h-3.5 text-brand" />
          )}
          Manage Invoices &amp; VAT IDs
          <ExternalLink className="w-3 h-3 text-light-4" />
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-between"
        >
          <span>Payment successful! Your workspace has been updated.</span>
        </motion.div>
      )}

      {canceled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 flex items-center justify-between"
        >
          <span>Checkout was canceled. No charges were made.</span>
        </motion.div>
      )}

      {/* Quotas & Capacity Overview */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-light-4 font-semibold mb-3">
          Workspace Capacity &amp; Licensing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Plan & Status */}
          <div className="card-glow rounded-2xl bg-dark-2 border border-dark-4 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-light-3">
                <span>Active Tier</span>
                <Zap className="w-4 h-4 text-brand" />
              </div>
              <p className="font-heading text-xl font-bold text-light">
                {isPro ? "Pro Unlimited" : "Free Plan"}
              </p>
              <p className="text-xs text-light-4 mt-1 font-mono">
                {isPro ? "$149/mo · Recurring" : "Upgrade for unlimited exports"}
              </p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Status</span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          </div>

          {/* Deal Pass Credits */}
          <div className="card-glow rounded-2xl bg-dark-2 border border-dark-4 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-light-3">
                <span>Deal Pass Credits</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-heading text-2xl font-extrabold text-light">
                {billingInfo.exportCredits}
              </p>
              <p className="text-xs text-light-4 mt-1">
                Single questionnaire export passes
              </p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Balance</span>
              <span className="text-[11px] font-semibold text-light-2">
                {billingInfo.exportCredits > 0 ? "Ready to redeem" : "0 available"}
              </span>
            </div>
          </div>

          {/* Questions Processed */}
          <div className="card-glow rounded-2xl bg-dark-2 border border-dark-4 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-light-3">
                <span>Questions This Month</span>
                <FileSpreadsheet className="w-4 h-4 text-brand" />
              </div>
              <p className="font-heading text-xl font-bold text-light">
                {questionsCount}{" "}
                <span className="text-xs text-light-4 font-normal">
                  / {questionsLimit === -1 ? "Unlimited" : questionsLimit}
                </span>
              </p>
              <p className="text-xs text-light-4 mt-1">
                Dual-LLM verified responses
              </p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Limit</span>
              <span className="text-[11px] font-semibold text-light-2">
                {isPro ? "Unlimited" : `${questionsLimit} / month`}
              </span>
            </div>
          </div>

          {/* Knowledge Vault Docs */}
          <div className="card-glow rounded-2xl bg-dark-2 border border-dark-4 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-light-3">
                <span>Knowledge Vault</span>
                <Database className="w-4 h-4 text-brand" />
              </div>
              <p className="font-heading text-xl font-bold text-light">
                {questionnairesCount} Active
              </p>
              <p className="text-xs text-light-4 mt-1">
                Preserved security artifacts
              </p>
            </div>
            <div className="pt-4 border-t border-dark-4/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-light-4">Storage</span>
              <span className="text-[11px] font-semibold text-light-2">
                {documentsLimit === -1 ? "Unlimited documents" : `Up to ${documentsLimit} documents`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans — Unified with Marketing Pricing ($49, $149, Custom) */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-light tracking-tight">
            Simple, <span className="text-brand">transparent</span> pricing
          </h2>
          <p className="text-sm text-light-3 mt-1.5">
            Start free, upgrade when you&apos;re ready. Merchant of Record checkout via Polar.sh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Starter / Single Deal Pass ($49) */}
          <div className="card-glow rounded-2xl bg-dark-2 border border-dark-4 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:border-dark-5 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-xl font-bold text-light">Starter</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-dark-3 text-light-3 border border-dark-4">
                  Pay-As-You-Go
                </span>
              </div>
              <p className="text-xs text-light-3">
                For small teams getting started or single deal reviews
              </p>

              <div className="mt-5 flex items-baseline gap-1.5 pb-5 border-b border-dark-4/70">
                <span className="text-4xl font-extrabold text-light tracking-tight">$49</span>
                <span className="text-xs text-light-4">/ pass or mo</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-light-2">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>5 questionnaires / month (or 1 full single unlock)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>500 questions / month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>10 knowledge docs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>1 workspace member</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Preserved Excel spreadsheet export</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Email support &amp; instant B2B invoice</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("SINGLE_PASS")}
              disabled={checkoutLoading !== null}
              className="mt-8 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-dark-3 hover:bg-dark-4 text-light transition-all cursor-pointer inline-flex items-center justify-center gap-2 border border-dark-4 shadow-sm"
            >
              {checkoutLoading === "SINGLE_PASS" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Get Single Pass ($49)
            </button>
          </div>

          {/* Card 2: Pro Unlimited ($149/mo) — Most Popular */}
          <div className="relative card-glow rounded-2xl bg-dark-2 border-2 border-brand p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-brand/10 hover:border-brand-light transition-all">
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand text-white shadow-md shadow-brand/30">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 mt-1">
                <h3 className="font-heading text-xl font-bold text-light">Pro</h3>
                {isPro && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-xs text-light-3">
                For growing security teams answering recurring vendor reviews
              </p>

              <div className="mt-5 flex items-baseline gap-1.5 pb-5 border-b border-dark-4/70">
                <span className="text-4xl font-extrabold text-light tracking-tight">$149</span>
                <span className="text-xs text-light-4">/ month</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-light-2">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="font-medium text-light">Unlimited questionnaires &amp; exports</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>5,000 questions / month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>100 knowledge vault docs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>10 workspace members with RBAC</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Priority dual-LLM generation queue</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Custom AI tone &amp; compliance API access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("PRO_SUBSCRIPTION")}
              disabled={checkoutLoading !== null || isPro}
              className={`mt-8 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-md ${
                isPro
                  ? "bg-dark-3 text-light-4 cursor-default border border-dark-4"
                  : "bg-brand hover:bg-brand-hover text-white shadow-brand/25"
              }`}
            >
              {checkoutLoading === "PRO_SUBSCRIPTION" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPro ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isPro ? "Current Active Plan" : "Upgrade to Pro ($149/mo)"}
            </button>
          </div>

          {/* Card 3: Enterprise (Custom) */}
          <div className="card-glow rounded-2xl bg-dark-2 border border-dark-4 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:border-dark-5 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-xl font-bold text-light">Enterprise</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-dark-3 text-light-3 border border-dark-4">
                  Custom SLA
                </span>
              </div>
              <p className="text-xs text-light-3">
                For large organizations with strict compliance &amp; governance
              </p>

              <div className="mt-5 flex items-baseline gap-1.5 pb-5 border-b border-dark-4/70">
                <span className="text-4xl font-extrabold text-light tracking-tight">Custom</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-light-2">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="font-medium text-light">Unlimited everything</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>SSO / SAML 2.0 &amp; SCIM provisioning</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Dedicated compliance architect</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>Custom data retention &amp; private VPC</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>99.9% SLA uptime guarantee</span>
                </li>
              </ul>
            </div>

            <a
              href="mailto:sales@vaultix.io?subject=Vaultix%20Enterprise%20Inquiry"
              className="mt-8 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-dark-3 hover:bg-dark-4 text-light transition-all cursor-pointer inline-flex items-center justify-center gap-2 border border-dark-4 shadow-sm"
            >
              <Mail className="w-4 h-4 text-brand" />
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* International Compliance Bar */}
      <div className="rounded-2xl bg-dark-2 border border-dark-4 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-3 flex items-center justify-center text-light-2 shrink-0 border border-dark-4">
            <Globe className="w-5 h-5 text-brand" />
          </div>
          <div>
            <div className="text-sm font-semibold text-light">
              Global Merchant of Record by Polar.sh
            </div>
            <div className="text-xs text-light-3 mt-0.5">
              Automatic EU VAT reverse-charge, UK VAT validation, and US Sales Tax compliance.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-light-3">
          <span className="px-3 py-1 rounded-lg bg-dark-3 border border-dark-4 text-light-2">
            Apple Pay
          </span>
          <span className="px-3 py-1 rounded-lg bg-dark-3 border border-dark-4 text-light-2">
            Google Pay
          </span>
          <span className="px-3 py-1 rounded-lg bg-dark-3 border border-dark-4 text-light-2">
            Global Cards
          </span>
          <span className="px-3 py-1 rounded-lg bg-dark-3 border border-dark-4 text-light-2">
            B2B PDF Invoices
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <WorkspaceGate>
      {(wsId) => <BillingContent workspaceId={wsId} />}
    </WorkspaceGate>
  );
}
