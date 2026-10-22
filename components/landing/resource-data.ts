export interface ResourcePost {
  slug: string;
  title: string;
  category: "Playbook" | "Guide" | "Research" | "Template" | "Case Study";
  readTime: string;
  description: string;
  featured: boolean;
  date: string;
  gradient: string;
}

export const resourcePosts: ResourcePost[] = [
  {
    slug: "cut-questionnaire-review-time",
    title: "How to cut questionnaire review time by 60%",
    category: "Playbook",
    readTime: "6 min read",
    description: "A step-by-step workflow used by top security teams to go from questionnaire upload to approved export in under a business day.",
    featured: true,
    date: "Mar 2026",
    gradient: "from-brand/20 to-orange-700/10",
  },
  {
    slug: "citation-first-ai-workflow",
    title: "Build a citation-first AI security workflow",
    category: "Guide",
    readTime: "8 min read",
    description: "Why citation-backed answers win audits, and how to configure your knowledge base for maximum answer coverage.",
    featured: false,
    date: "Feb 2026",
    gradient: "from-info/20 to-blue-700/10",
  },
  {
    slug: "enterprise-buyer-questions-2026",
    title: "What enterprise buyers ask in 2026 security reviews",
    category: "Research",
    readTime: "5 min read",
    description: "Analysis of 3,400 real security questionnaire questions across fintech, healthcare, and B2B SaaS deals.",
    featured: false,
    date: "Jan 2026",
    gradient: "from-success/20 to-green-700/10",
  },
  {
    slug: "soc2-questionnaire-template",
    title: "SOC 2 questionnaire starter template",
    category: "Template",
    readTime: "Free download",
    description: "Pre-filled SOC 2 Type II questionnaire with 120 questions mapped to common trust service criteria.",
    featured: false,
    date: "Dec 2025",
    gradient: "from-warning/20 to-yellow-700/10",
  },
  {
    slug: "meridian-cloud-case-study",
    title: "How Meridian Cloud closed 4 enterprise deals in one quarter",
    category: "Case Study",
    readTime: "4 min read",
    description: "Reducing security review cycles from 3 days to 4 hours unlocked a new tier of enterprise buyer for their sales team.",
    featured: false,
    date: "Nov 2025",
    gradient: "from-purple-500/20 to-purple-800/10",
  },
  {
    slug: "confidence-scoring-explained",
    title: "Confidence scoring explained: how Vaultix knows what it doesn't know",
    category: "Guide",
    readTime: "7 min read",
    description: "Deep dive into how confidence scores are calculated, calibrated, and why they beat simple hallucination detection.",
    featured: false,
    date: "Oct 2025",
    gradient: "from-info/20 to-blue-700/10",
  },
];
