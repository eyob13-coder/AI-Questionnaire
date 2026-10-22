export type PlanKey =
  | "PAY_PER_QUESTIONNAIRE"
  | "STARTER"
  | "PRO"
  | "VCISO_AGENCY"
  | "ENTERPRISE";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  priceLabel: string;
  badge?: string;
  amountUsdCents: number | null;
  interval: "month" | "one-time" | null;
  features: string[];
  contactSales?: boolean;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  PAY_PER_QUESTIONNAIRE: {
    key: "PAY_PER_QUESTIONNAIRE",
    name: "Pay-Per-Questionnaire",
    priceLabel: "$59",
    badge: "No Subscription",
    amountUsdCents: 5900,
    interval: "one-time",
    features: [
      "1 full questionnaire unlock (up to 300 questions)",
      "Round-Trip Excel formatting preserved",
      "Interactive audit citations & notes",
      "Instant self-serve export",
      "No recurring commitment",
    ],
  },
  STARTER: {
    key: "STARTER",
    name: "Starter",
    priceLabel: "$49",
    amountUsdCents: 4900,
    interval: "month",
    features: [
      "5 questionnaires/mo",
      "500 questions/mo",
      "10 docs in knowledge vault",
      "Round-trip Excel preservation",
      "1 team member",
    ],
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    priceLabel: "$149",
    badge: "Most Popular",
    amountUsdCents: 14900,
    interval: "month",
    features: [
      "Unlimited questionnaires",
      "5,000 questions/mo",
      "100 docs in knowledge vault",
      "Live Technical Sync (GitHub / DevOps)",
      "10 team members",
      "Priority AI generation queue",
    ],
  },
  VCISO_AGENCY: {
    key: "VCISO_AGENCY",
    name: "vCISO / Agency",
    priceLabel: "$249",
    badge: "Multi-Tenant",
    amountUsdCents: 24900,
    interval: "month",
    features: [
      "Unlimited questionnaires & questions",
      "Up to 25 isolated client workspaces",
      "Cross-client compliance policy sharing",
      "Unified consultant command center",
      "Unlimited team seats",
      "Dedicated account engineer",
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
      "Custom SLA & private VPC deployment",
      "Custom AI model fine-tuning",
      "SSO / SAML 2.0 & SCIM provisioning",
      "Dedicated compliance architect",
    ],
  },
};

export function isPurchasablePlan(
  key: string,
): key is "STARTER" | "PRO" | "PAY_PER_QUESTIONNAIRE" | "VCISO_AGENCY" {
  return (
    key === "STARTER" ||
    key === "PRO" ||
    key === "PAY_PER_QUESTIONNAIRE" ||
    key === "VCISO_AGENCY"
  );
}
