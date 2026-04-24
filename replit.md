# AI Questionnaire (Vaultix)

Next.js 16 app (App Router, Turbopack) imported from Vercel. Uses React 19, Tailwind v4, Better Auth, Prisma + Postgres (pgvector). A separate NestJS backend lives in `backend/` and is optional for local UI work.

## Run on Replit

- Workflow `Start application` runs `npm run dev` (bound to `0.0.0.0:5000`).
- `next.config.ts` allows `*.replit.dev` and `*.replit.app` dev origins so the Replit preview iframe works.
- No environment variables are required to boot the marketing/landing UI. Features that hit the DB / backend / payments need secrets wired through the Secrets store later (e.g. `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_*`).

## Structure

- `app/` — Next.js routes, server components, client landing page.
- `components/` — UI, dashboard, layout, auth components.
- `lib/` — auth (Better Auth + Prisma), API client (`api.ts` browser, `api-server.ts` server), stores, helpers.
- `public/` — static assets.
- `backend/` — separate NestJS service (Prisma, BullMQ, Redis). Not started by the default workflow.
