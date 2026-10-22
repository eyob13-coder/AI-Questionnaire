import {
  Brain,
  BarChart3,
  FileCheck,
  Zap,
  Users,
  Lock,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vaultix",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hello@vaultix.app",
    },
  ],
};

export const softwareStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vaultix",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  offers: [
    {
      "@type": "Offer",
      price: "49",
      priceCurrency: "USD",
      category: "Starter",
    },
    {
      "@type": "Offer",
      price: "149",
      priceCurrency: "USD",
      category: "Pro",
    },
  ],
  description:
    "AI-powered security questionnaire automation with citations, confidence scoring, and audit-ready workflows.",
};

export const features = [
  {
    icon: Brain,
    title: "AI-Powered Answers",
    desc: "Generate accurate, contextual answers from your company knowledge base using advanced RAG pipeline.",
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    desc: "Color-coded confidence scores (0-100%) so you instantly know which answers need human review.",
  },
  {
    icon: FileCheck,
    title: "Smart Citations",
    desc: "Every answer backed by source documents with page numbers. Full traceability for auditors.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Process 300+ questions in minutes, not days. 10x faster than manual copy-paste workflows.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Role-based access with Owner, Editor, and Viewer roles. Review, edit, and approve together.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    desc: "SOC 2 ready. AES-256 encryption, audit trails, tenant isolation, and data retention controls.",
  },
];

export const plans = [
  {
    name: "Starter",
    price: "$49",
    desc: "For small teams getting started",
    features: [
      "5 questionnaires/month",
      "500 questions/month",
      "10 knowledge docs",
      "1 workspace member",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    desc: "For growing security teams",
    features: [
      "Unlimited questionnaires",
      "5,000 questions/month",
      "100 knowledge docs",
      "10 workspace members",
      "Priority support",
      "Custom AI tone",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited everything",
      "SSO / SAML",
      "Dedicated support",
      "Custom retention",
      "SLA guarantee",
      "SCIM provisioning",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const mockRows = [
  {
    q: "Do you encrypt all data at rest?",
    a: "Yes. All data at rest is encrypted using AES-256 via AWS KMS...",
    full: "Yes. All data at rest is encrypted using AES-256 encryption via AWS KMS with automatic key rotation every 90 days. This applies to all databases (RDS, DynamoDB), S3 buckets, EBS volumes, and database backups.",
    conf: 96,
    status: "Approved",
    citations: ["Security Policy v3.2 · p.12", "AWS Architecture Guide · p.4"],
  },
  {
    q: "Describe your incident response process",
    a: "Our IR follows a structured 4-phase approach based on NIST SP 800-61...",
    full: "Our IR follows a structured 4-phase approach based on NIST SP 800-61: Preparation, Detection & Analysis, Containment/Eradication/Recovery, and Post-Incident Activity. We maintain 24/7 on-call with a 15-minute SLA for critical incidents.",
    conf: 82,
    status: "Review",
    citations: ["Incident Response Plan · p.3", "BCP & DR Policy · p.7"],
  },
  {
    q: "What is your business continuity plan?",
    a: "Our BCP includes redundant systems across multiple availability zones...",
    full: "Our BCP includes redundant systems across 3 AWS availability zones with automatic failover (RTO < 4hr, RPO < 1hr). We conduct quarterly BCP tests and annual DR drills with documented results.",
    conf: 91,
    status: "Approved",
    citations: ["BCP & DR Policy · p.2", "AWS Architecture Guide · p.11"],
  },
  {
    q: "How do you handle data subject requests?",
    a: "Insufficient information in knowledge base to fully answer this question.",
    full: "Insufficient information in knowledge base to fully answer this question. Consider adding your GDPR/CCPA data subject request procedures to the knowledge base to improve coverage.",
    conf: 28,
    status: "Draft",
    citations: [],
  },
  {
    q: "Do you perform penetration testing?",
    a: "Yes. We engage third-party security firms for annual penetration testing...",
    full: "Yes. We engage accredited third-party security firms for annual penetration testing covering OWASP Top 10, network, and infrastructure. Our last pentest was January 2026; findings are remediated within 30 days (critical) or 90 days (high).",
    conf: 88,
    status: "Approved",
    citations: [
      "Security Policy v3.2 · p.18",
      "Vulnerability Management SOP · p.5",
    ],
  },
];
