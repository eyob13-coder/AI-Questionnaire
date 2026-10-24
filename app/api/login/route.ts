import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { email, password, callbackURL } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit: 5 login attempts per 60s per IP + email
    const limitResult = checkRateLimit(`login:${ip}:${normalizedEmail}`, {
      windowMs: 60_000,
      max: 5,
    });

    if (!limitResult.success) {
      const waitSec = Math.max(1, Math.ceil((limitResult.reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${waitSec}s before trying again.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(waitSec),
          },
        }
      );
    }

    const response = await auth.api.signInEmail({
      body: {
        email: email.trim().toLowerCase(),
        password,
        callbackURL: callbackURL || "/dashboard",
      },
      asResponse: true,
      headers: req.headers,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed.";
    console.error("[api/login] Error:", message);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
