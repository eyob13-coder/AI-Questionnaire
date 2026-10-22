import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const response = await auth.api.signOut({
      headers: req.headers,
      asResponse: true,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log out.";
    console.error("[api/logout] Error:", message);
    return NextResponse.json({ success: true, message });
  }
}
