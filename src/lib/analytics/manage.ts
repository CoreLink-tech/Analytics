import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import { getProjectForUser } from "@/lib/projects/store";
import type { DateRange } from "@/lib/analytics/queries";

function isValidDate(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export type ExportRow = {
  observation_date: string;
  metric_name: string;
  metric_value: number;
  period_end: string | null;
  page_path: string | null;
  dimension_name: string | null;
  dimension_value: string | null;
  source: string;
  source_record_id: string | null;
};

/** Fetch rows for export (capped). Ownership required. */
export async function fetchExportRows(
  projectId: string,
  userId: string,
  range: DateRange,
  metricName: string | null,
  limit = 5000
): Promise<ExportRow[] | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const args: (string | number)[] = [projectId];
  let where = "project_id = ?";
  if (isValidDate(range.from)) {
    where += " AND observation_date >= ?";
    args.push(range.from);
  }
  if (isValidDate(range.to)) {
    where += " AND observation_date <= ?";
    args.push(range.to);
  }
  if (metricName) {
    where += " AND metric_name = ?";
    args.push(metricName);
  }
  const lim = Math.min(Math.max(limit, 1), 10000);
  args.push(lim);

  const result = await db.execute({
    sql: `SELECT observation_date, metric_name, metric_value, period_end,
                 page_path, dimension_name, dimension_value, source, source_record_id
          FROM analytics_records
          WHERE ${where}
          ORDER BY observation_date ASC, metric_name ASC
          LIMIT ?`,
    args,
  });

  return result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      observation_date: String(row.observation_date),
      metric_name: String(row.metric_name),
      metric_value: Number(row.metric_value),
      period_end: row.period_end == null ? null : String(row.period_end),
      page_path: row.page_path == null ? null : String(row.page_path),
      dimension_name: row.dimension_name == null ? null : String(row.dimension_name),
      dimension_value:
        row.dimension_value == null ? null : String(row.dimension_value),
      source: String(row.source),
      source_record_id:
        row.source_record_id == null ? null : String(row.source_record_id),
    };
  });
}

export function rowsToCsv(rows: ExportRow[]): string {
  const headers = [
    "observation_date",
    "metric_name",
    "metric_value",
    "period_end",
    "page_path",
    "dimension_name",
    "dimension_value",
    "source",
    "source_record_id",
  ] as const;

  const escape = (v: string | number | null) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

/** Delete records in date range (optional metric). Returns deleted count. */
export async function deleteRecordsInRange(
  projectId: string,
  userId: string,
  range: DateRange,
  metricName: string | null
): Promise<{ deleted: number } | { error: string }> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return { error: "Project not found." };

  if (!isValidDate(range.from) && !isValidDate(range.to) && !metricName) {
    return {
      error:
        "Specify a date range and/or metric to delete. Refusing unbounded delete.",
    };
  }

  const db = await getDb();
  const args: (string | number)[] = [projectId];
  let where = "project_id = ?";
  if (isValidDate(range.from)) {
    where += " AND observation_date >= ?";
    args.push(range.from);
  }
  if (isValidDate(range.to)) {
    where += " AND observation_date <= ?";
    args.push(range.to);
  }
  if (metricName) {
    where += " AND metric_name = ?";
    args.push(metricName);
  }

  const countRes = await db.execute({
    sql: `SELECT COUNT(*) AS c FROM analytics_records WHERE ${where}`,
    args,
  });
  const deleted = Number(
    (countRes.rows[0] as Record<string, unknown>).c ?? 0
  );

  await db.execute({
    sql: `DELETE FROM analytics_records WHERE ${where}`,
    args,
  });

  return { deleted };
}

/** Delete one import batch and its records (owner only). */
export async function deleteImportBatch(
  batchId: string,
  projectId: string,
  userId: string
): Promise<{ deletedRecords: number } | { error: string }> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return { error: "Project not found." };

  const db = await getDb();
  const batch = await db.execute({
    sql: `SELECT id FROM import_batches
          WHERE id = ? AND project_id = ? AND user_id = ?`,
    args: [batchId, projectId, userId],
  });
  if (batch.rows.length === 0) {
    return { error: "Import batch not found." };
  }

  const countRes = await db.execute({
    sql: `SELECT COUNT(*) AS c FROM analytics_records WHERE import_batch_id = ?`,
    args: [batchId],
  });
  const deletedRecords = Number(
    (countRes.rows[0] as Record<string, unknown>).c ?? 0
  );

  await db.execute({
    sql: `DELETE FROM analytics_records WHERE import_batch_id = ?`,
    args: [batchId],
  });
  await db.execute({
    sql: `DELETE FROM import_batches WHERE id = ? AND user_id = ?`,
    args: [batchId, userId],
  });

  return { deletedRecords };
}
