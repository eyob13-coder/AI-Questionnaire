import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    const response = await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
      asResponse: true,
      headers: req.headers,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password reset failed.";
    console.error("[api/reset-password] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
