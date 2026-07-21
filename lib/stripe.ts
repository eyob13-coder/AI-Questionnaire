import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { __vaultixStripe?: Stripe };

function createClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
      console.warn("STRIPE_SECRET_KEY is not set. Billing will not work.");
    }
    // Return a dummy client to prevent build errors during Next.js static generation
    return new Stripe("sk_test_dummy");
  }
  return new Stripe(key);
}

export const stripe: Stripe =
  globalForStripe.__vaultixStripe ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForStripe.__vaultixStripe = stripe;
}
