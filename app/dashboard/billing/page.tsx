"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import {
  WorkspaceGate,
  PageError,
  PageLoading,
} from "@/components/dashboard/workspace-state";

interface BillingInfo {
  plan: "TRIAL" | "STARTER" | "PRO" | "ENTERPRISE";
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
    support: 'standard' | 'priority' | 'dedicated';
    hasSSO: boolean;
    hasSLA: boolean;
  };
}

const plans = [
  {
    key: "STARTER",
    name: "Starter",
    price: "$49",
    features: [
      "5 questionnaires/mo",
      "500 questions/mo",
      "10 docs",
      "1 member",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    price: "$149",
    features: [
      "Unlimited questionnaires",
      "5,000 questions/mo",
      "100 docs",
      "10 members",
      "Priority support",
    ],
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited everything",
      "SSO/SAML",
      "Dedicated support",
      "SLA",
    ],
  },
];

function BillingContent({ workspaceId }: { workspaceId: string }) {
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<BillingInfo>(
          `/workspaces/${workspaceId}/billing`,
        );
        if (!cancelled) setInfo(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (loading) return <PageLoading />;
  if (error || !info) return <PageError message={error || "No billing info"} />;

  const usagePercent = Math.min(
    100,
    info.usage.questionsLimit === -1 
      ? 0 
      : Math.round((info.usage.questionsUsed / Math.max(1, info.usage.questionsLimit)) * 100),
  );
  const trialBadge =
    info.plan === "TRIAL" && info.trialEndsAt
      ? `Trial ends ${new Date(info.trialEndsAt).toLocaleDateString()}`
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Billing</h2>
        <p className="text-sm text-light-3 mt-1">
          Manage your subscription and usage.
        </p>
      </motion.div>

      <div className="rounded-2xl border border-brand/20 `bg-linear-to-br` `from-brand/6` to-transparent p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-brand" />
              <span className="text-xs text-brand font-semibold uppercase tracking-wider">
                Current Plan
              </span>
            </div>
            <h3 className="font-heading text-2xl font-bold capitalize">
              {info.plan.toLowerCase()}
            </h3>
            {trialBadge && (
              <p className="text-sm text-light-3 mt-1">{trialBadge}</p>
            )}
          </div>
          <div className="text-right">
            <span className="font-heading text-3xl font-bold">{info.price}</span>
            {info.price !== "Custom" && info.price !== "$0" && (
              <span className="text-light-3 text-sm">/month</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-light-2">Questions this month</span>
            <span className="font-mono text-light">
              {info.usage.questionsUsed.toLocaleString()} /{" "}
              {info.usage.questionsLimit === -1 ? "Unlimited" : info.usage.questionsLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-dark-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePercent > 80
                ? "bg-warning"
                : "`bg-linear-to-r` from-brand to-amber-500"
                }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-light-3">
            {info.usage.questionnairesUsed} questionnaires processed this month
            {info.usage.questionnairesLimit !== -1 && ` (limit ${info.usage.questionnairesLimit})`}
          </p>

          <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
            {info.features.support !== 'standard' && (
              <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
                {info.features.support === 'priority' ? 'Priority Support' : 'Dedicated Support'}
              </span>
            )}
            {info.features.hasSSO && (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                SSO/SAML Enabled
              </span>
            )}
            {info.features.hasSLA && (
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
                SLA Guarantee
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">All Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const current = plan.key === info.plan;
            return (
              <div
                key={plan.key}
                className={`rounded-2xl p-5 flex flex-col ${current
                  ? "border-2 border-brand bg-dark-3/50 glow-brand-sm"
                  : "border `border-white/6` bg-dark-3/30 `hover:border-white/10`"
                  } transition-all`}
              >
                <h4 className="font-heading text-base font-bold">{plan.name}</h4>
                <div className="mt-2 mb-4">
                  <span className="font-heading text-2xl font-bold">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-light-3 text-sm">/mo</span>
                  )}
                </div>
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-light-2"
                    >
                      <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all ${current
                    ? "`bg-white/6` text-light-3 cursor-default"
                    : "bg-brand hover:bg-brand-hover text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    }`}
                  disabled={current}
                >
                  {current
                    ? "Current Plan"
                    : plan.price === "Custom"
                      ? "Contact Sales"
                      : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return <WorkspaceGate>{(id) => <BillingContent workspaceId={id} />}</WorkspaceGate>;
}
