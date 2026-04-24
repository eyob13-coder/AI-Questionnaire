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
  TRIAL: {
    questions: 100,
    questionnaires: 3,
    documents: 5,
    members: 3,
    price: '$0',
    support: 'standard',
    hasSSO: false,
    hasSLA: false,
  },
  STARTER: {
    questions: 500,
    questionnaires: 5,
    documents: 10,
    members: 1,
    price: '$49',
    support: 'standard',
    hasSSO: false,
    hasSLA: false,
  },
  PRO: {
    questions: 5000,
    questionnaires: -1, // -1 indicates unlimited
    documents: 100,
    members: 10,
    price: '$149',
    support: 'priority',
    hasSSO: false,
    hasSLA: false,
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
