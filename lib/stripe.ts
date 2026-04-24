import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { __vaultixStripe?: Stripe };

function createClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it in Replit Secrets to enable billing.",
    );
  }
  return new Stripe(key);
}

export const stripe: Stripe =
  globalForStripe.__vaultixStripe ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForStripe.__vaultixStripe = stripe;
}
