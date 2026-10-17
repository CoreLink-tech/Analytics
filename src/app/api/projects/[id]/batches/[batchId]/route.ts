import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteImportBatch } from "@/lib/analytics/manage";

type RouteContext = { params: Promise<{ id: string; batchId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId, batchId } = await context.params;
  const result = await deleteImportBatch(batchId, projectId, session.user.id);

  if ("error" in result) {
    const status = result.error.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ deletedRecords: result.deletedRecords });
}
