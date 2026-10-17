import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchExportRows, rowsToCsv } from "@/lib/analytics/manage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") || "csv").toLowerCase();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const metric = url.searchParams.get("metric");

  const rows = await fetchExportRows(
    projectId,
    session.user.id,
    {
      from: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : null,
      to: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : null,
    },
    metric || null
  );

  if (rows === null) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "json") {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="analytics-${projectId.slice(0, 8)}-${stamp}.json"`,
      },
    });
  }

  const csv = rowsToCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${projectId.slice(0, 8)}-${stamp}.csv"`,
    },
  });
}
