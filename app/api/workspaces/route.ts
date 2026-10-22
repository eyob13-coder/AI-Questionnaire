import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: {
            questionnaires: true,
            documents: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Auto-bootstrap personal workspace if none exist
    if (workspaces.length === 0) {
      const slug = `workspace-${userId.slice(-6)}-${Date.now().toString(36)}`;
      const created = await prisma.workspace.create({
        data: {
          name: `${session.user.name || "My"} Workspace`,
          slug,
          members: {
            create: {
              userId,
              role: "OWNER",
            },
          },
        },
        include: {
          _count: {
            select: {
              questionnaires: true,
              documents: true,
              members: true,
            },
          },
        },
      });
      workspaces = [created];
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch workspaces";
    console.error("[api/workspaces] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        _count: {
          select: {
            questionnaires: true,
            documents: true,
            members: true,
          },
        },
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create workspace";
    console.error("[api/workspaces] POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
