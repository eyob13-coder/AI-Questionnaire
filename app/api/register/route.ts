import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, company } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
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
