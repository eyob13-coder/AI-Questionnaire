import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Re-use a single Prisma instance per Next.js server process.
const globalForPrisma = globalThis as unknown as {
  __vaultixTrialPrisma?: PrismaClient;
};

function getPrisma(): PrismaClient {
  if (globalForPrisma.__vaultixTrialPrisma) return globalForPrisma.__vaultixTrialPrisma;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  globalForPrisma.__vaultixTrialPrisma = prisma;
  return prisma;
}

const TRIAL_SALT = process.env.TRIAL_FRAUD_SALT || "vaultix-trial-salt-v1";

function hashValue(value: string): string {
  return createHash("sha256").update(`${TRIAL_SALT}:${value}`).digest("hex");
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("fly-client-ip") ||
    "unknown"
  );
}

function isLocalIp(ip: string): boolean {
  return (
    ip === "unknown" ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  );
}

interface CheckBody {
  action: "check" | "claim";
  fingerprint?: string;
  email?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  let body: CheckBody;
  try {
    body = (await req.json()) as CheckBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const ipHash = hashValue(ip);
  const fingerprintHash = body.fingerprint ? hashValue(body.fingerprint) : null;
  const ua = req.headers.get("user-agent") || null;
  const prisma = getPrisma();

  if (body.action === "check") {
    if (!fingerprintHash) {
      return NextResponse.json({ allowed: true });
    }

    const existing = await prisma.trialClaim.findFirst({
      where: { fingerprintHash },
      select: { id: true, ipHash: true, fingerprintHash: true, email: true },
    });

    if (existing) {
      const reason =
        "It looks like you've already started a free trial on this device. Please sign in to your existing account.";
      return NextResponse.json({
        allowed: false,
        reason,
        matched: "device",
      });
    }

    return NextResponse.json({ allowed: true });
  }

  if (body.action === "claim") {
    if (!body.userId || !body.email) {
      return NextResponse.json(
        { error: "userId and email are required to claim" },
        { status: 400 },
      );
    }

    try {
      await prisma.trialClaim.upsert({
        where: { userId: body.userId },
        update: {},
        create: {
          userId: body.userId,
          email: body.email.toLowerCase(),
          ipHash,
          fingerprintHash,
          userAgent: ua,
        },
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[trial-check] claim failed", err);
      return NextResponse.json({ error: "Claim failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
