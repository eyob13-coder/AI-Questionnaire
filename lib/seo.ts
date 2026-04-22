export const SITE_NAME = "Vaultix";

export const SITE_DESCRIPTION =
  "AI-powered security questionnaire automation with citations, confidence scoring, and full audit trails for faster enterprise deal cycles.";

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (envSiteUrl && envSiteUrl.length > 0
  ? envSiteUrl
  : "https://vaultix.app"
).replace(/\/+$/, "");

export const SEO_KEYWORDS = [
  "security questionnaire automation",
  "AI security questionnaires",
  "vendor security questionnaire",
  "SOC 2 questionnaire automation",
  "compliance automation",
  "RAG citations",
  "security review workflow",
  "trust center operations",
];
