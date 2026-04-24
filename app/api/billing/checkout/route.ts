import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PLANS, isPurchasablePlan, type PlanKey } from "@/lib/plans";

function resolveAppUrl(reqUrl: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  try {
    return new URL(reqUrl).origin;
  } catch {
    return "http://localhost:5000";
  }
}

export async function POST(req: Request) {
  let body: { plan?: string; workspaceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const planKey = body.plan;
  if (!planKey || typeof planKey !== "string" || !(planKey in PLANS)) {
    return NextResponse.json(
      { error: "Unknown plan. Choose STARTER or PRO." },
      { status: 400 },
    );
  }
  if (!isPurchasablePlan(planKey)) {
    return NextResponse.json(
      { error: "This plan is not self-serve. Please contact sales." },
      { status: 400 },
    );
  }

  const plan = PLANS[planKey as PlanKey];
  if (!plan.amountUsdCents || !plan.interval) {
    return NextResponse.json(
      { error: "Plan is not configured for self-serve checkout." },
      { status: 400 },
    );
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    session = null;
  }

  const baseUrl = resolveAppUrl(req.url);
  const successUrl = `${baseUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/dashboard/billing?canceled=1`;

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.amountUsdCents,
          recurring: { interval: plan.interval },
          product_data: {
            name: `Vaultix ${plan.name}`,
            description: plan.features.join(" • "),
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan: plan.key,
      workspaceId: body.workspaceId ?? "",
      userId: session?.user?.id ?? "",
    },
    subscription_data: {
      metadata: {
        plan: plan.key,
        workspaceId: body.workspaceId ?? "",
        userId: session?.user?.id ?? "",
      },
    },
  };

  if (session?.user?.email) {
    params.customer_email = session.user.email;
  }

  try {
    const checkout = await stripe.checkout.sessions.create(params);
    if (!checkout.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: checkout.url, id: checkout.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
