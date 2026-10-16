import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createProject,
  listProjectsForUser,
} from "@/lib/projects/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const projects = await listProjectsForUser(session.user.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as {
    name?: string;
    domain?: string | null;
    description?: string | null;
  };

  const result = await createProject(session.user.id, {
    name: input.name ?? "",
    domain: input.domain,
    description: input.description,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ project: result.project }, { status: 201 });
}
