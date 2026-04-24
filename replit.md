# AI Questionnaire (Vaultix)

Next.js 16 app (App Router, Turbopack) imported from Vercel. Uses React 19, Tailwind v4, Better Auth, Prisma + Postgres (pgvector). A separate NestJS backend lives in `backend/` and is optional for local UI work.

## Run on Replit

- Workflow `Start application` runs `npm run dev` (bound to `0.0.0.0:5000`).
- `next.config.ts` allows `*.replit.dev` and `*.replit.app` dev origins so the Replit preview iframe works.
- No environment variables are required to boot the marketing/landing UI. Features that hit the DB / backend / payments need secrets wired through the Secrets store later (e.g. `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_*`).

## Stripe billing

- Plan price config: `lib/plans.ts` (Starter $49/mo, Pro $149/mo, Enterprise = contact sales).
- Server Stripe client: `lib/stripe.ts` (reads `STRIPE_SECRET_KEY` from Replit Secrets).
- Checkout API: `POST /api/billing/checkout` with `{ plan: "STARTER" | "PRO", workspaceId? }` returns a Stripe Checkout URL. The endpoint pulls the signed-in user from Better Auth and uses Stripe `price_data` so no pre-created Stripe Price IDs are required.
- UI: `app/dashboard/billing/page.tsx` — Upgrade buttons start checkout for the selected plan, redirect to Stripe, and return to `/dashboard/billing/success` (or `/dashboard/billing?canceled=1` on cancel).
- Required secrets: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Plan persistence (writing the new plan back to the workspace) lives in the NestJS backend's `BillingService` and isn't auto-updated by the Next.js checkout yet — wire a Stripe webhook to `BillingService` (or to a new `/api/billing/webhook` route) when you're ready to flip the workspace plan automatically.

## Structure

- `app/` — Next.js routes, server components, client landing page.
- `components/` — UI, dashboard, layout, auth components.
- `lib/` — auth (Better Auth + Prisma), API client (`api.ts` browser, `api-server.ts` server), stores, helpers.
- `public/` — static assets.
- `backend/` — separate NestJS service (Prisma, BullMQ, Redis). Not started by the default workflow.
