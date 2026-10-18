import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { resolveApiKey } from "@/lib/projects/api-keys";
import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import { rateLimit } from "@/lib/security/rate-limit";

type IngestRecord = {
  observation_date?: string;
  date?: string;
  metric_name?: string;
  metric?: string;
  metric_value?: number | string;
  value?: number | string;
  page_path?: string | null;
  path?: string | null;
  dimension_name?: string | null;
  dimension_value?: string | null;
  source_record_id?: string | null;
};

/**
 * Public ingest endpoint for customer websites.
 * Authorization: Bearer <aha_...>
 *
 * Body:
 * {
 *   "records": [
 *     { "date": "2026-10-01", "metric_name": "pageviews", "metric_value": 120, "path": "/" }
 *   ]
 * }
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) {
    return NextResponse.json(
      { error: "Missing Authorization: Bearer <api_key>." },
      { status: 401 }
    );
  }

  const resolved = await resolveApiKey(match[1]);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401 });
  }

  const limited = rateLimit(`ingest:${resolved.projectId}`, 120, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429 }
    );
  }

  let body: { records?: IngestRecord[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const records = Array.isArray(body.records) ? body.records : null;
  if (!records || records.length === 0) {
    return NextResponse.json(
      { error: "Body must include a non-empty records array." },
      { status: 400 }
    );
  }
  if (records.length > 1000) {
    return NextResponse.json(
      { error: "Maximum 1000 records per request." },
      { status: 400 }
    );
  }

  await ensureDbReady();
  const db = await getDb();
  const now = new Date().toISOString();
  let accepted = 0;
  let rejected = 0;

  for (const raw of records) {
    const observationDate = String(raw.observation_date || raw.date || "").slice(0, 10);
    const metricName = String(raw.metric_name || raw.metric || "").trim();
    const valueRaw = raw.metric_value ?? raw.value;
    const metricValue = Number(valueRaw);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(observationDate) || !metricName || Number.isNaN(metricValue)) {
      rejected += 1;
      continue;
    }

    const pagePath = raw.page_path ?? raw.path ?? null;
    const sourceRecordId = raw.source_record_id ?? null;

    await db.execute({
      sql: `INSERT INTO analytics_records (
              id, project_id, source, source_record_id, metric_name, metric_value,
              observation_date, period_end, dimension_name, dimension_value,
              page_path, import_batch_id, source_metadata, created_at
            ) VALUES (?, ?, 'api', ?, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, ?)`,
      args: [
        randomUUID(),
        resolved.projectId,
        sourceRecordId,
        metricName.slice(0, 120),
        metricValue,
        observationDate,
        raw.dimension_name == null ? null : String(raw.dimension_name).slice(0, 120),
        raw.dimension_value == null ? null : String(raw.dimension_value).slice(0, 255),
        pagePath == null ? null : String(pagePath).slice(0, 500),
        now,
      ],
    });
    accepted += 1;
  }

  return NextResponse.json({
    ok: true,
    projectId: resolved.projectId,
    accepted,
    rejected,
  });
}
