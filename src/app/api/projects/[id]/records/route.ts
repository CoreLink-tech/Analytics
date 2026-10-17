import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteRecordsInRange } from "@/lib/analytics/manage";

type RouteContext = { params: Promise<{ id: string }> };

/** DELETE records by optional date range and/or metric. Requires at least one filter. */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  let body: { from?: string; to?: string; metric?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await deleteRecordsInRange(
    projectId,
    session.user.id,
    {
      from: body.from && /^\d{4}-\d{2}-\d{2}$/.test(body.from) ? body.from : null,
      to: body.to && /^\d{4}-\d{2}-\d{2}$/.test(body.to) ? body.to : null,
    },
    body.metric?.trim() || null
  );

  if ("error" in result) {
    const status = result.error === "Project not found." ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ deleted: result.deleted });
}
