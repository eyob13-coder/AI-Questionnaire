import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, callbackURL } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
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
