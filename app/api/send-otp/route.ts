import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { maskEmail } from "@/lib/email-validation";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { email, type } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit: 3 OTP requests per 2 minutes per IP + email
    const limitResult = checkRateLimit(`otp:${ip}:${normalizedEmail}`, {
      windowMs: 120_000,
      max: 3,
    });

    if (!limitResult.success) {
      const waitSec = Math.max(1, Math.ceil((limitResult.reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: `Too many verification requests. Please wait ${waitSec}s before requesting another code.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(waitSec),
          },
        }
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
