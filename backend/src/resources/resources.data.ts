export interface ResourceArticle {
    slug: string;
    title: string;
    category:
    | 'Playbook'
    | 'Guide'
    | 'Research'
    | 'Template'
    | 'Case Study';
    readTime: string;
    description: string;
    featured: boolean;
    date: string;
    gradient: string;
    body: string;
}

export const RESOURCE_ARTICLES: ResourceArticle[] = [
    {
        slug: 'cut-questionnaire-review-time',
        title: 'How to cut questionnaire review time by 60%',
        category: 'Playbook',
        readTime: '6 min read',
        description:
            'A step-by-step workflow used by top security teams to go from questionnaire upload to approved export in under a business day.',
        featured: true,
        date: 'Mar 2026',
        gradient: 'from-brand/20 to-orange-700/10',
        body: `Security questionnaires used to take our team a full week per deal. Today, the same volume takes us less than four hours from upload to approved export. The change wasn't a single tool — it was a workflow.

## The four-stage workflow

**1. Centralize source-of-truth documents.** Every policy, architecture diagram, and audit report should live in a single, indexed knowledge base. The biggest time sink in questionnaires is hunting for "where did we say that?" — eliminate that hunt entirely.

**2. Generate first drafts in bulk.** Don't review questions one at a time. Let your AI tool draft answers for the entire questionnaire in one pass. Reviewers should walk into a fully populated spreadsheet, not a blank one.

**3. Filter by confidence, not by row.** Sort the AI drafts by confidence score. Anything above 85% gets a 30-second skim. Below 50% gets a deeper look. Mid-range answers are where reviewers earn their salary.

**4. Approve in bulk, then export.** Use bulk-approve for high-confidence rows. Export with citation tracking enabled so the buyer's audit team can verify every claim.

## The numbers

Across 47 questionnaires we processed in Q1, this workflow delivered:

- **62% reduction** in average completion time
- **94% acceptance** rate from buyers on first review
- **Zero** rework cycles caused by hallucinated answers (citations save you here)

The compounding benefit: as your knowledge base grows, your confidence scores climb, and the high-confidence pool you can bulk-approve gets larger every quarter.`,
    },
    {
        slug: 'citation-first-ai-workflow',
        title: 'Build a citation-first AI security workflow',
        category: 'Guide',
        readTime: '8 min read',
        description:
            'Why citation-backed answers win audits, and how to configure your knowledge base for maximum answer coverage.',
        featured: false,
        date: 'Feb 2026',
        gradient: 'from-info/20 to-blue-700/10',
        body: `An AI answer without a citation is a liability. An AI answer with a citation is evidence. The difference matters most when a buyer's auditor asks "where did this come from?"

## Why citations win audits

Auditors aren't trying to catch you in a lie — they're trying to verify that what you wrote down matches what you actually do. A citation pointing to your security policy or SOC 2 report turns a one-line answer into something defensible.

## Configuring your knowledge base for coverage

The single biggest predictor of citation quality is **chunk granularity**. If your documents are stored as massive 50-page PDFs without chunking, your AI will retrieve loosely-relevant context and write vague answers.

Best practices:

- **Upload focused documents** — split your master security policy into one document per domain (access control, encryption, incident response, etc.)
- **Keep version metadata** — when policies change, replace the indexed version, don't just append
- **Pin authoritative sources** — your latest SOC 2 report, your current ISO certification — these should always be reachable

## What "citation-first" looks like in practice

Every generated answer should have:
1. A direct quote or paraphrase from a source document
2. A page or section reference
3. A confidence score that reflects how strong the supporting evidence is

If the AI cannot find supporting evidence above a confidence threshold, it should say "Insufficient information in knowledge base" rather than invent an answer. That single behavior change prevents 90% of audit failures.`,
    },
    {
        slug: 'enterprise-buyer-questions-2026',
        title: 'What enterprise buyers ask in 2026 security reviews',
        category: 'Research',
        readTime: '5 min read',
        description:
            'Analysis of 3,400 real security questionnaire questions across fintech, healthcare, and B2B SaaS deals.',
        featured: false,
        date: 'Jan 2026',
        gradient: 'from-success/20 to-green-700/10',
        body: `We analyzed 3,400 questions from real 2025–2026 security reviews. Here's what enterprise buyers care about now.

## The top categories (by question volume)

1. **AI governance** (18%) — How do you train models? What data is used? Can customers opt out?
2. **Vendor risk and supply chain** (16%) — SBOM disclosure, third-party assessments, dependency security
3. **Identity and access** (14%) — MFA enforcement, SSO/SAML, JIT access, key rotation cadence
4. **Data residency** (12%) — Where data lives, sub-processor lists, cross-border transfers
5. **Incident response** (11%) — Notification timelines, breach history, tabletop exercise frequency

## What changed since 2024

The biggest shift is the rise of AI-specific questions. In 2024, AI governance was 4% of questions. In 2026, it's 18%. Buyers want to know:

- Whether their data is used to train your models
- How you isolate model outputs from sensitive inputs
- What your AI incident response plan looks like

## What hasn't changed

Encryption at rest, backup frequency, penetration testing cadence — these foundational questions haven't moved. They are also the questions where AI-drafted answers tend to score highest, because the underlying policies don't change often.

The takeaway: invest your reviewer time on the new, evolving categories. Let automation handle the foundational ones.`,
    },
    {
        slug: 'soc2-questionnaire-template',
        title: 'SOC 2 questionnaire starter template',
        category: 'Template',
        readTime: 'Free download',
        description:
            'Pre-filled SOC 2 Type II questionnaire with 120 questions mapped to common trust service criteria.',
        featured: false,
        date: 'Dec 2025',
        gradient: 'from-warning/20 to-yellow-700/10',
        body: `This template covers 120 commonly asked SOC 2 Type II questions, organized by trust service criteria. Use it as a starting point for vendor assessments or to seed your own knowledge base.

## What's included

- **Security (CC6)** — 38 questions on access control, encryption, network security
- **Availability (A1)** — 16 questions on uptime, backup, disaster recovery
- **Confidentiality (C1)** — 14 questions on data classification and handling
- **Processing Integrity (PI1)** — 12 questions on data accuracy and completeness
- **Privacy (P1–P8)** — 40 questions covering the privacy criteria in full

## How to use it

1. Drop the template into your Vaultix knowledge base
2. Upload your SOC 2 report alongside it
3. Run answer generation — most questions will populate from your existing report
4. Customize the remaining 10–15% with your specific implementation details

The goal isn't to send this template as your answer. It's to make sure no buyer ever asks you a SOC 2 question you weren't already prepared for.`,
    },
    {
        slug: 'meridian-cloud-case-study',
        title: 'How Meridian Cloud closed 4 enterprise deals in one quarter',
        category: 'Case Study',
        readTime: '4 min read',
        description:
            'Reducing security review cycles from 3 days to 4 hours unlocked a new tier of enterprise buyer for their sales team.',
        featured: false,
        date: 'Nov 2025',
        gradient: 'from-purple-500/20 to-purple-800/10',
        body: `Meridian Cloud is a 90-person infrastructure-as-code platform serving mid-market and enterprise customers. Before automating their security review workflow, every enterprise deal stalled at the same step: the questionnaire.

## The problem

Their security team of three was the bottleneck on every deal above $100k ARR. Average questionnaire turnaround was 3 business days. With four enterprise deals in the pipeline simultaneously, the math didn't work.

## The change

In September 2025, Meridian moved their security policies, SOC 2 report, and architecture documentation into a single AI-powered knowledge base. Their team adopted a citation-first review workflow with confidence-based filtering.

## The results

In Q4 2025:
- **Average questionnaire turnaround:** 3 days → 4 hours
- **Enterprise deals closed:** 4 (vs. 1 in Q3)
- **Security team headcount:** unchanged

## What the security lead said

"We used to dread Friday afternoons because that's when questionnaires would land for the following week. Now they get answered the same day they arrive, and our sales team has stopped scheduling deals around our review capacity. That's the real change — security stopped being a deal blocker."`,
    },
    {
        slug: 'confidence-scoring-explained',
        title: "Confidence scoring explained: how Vaultix knows what it doesn't know",
        category: 'Guide',
        readTime: '7 min read',
        description:
            'Deep dive into how confidence scores are calculated, calibrated, and why they beat simple hallucination detection.',
        featured: false,
        date: 'Oct 2025',
        gradient: 'from-info/20 to-blue-700/10',
        body: `A confidence score is only useful if it's calibrated. A 90% confidence answer should be wrong about 10% of the time — no more, no less. Most AI systems get this wrong.

## What goes into a confidence score

Vaultix combines four signals:

1. **Retrieval quality** — How closely do the retrieved knowledge chunks match the question semantically?
2. **Source coverage** — How many independent documents support the answer?
3. **Model self-assessment** — The LLM's own probability estimates for the generated tokens
4. **Citation density** — How much of the answer can be directly grounded in source text vs. interpolated?

## Why this beats simple hallucination detection

Hallucination detection asks "is this answer wrong?" Confidence scoring asks "how much should you trust this answer?" The second question is more actionable.

A reviewer can use a calibrated confidence score to:
- Bulk-approve high-confidence answers (>85%) with a quick scan
- Spend their attention on mid-range answers (50–85%) where editing pays off most
- Reject or rewrite low-confidence answers (<50%) where the AI is essentially guessing

## Calibration in practice

We continuously sample reviewer feedback against AI confidence scores. When the calibration drifts (say, 90% confidence answers are getting rejected 20% of the time), the model is retrained on the corrected outputs. Over time, your team's confidence scores become *your* team's confidence scores — calibrated to your reviewers' standards.`,
    },
];
