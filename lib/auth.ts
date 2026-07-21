import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";
import {
  sendEmail,
  otpEmailTemplate,
  passwordResetEmailTemplate,
} from "@/lib/mailer";

function parseSslConfig(databaseUrl: string): {
  connectionString: string;
  ssl?: pg.PoolConfig["ssl"];
} {
  if (!databaseUrl) {
    return { connectionString: databaseUrl };
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    return { connectionString: databaseUrl };
  }

  // Prisma Accelerate uses a special connection format
  if (url.hostname.includes("prisma-data.net") || databaseUrl.startsWith("prisma+")) {
    return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
  }

  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  if (sslMode) {
    url.searchParams.delete("sslmode");
  }

  const forceNoVerify =
    process.env.PGSSL_NO_VERIFY === "true" ||
    process.env.PGSSL_NO_VERIFY === "1";

  let ssl: pg.PoolConfig["ssl"] | undefined;

  if (sslMode && sslMode !== "disable") {
    if (sslMode === "verify-ca" || sslMode === "verify-full") {
      ssl = { rejectUnauthorized: true };
    } else {
      ssl = { rejectUnauthorized: false };
    }
  }

  if (!ssl && url.hostname.endsWith(".prisma.io")) {
    ssl = { rejectUnauthorized: false };
  }

  if (ssl && forceNoVerify) {
    ssl = { rejectUnauthorized: false };
  }

  return {
    connectionString: url.toString(),
    ssl,
  };
}

type AuthDbClients = {
  pool: pg.Pool;
  prisma: PrismaClient;
};

const globalForAuthDb = globalThis as unknown as {
  __vaultixAuthDb?: AuthDbClients;
};

function createAuthDbClients(): AuthDbClients {
  const rawDatabaseUrl = process.env.DATABASE_URL || "";
  const { connectionString, ssl } = parseSslConfig(rawDatabaseUrl);

  const poolMax = Number.parseInt(process.env.PG_POOL_MAX || "5", 10);

  const pool = new pg.Pool({
    connectionString,
    ssl,
    max: Number.isNaN(poolMax) ? 5 : poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return { pool, prisma };
}

const authDbClients = globalForAuthDb.__vaultixAuthDb ?? createAuthDbClients();
const { prisma } = authDbClients;

if (process.env.NODE_ENV !== "production") {
  globalForAuthDb.__vaultixAuthDb = authDbClients;
  
  // Debug logging
  console.log("[auth] ===== AUTH CONFIG =====");
  console.log("[auth] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("[auth] GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ set" : "❌ missing");
  console.log("[auth] BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
  console.log("[auth] REDIRECT_URL:", process.env.BETTER_AUTH_URL + "/api/auth/callback/google");
  console.log("[auth] DATABASE_URL:", process.env.DATABASE_URL ? "✅ set" : "❌ missing");
  console.log("[auth] ========================");
}

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
      "http://localhost:5000",
      "https://*.replit.dev",
      "https://*.replit.app",
      "https://*.janeway.replit.dev",
      "https://*.picard.replit.dev",
      "https://*.kirk.replit.dev",
      "https://*.riker.replit.dev",
      "https://*.spock.replit.dev",
      "https://*.sisko.replit.dev",
      "https://*.worf.replit.dev",
    ].filter(Boolean) as string[],
  ),
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const tpl = passwordResetEmailTemplate(url);
      
      console.log(`\n=========================================`);
      console.log(`[auth] Password Reset Link for ${user.email}:`);
      console.log(url);
      console.log(`=========================================\n`);
      
      await sendEmail({
        to: user.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      company: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        const tpl = otpEmailTemplate(otp, type);
        
        // Log the OTP explicitly so the user can test locally without SMTP setup!
        console.log(`\n=========================================`);
        console.log(`[auth] OTP for ${email}: ${otp}`);
        console.log(`=========================================\n`);
        
        await sendEmail({
          to: email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
    },
    logger: {
      error: (err: any) => {
        console.error("[Better Auth] ERROR:", err);
      },
      warn: (msg: any) => {
        console.warn("[Better Auth] WARN:", msg);
      },
      debug: (msg: any) => {
        console.log("[Better Auth] DEBUG:", msg);
      },
    },
  },
});
