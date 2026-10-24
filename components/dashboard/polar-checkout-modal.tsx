"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Loader2,
  Globe,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useQuestionnaireStore } from "@/lib/store";

interface PolarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  questionnaireId?: string;
  questionnaireName?: string;
  onUnlocked?: () => void;
}

export function PolarCheckoutModal({
  isOpen,
  onClose,
  workspaceId,
  questionnaireId,
  questionnaireName,
  onUnlocked,
}: PolarCheckoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"SINGLE_PASS" | "PRO_SUBSCRIPTION">(
    "SINGLE_PASS"
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [unlockingWithCredit, setUnlockingWithCredit] = useState(false);

  const billingInfo = useQuestionnaireStore((s) => s.billingInfo);
  const createCheckout = useQuestionnaireStore((s) => s.createCheckout);
  const unlockWithCredit = useQuestionnaireStore((s) => s.unlockWithCredit);
  const fetchBillingInfo = useQuestionnaireStore((s) => s.fetchBillingInfo);

  const exportCredits = billingInfo?.exportCredits ?? 0;

  const handleCheckout = async (purchaseType: "SINGLE_PASS" | "PRO_SUBSCRIPTION") => {
    setLoadingPlan(purchaseType);
    try {
      const returnUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const res = await createCheckout(workspaceId, {
        purchaseType,
        questionnaireId: purchaseType === "SINGLE_PASS" ? questionnaireId : undefined,
        successUrl: returnUrl,
        returnUrl,
      });

      if (res?.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
      } else {
        toast.error("Could not initialize Polar checkout session");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleUseCredit = async () => {
    if (!questionnaireId) return;
    setUnlockingWithCredit(true);
    try {
      const res = await unlockWithCredit(workspaceId, questionnaireId);
      if (res.success) {
        toast.success("Questionnaire Unlocked!", {
          description: `1 Deal Pass credit redeemed. Remaining credits: ${res.remainingCredits}`,
        });
        await fetchBillingInfo(workspaceId);
        onUnlocked?.();
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not redeem export credit");
    } finally {
      setUnlockingWithCredit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl rounded-2xl bg-dark-2 text-light shadow-2xl overflow-hidden my-auto border border-dark-4"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5 flex items-start justify-between border-b border-dark-4/70">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-light">
                Unlock Enterprise Export &amp; Compliance Audit
              </h2>
              <p className="text-sm text-light-3 mt-1.5 leading-relaxed max-w-xl">
                Deliver verified answers with citations, original spreadsheet preservation,
                and zero-hallucination compliance audit trails.
              </p>
              {questionnaireName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-3 border border-dark-4 text-xs font-mono text-light-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand" />
                  <span className="truncate max-w-md">{questionnaireName}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-light-4 hover:text-light hover:bg-dark-3 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Credit Redemption Banner if Credits Available */}
          {exportCredits > 0 && questionnaireId && (
            <div className="mx-6 mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-light">
                    You have {exportCredits} Deal Pass {exportCredits === 1 ? "credit" : "credits"} available
                  </div>
                  <div className="text-xs text-light-3">
                    Unlock this questionnaire immediately without entering payment details.
                  </div>
                </div>
              </div>

              <button
                onClick={handleUseCredit}
                disabled={unlockingWithCredit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-2 shadow-sm"
              >
                {unlockingWithCredit ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Redeem 1 Credit
              </button>
            </div>
          )}

          {/* Pricing Options */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Single Deal Pass ($49) */}
            <div
              onClick={() => setSelectedPlan("SINGLE_PASS")}
              className={`relative p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between border ${
                selectedPlan === "SINGLE_PASS"
                  ? "bg-dark-3 border-brand shadow-sm ring-1 ring-brand"
                  : "bg-dark-3/60 border-dark-4 hover:border-dark-5 hover:bg-dark-3"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-light-3">
                    Single Review
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all ${
                      selectedPlan === "SINGLE_PASS"
                        ? "bg-brand text-white"
                        : "border border-dark-4"
                    }`}
                  >
                    {selectedPlan === "SINGLE_PASS" && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>

                <div className="font-heading text-lg font-bold text-light">Single Deal Pass</div>
                <div className="text-xs text-light-4 mt-0.5">
                  Ideal for one-off enterprise vendor reviews
                </div>

                <div className="mt-4 flex items-baseline gap-1.5 pb-4 border-b border-dark-4/70">
                  <span className="text-3xl font-extrabold text-light tracking-tight">$49</span>
                  <span className="text-xs text-light-4 font-normal">one-time payment</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-light-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Instant unlocked Excel download with preserved styles &amp; formulas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Evidence citations linked to source policies &amp; audit reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Permanent access to questionnaire results in your workspace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Automatic EU VAT reverse-charge &amp; B2B invoice receipt</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout("SINGLE_PASS");
                }}
                disabled={loadingPlan !== null}
                className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2 border shadow-sm ${
                  selectedPlan === "SINGLE_PASS"
                    ? "bg-brand hover:bg-brand-hover text-white border-brand"
                    : "bg-dark-2 hover:bg-dark-3 text-light border-dark-4"
                }`}
              >
                {loadingPlan === "SINGLE_PASS" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Purchase Single Pass ($49)
              </button>
            </div>

            {/* Option 2: Pro Unlimited ($149/mo) */}
            <div
              onClick={() => setSelectedPlan("PRO_SUBSCRIPTION")}
              className={`relative p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between border ${
                selectedPlan === "PRO_SUBSCRIPTION"
                  ? "bg-dark-3 border-brand shadow-sm ring-1 ring-brand"
                  : "bg-dark-3/60 border-dark-4 hover:border-dark-5 hover:bg-dark-3"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/15 text-brand">
                    <Sparkles className="w-3 h-3 text-brand" />
                    Most Popular for SaaS
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all ${
                      selectedPlan === "PRO_SUBSCRIPTION"
                        ? "bg-brand text-white"
                        : "border border-dark-4"
                    }`}
                  >
                    {selectedPlan === "PRO_SUBSCRIPTION" && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>

                <div className="font-heading text-lg font-bold text-light">Pro Unlimited</div>
                <div className="text-xs text-light-4 mt-0.5">
                  For teams handling recurring security questionnaires &amp; RFPs
                </div>

                <div className="mt-4 flex items-baseline gap-1.5 pb-4 border-b border-dark-4/70">
                  <span className="text-3xl font-extrabold text-light tracking-tight">$149</span>
                  <span className="text-xs text-light-4 font-normal">/ month</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-light-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span className="font-medium text-light">Unlimited questionnaires &amp; instant exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Shared Knowledge Vault memory (never answer the same question twice)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Priority dual-LLM reasoning queue with live verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>10 Team member seats with role-based access control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>Self-serve B2B invoice management &amp; tax ID VAT exemption</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout("PRO_SUBSCRIPTION");
                }}
                disabled={loadingPlan !== null}
                className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2 border shadow-sm ${
                  selectedPlan === "PRO_SUBSCRIPTION"
                    ? "bg-brand hover:bg-brand-hover text-white border-brand"
                    : "bg-dark-2 hover:bg-dark-3 text-light border-dark-4"
                }`}
              >
                {loadingPlan === "PRO_SUBSCRIPTION" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Upgrade to Pro ($149/mo)
              </button>
            </div>
          </div>

          {/* International Compliance & Trust Footer */}
          <div className="px-6 py-4 bg-dark-3/60 border-t border-dark-4/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-light-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand shrink-0" />
              <span>
                Merchant of Record powered by <strong className="text-light-2 font-medium">Polar.sh</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-light-3">
                <Receipt className="w-3.5 h-3.5 text-brand" />
                EU VAT Reverse-Charge &amp; UK VAT Invoices
              </span>
              <span className="text-light-4">·</span>
              <span>Apple Pay, Google Pay, Global Cards</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
