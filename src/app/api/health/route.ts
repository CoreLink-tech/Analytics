import { NextResponse } from "next/server";
import { getDatabaseUrl, isProductionDbRuntime } from "@/lib/db/client";

export async function GET() {
  let dbMode: "configured" | "local-file" | "missing-production" = "local-file";
  try {
    const url = getDatabaseUrl();
    dbMode = url.startsWith("file:") ? "local-file" : "configured";
  } catch {
    dbMode = "missing-production";
  }

  const ok = dbMode !== "missing-production";

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      app: "analytics-history-archive",
      production: isProductionDbRuntime(),
      database: dbMode,
      time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
