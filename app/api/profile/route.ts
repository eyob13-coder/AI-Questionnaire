import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        company: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, company, image, email } = body;

    if (email && typeof email === "string" && email.trim().toLowerCase() !== session.user.email.toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "This email address is already in use by another account." }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(company !== undefined ? { company: company.trim() } : {}),
        ...(image !== undefined ? { image: image ? image.trim() : null } : {}),
        ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        company: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile.";
    console.error("[api/profile] PATCH error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
