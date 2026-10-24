import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { email, password, name, company } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Rate limit: 5 sign-up attempts per 5 minutes per IP
    const limitResult = checkRateLimit(`register:${ip}`, {
      windowMs: 300_000,
      max: 5,
    });

    if (!limitResult.success) {
      const waitSec = Math.max(1, Math.ceil((limitResult.reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: `Too many sign-up attempts. Please wait ${Math.ceil(waitSec / 60)} minutes before trying again.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(waitSec),
          },
        }
      );
    }

    const response = await auth.api.signUpEmail({
      body: {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        callbackURL: "/dashboard",
        ...(company ? { company: String(company).trim() } : {}),
      },
      asResponse: true,
      headers: req.headers,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Account registration failed.";
    console.error("[api/register] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
