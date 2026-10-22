import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "set" : "missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "missing",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "missing",
  });
}
