import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createApiKey,
  listApiKeysForProject,
  revokeApiKey,
} from "@/lib/projects/api-keys";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  const keys = await listApiKeysForProject(projectId, session.user.id);
  if (keys === null) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ keys });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  let name = "Default";
  try {
    const body = (await request.json()) as { name?: string };
    if (body.name?.trim()) name = body.name.trim();
  } catch {
    // optional body
  }

  const result = await createApiKey(projectId, session.user.id, name);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(
    {
      key: result.meta,
      secret: result.secret,
      message:
        "Copy this secret now. It will not be shown again. Use it as Authorization: Bearer <secret>.",
    },
    { status: 201 }
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  const url = new URL(request.url);
  const keyId = url.searchParams.get("keyId");
  if (!keyId) {
    return NextResponse.json({ error: "keyId query param required." }, { status: 400 });
  }

  const result = await revokeApiKey(keyId, projectId, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
