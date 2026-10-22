export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  stage: string;
  avatar: string;
  rating: number;
  highlight?: string;
}

export const testimonialsCol1: Testimonial[] = [
  {
    quote:
      "We used to spend 3 days per SOC 2 questionnaire. With Vaultix it's under 4 hours. Our security team went from a deal bottleneck to a competitive sales advantage.",
    name: "Sarah Chen",
    title: "Head of Security",
    company: "Meridian Cloud",
    stage: "Series B · 280 employees",
    avatar: "SC",
    rating: 5,
    highlight: "Under 4 hours turnaround",
  },
  {
    quote:
      "Passing enterprise security audits went from a 3-week scramble to a 1-day formality. The audit trail captured every reviewer action with zero ambiguity.",
    name: "Elena Rostova",
    title: "VP of Compliance",
    company: "VantaTech",
    stage: "Scaleup · 450 employees",
    avatar: "ER",
    rating: 5,
    highlight: "1-day audit formality",
  },
  {
    quote:
      "The automatic citation engine saves us 15+ hours a week. Every single claim links directly to our verified policies with page-level precision.",
    name: "Tariq Mansour",
    title: "Director of GRC",
    company: "CyberShield Labs",
    stage: "Series A · 80 employees",
    avatar: "TM",
    rating: 5,
    highlight: "15+ hrs saved weekly",
  },
];

export const testimonialsCol2: Testimonial[] = [
  {
    quote:
      "The confidence scores are a game-changer. I know exactly which answers need human review and which I can approve in bulk. It cut our review time by 80%.",
    name: "Marcus Reid",
    title: "CISO",
    company: "Lattice Systems",
    stage: "Series C · 600 employees",
    avatar: "MR",
    rating: 5,
    highlight: "80% faster review queue",
  },
  {
    quote:
      "The citations linked directly to our AWS architecture guide gave enterprise procurement auditors zero reasons to push back. Flawless execution.",
    name: "David Kross",
    title: "Director of InfoSec",
    company: "FinSecure Core",
    stage: "Series B · 190 employees",
    avatar: "DK",
    rating: 5,
    highlight: "Zero auditor pushback",
  },
  {
    quote:
      "Handling HIPAA and GDPR questionnaires across 50 enterprise prospects simultaneously would have required hiring 3 more analysts without Vaultix.",
    name: "Maya Lin",
    title: "Chief Risk Officer",
    company: "Aether Health",
    stage: "Enterprise · 1,200 employees",
    avatar: "ML",
    rating: 5,
    highlight: "Replaced 3 FTE hires",
  },
];

export const testimonialsCol3: Testimonial[] = [
  {
    quote:
      "Our sales team can now self-serve security reviews without pulling the security team into every deal. We're closing enterprise contracts 3 weeks faster.",
    name: "Priya Nair",
    title: "VP of Engineering",
    company: "Nexlify",
    stage: "Series A · 95 employees",
    avatar: "PN",
    rating: 5,
    highlight: "Close deals 3 weeks faster",
  },
  {
    quote:
      "Round-trip spreadsheet preservation is real. Upload an ugly 400-question Excel sheet, get it back with all original fonts, dropdowns, and formulas intact.",
    name: "Julian Vance",
    title: "Lead Solutions Architect",
    company: "Prism Global",
    stage: "Series B · 310 employees",
    avatar: "JV",
    rating: 5,
    highlight: "100% format preservation",
  },
  {
    quote:
      "The shared library gets smarter after every questionnaire. Answers approved last month automatically ground new questionnaires today.",
    name: "Chloe Zhang",
    title: "Head of Trust & Safety",
    company: "Beacon Data",
    stage: "Series C · 520 employees",
    avatar: "CZ",
    rating: 5,
    highlight: "Self-improving library",
  },
];
