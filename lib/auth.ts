import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";

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
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
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
  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});
