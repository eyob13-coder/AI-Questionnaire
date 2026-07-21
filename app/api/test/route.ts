import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "missing",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "missing",
  });
}
