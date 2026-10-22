import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const sessionData = await auth.api.getSession({
      headers: req.headers,
    });

    if (!sessionData?.user) {
      return NextResponse.json(
        { user: null, session: null, isAuth: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: sessionData.user,
      session: sessionData.session,
      isAuth: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve session.";
    return NextResponse.json(
      { user: null, session: null, isAuth: false, error: message },
      { status: 500 }
    );
  }
}
