import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const response = await (auth.api as any).sendVerificationOTP({
      body: {
        email: email.trim().toLowerCase(),
        type: type || "email-verification",
      },
      asResponse: true,
      headers: req.headers,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send verification code.";
    console.error("[api/send-otp] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
