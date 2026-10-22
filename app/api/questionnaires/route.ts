import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId query parameter is required" },
        { status: 400 }
      );
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questionnaires);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch questionnaires";
    console.error("[api/questionnaires] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
