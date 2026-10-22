import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, redirectTo } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const response = await auth.api.forgetPassword({
      body: {
        email: email.trim().toLowerCase(),
        redirectTo: redirectTo || "/reset-password",
      },
      asResponse: true,
      headers: req.headers,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password reset request failed.";
    console.error("[api/forgot-password] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
