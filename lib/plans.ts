export type PlanKey = "STARTER" | "PRO" | "ENTERPRISE";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  priceLabel: string;
  amountUsdCents: number | null;
  interval: "month" | null;
  features: string[];
  contactSales?: boolean;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  STARTER: {
    key: "STARTER",
    name: "Starter",
    priceLabel: "$49",
    amountUsdCents: 4900,
    interval: "month",
    features: [
      "5 questionnaires/mo",
      "500 questions/mo",
      "10 docs",
      "1 member",
    ],
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    priceLabel: "$149",
    amountUsdCents: 14900,
    interval: "month",
    features: [
      "Unlimited questionnaires",
      "5,000 questions/mo",
      "100 docs",
      "10 members",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    key: "ENTERPRISE",
    name: "Enterprise",
    priceLabel: "Custom",
    amountUsdCents: null,
    interval: null,
    contactSales: true,
    features: [
      "Unlimited everything",
      "SSO/SAML",
      "Dedicated support",
      "SLA",
    ],
  },
};

export function isPurchasablePlan(key: string): key is "STARTER" | "PRO" {
  return key === "STARTER" || key === "PRO";
}
