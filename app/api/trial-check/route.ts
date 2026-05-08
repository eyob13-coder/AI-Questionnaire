import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ allowed: true });
  } catch (err) {
    console.error("[trial-check] disabled route error", err);
    return NextResponse.json({ allowed: true });
  }
}
