export enum PurchaseType {
  SINGLE_PASS = 'SINGLE_PASS',
  PRO_SUBSCRIPTION = 'PRO_SUBSCRIPTION',
}

export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export const PLAN_LIMITS: Record<
  string,
  {
    questions: number;
    questionnaires: number;
    documents: number;
    members: number;
    price: string;
    support: 'standard' | 'priority' | 'dedicated';
    hasSSO: boolean;
    hasSLA: boolean;
  }
> = {
  FREE: {
    questions: 250,
    questionnaires: 3,
    documents: 5,
    members: 3,
    price: '$0',
    support: 'standard',
    hasSSO: false,
    hasSLA: false,
  },
  TRIAL: {
    questions: 250,
    questionnaires: 3,
    documents: 5,
    members: 3,
    price: '$0',
    support: 'standard',
    hasSSO: false,
    hasSLA: false,
  },
  PRO: {
    questions: -1, // unlimited
    questionnaires: -1, // unlimited
    documents: 100,
    members: 10,
    price: '$149/mo',
    support: 'priority',
    hasSSO: false,
    hasSLA: true,
  },
  ENTERPRISE: {
    questions: -1,
    questionnaires: -1,
    documents: -1,
    members: -1,
    price: 'Custom',
    support: 'dedicated',
    hasSSO: true,
    hasSLA: true,
  },
};

export const POLAR_PRICING: Record<
  PurchaseType,
  {
    amountCents: number;
    currency: string;
    name: string;
    description: string;
  }
> = {
  [PurchaseType.SINGLE_PASS]: {
    amountCents: 4900,
    currency: 'usd',
    name: 'Single Assessment Pass',
    description: '1 Questionnaire unlocked forever + full spreadsheet export & compliance audit',
  },
  [PurchaseType.PRO_SUBSCRIPTION]: {
    amountCents: 14900,
    currency: 'usd',
    name: 'Vaultix Pro (Unlimited)',
    description: 'Unlimited questionnaires, instant exports, knowledge vault memory, and priority audit',
  },
};

