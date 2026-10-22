import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    // Try better-auth verifyEmail plugin endpoint
    const response = await (auth.api as any).verifyEmail({
      body: {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      },
      asResponse: true,
      headers: req.headers,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OTP verification failed.";
    console.error("[api/verify-otp] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
