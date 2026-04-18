"use client";

import { motion } from "framer-motion";
import { Check, CreditCard, Zap, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";

const currentPlan = {
  name: "Pro",
  price: "$149",
  period: "month",
  renewsAt: "May 17, 2026",
  questionsUsed: 2847,
  questionsLimit: 5000,
  questionnairesUsed: 8,
};

const plans = [
  {
    name: "Starter",
    price: "$49",
    features: ["5 questionnaires/mo", "500 questions/mo", "10 docs", "1 member"],
    current: false,
  },
  {
    name: "Pro",
    price: "$149",
    features: ["Unlimited questionnaires", "5,000 questions/mo", "100 docs", "10 members", "Priority support"],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited everything", "SSO/SAML", "Dedicated support", "SLA"],
    current: false,
  },
];

export default function BillingPage() {
  const usagePercent = Math.round((currentPlan.questionsUsed / currentPlan.questionsLimit) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-heading text-2xl font-bold">Billing</h2>
        <p className="text-sm text-light-3 mt-1">Manage your subscription and usage.</p>
      </motion.div>

      {/* Current plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-transparent p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-brand" />
              <span className="text-xs text-brand font-semibold uppercase tracking-wider">Current Plan</span>
            </div>
            <h3 className="font-heading text-2xl font-bold">{currentPlan.name}</h3>
            <p className="text-sm text-light-3 mt-1">Renews on {currentPlan.renewsAt}</p>
          </div>
          <div className="text-right">
            <span className="font-heading text-3xl font-bold">{currentPlan.price}</span>
            <span className="text-light-3 text-sm">/{currentPlan.period}</span>
          </div>
        </div>

        {/* Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-light-2">Questions this month</span>
            <span className="font-mono text-light">
              {currentPlan.questionsUsed.toLocaleString()} / {currentPlan.questionsLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-dark-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePercent > 80 ? "bg-warning" : "bg-gradient-to-r from-brand to-amber-500"}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-light-3">{100 - usagePercent}% remaining · {currentPlan.questionnairesUsed} questionnaires processed</p>
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-heading text-lg font-semibold mb-4">All Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-5 flex flex-col ${plan.current
                  ? "border-2 border-brand bg-dark-3/50 glow-brand-sm"
                  : "border border-white/[0.06] bg-dark-3/30 hover:border-white/[0.1]"
                } transition-all`}
            >
              <h4 className="font-heading text-base font-bold">{plan.name}</h4>
              <div className="mt-2 mb-4">
                <span className="font-heading text-2xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-light-3 text-sm">/mo</span>}
              </div>
              <ul className="space-y-2 flex-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-light-2">
                    <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all ${plan.current
                    ? "bg-white/[0.06] text-light-3 cursor-default"
                    : "bg-brand hover:bg-brand-hover text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  }`}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : plan.price === "Custom" ? "Contact Sales" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
