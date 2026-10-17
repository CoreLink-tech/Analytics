import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import { getProjectForUser } from "@/lib/projects/store";
import type { RawImportRow } from "@/lib/analytics/parse";
import type { ImportBatch } from "@/lib/analytics/types";

/** Map common export column names → canonical fields */
const DATE_ALIASES = [
  "observation_date",
  "date",
  "day",
  "period",
  "period_start",
  "start_date",
  "timestamp",
];
const METRIC_ALIASES = ["metric_name", "metric", "name", "kpi", "measure"];
const VALUE_ALIASES = ["metric_value", "value", "count", "total", "amount"];
const PATH_ALIASES = ["page_path", "path", "page", "url", "pathname"];
const DIM_NAME_ALIASES = ["dimension_name", "dim", "dimension", "breakdown"];
const DIM_VALUE_ALIASES = ["dimension_value", "dim_value", "segment", "label"];
const SOURCE_ID_ALIASES = ["source_record_id", "id", "record_id", "row_id"];

export type ColumnMapping = {
  observationDate: string;
  metricName: string;
  metricValue: string;
  pagePath?: string | null;
  dimensionName?: string | null;
  dimensionValue?: string | null;
  sourceRecordId?: string | null;
  periodEnd?: string | null;
};

export type ImportResult = {
  batch: ImportBatch;
  accepted: number;
  rejected: number;
  duplicates: number;
  errors: string[];
  warnings: string[];
};

function normalizeHeaderKey(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function findAlias(headers: string[], aliases: string[]): string | null {
  const map = new Map(headers.map((h) => [normalizeHeaderKey(h), h]));
  for (const a of aliases) {
    const hit = map.get(a);
    if (hit) return hit;
  }
  return null;
}

/** Auto-detect mapping from headers when possible. */
export function suggestMapping(headers: string[]): Partial<ColumnMapping> {
  return {
    observationDate: findAlias(headers, DATE_ALIASES) ?? undefined,
    metricName: findAlias(headers, METRIC_ALIASES) ?? undefined,
    metricValue: findAlias(headers, VALUE_ALIASES) ?? undefined,
    pagePath: findAlias(headers, PATH_ALIASES),
    dimensionName: findAlias(headers, DIM_NAME_ALIASES),
    dimensionValue: findAlias(headers, DIM_VALUE_ALIASES),
    sourceRecordId: findAlias(headers, SOURCE_ID_ALIASES),
  };
}

function cell(
  row: RawImportRow,
  key: string | null | undefined
): string | null {
  if (!key) return null;
  const v = row[key];
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) return raw.replace(/\//g, "-");
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

function parseNumber(raw: string | null): number | null {
  if (raw === null) return null;
  const cleaned = raw.replace(/,/g, "").replace(/%$/, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

export async function runImport(input: {
  projectId: string;
  userId: string;
  source: "csv" | "json";
  originalFileName: string | null;
  rows: RawImportRow[];
  mapping: ColumnMapping;
  warnings?: string[];
}): Promise<ImportResult | { error: string }> {
  await ensureDbReady();
  const project = await getProjectForUser(input.projectId, input.userId);
  if (!project) return { error: "Project not found." };

  if (!input.mapping.observationDate || !input.mapping.metricName || !input.mapping.metricValue) {
    return {
      error:
        "Mapping must include observation date, metric name, and metric value columns.",
    };
  }

  const db = await getDb();
  const batchId = randomUUID();
  const startedAt = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO import_batches (
            id, project_id, user_id, source, original_file_name, status,
            total_rows, accepted_rows, rejected_rows, duplicate_rows,
            started_at, completed_at, error_summary
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      batchId,
      input.projectId,
      input.userId,
      input.source,
      input.originalFileName,
      "processing",
      input.rows.length,
      0,
      0,
      0,
      startedAt,
      null,
      null,
    ],
  });

  let accepted = 0;
  let rejected = 0;
  let duplicates = 0;
  const errors: string[] = [];
  const warnings = [...(input.warnings ?? [])];

  for (let i = 0; i < input.rows.length; i++) {
    const row = input.rows[i];
    const line = i + 2; // approximate for CSV (header + 1-based)

    const observationDate = parseDate(cell(row, input.mapping.observationDate));
    const metricName = cell(row, input.mapping.metricName);
    const metricValue = parseNumber(cell(row, input.mapping.metricValue));
    const pagePath = cell(row, input.mapping.pagePath);
    const dimensionName = cell(row, input.mapping.dimensionName);
    const dimensionValue = cell(row, input.mapping.dimensionValue);
    const sourceRecordId = cell(row, input.mapping.sourceRecordId);
    const periodEnd = parseDate(cell(row, input.mapping.periodEnd));

    if (!observationDate || !metricName || metricValue === null) {
      rejected++;
      if (errors.length < 25) {
        errors.push(
          `Row ${line}: missing or invalid date, metric name, or value.`
        );
      }
      continue;
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const metricKey = metricName.toLowerCase().slice(0, 100);

    // Application-level duplicate detection (no unique index required)
    const existing = await db.execute({
      sql: `SELECT id FROM analytics_records
            WHERE project_id = ?
              AND source = ?
              AND metric_name = ?
              AND observation_date = ?
              AND IFNULL(dimension_name, '') = IFNULL(?, '')
              AND IFNULL(dimension_value, '') = IFNULL(?, '')
              AND IFNULL(page_path, '') = IFNULL(?, '')
              AND IFNULL(source_record_id, '') = IFNULL(?, '')
            LIMIT 1`,
      args: [
        input.projectId,
        input.source,
        metricKey,
        observationDate,
        dimensionName,
        dimensionValue,
        pagePath,
        sourceRecordId,
      ],
    });
    if (existing.rows.length > 0) {
      duplicates++;
      continue;
    }

    try {
      await db.execute({
        sql: `INSERT INTO analytics_records (
                id, project_id, source, source_record_id, metric_name, metric_value,
                observation_date, period_end, dimension_name, dimension_value,
                page_path, import_batch_id, source_metadata, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          input.projectId,
          input.source,
          sourceRecordId,
          metricKey,
          metricValue,
          observationDate,
          periodEnd,
          dimensionName,
          dimensionValue,
          pagePath,
          batchId,
          null,
          createdAt,
        ],
      });
      accepted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      rejected++;
      if (errors.length < 25) {
        errors.push(`Row ${line}: ${msg.slice(0, 120)}`);
      }
    }
  }

  const completedAt = new Date().toISOString();
  const status = accepted > 0 ? "completed" : "failed";
  const errorSummary =
    errors.length > 0 ? errors.slice(0, 10).join(" | ").slice(0, 500) : null;

  await db.execute({
    sql: `UPDATE import_batches SET
            status = ?, accepted_rows = ?, rejected_rows = ?, duplicate_rows = ?,
            completed_at = ?, error_summary = ?
          WHERE id = ?`,
    args: [
      status,
      accepted,
      rejected,
      duplicates,
      completedAt,
      errorSummary,
      batchId,
    ],
  });

  const batch: ImportBatch = {
    id: batchId,
    projectId: input.projectId,
    userId: input.userId,
    source: input.source,
    originalFileName: input.originalFileName,
    status,
    totalRows: input.rows.length,
    acceptedRows: accepted,
    rejectedRows: rejected,
    duplicateRows: duplicates,
    startedAt,
    completedAt,
    errorSummary,
  };

  return {
    batch,
    accepted,
    rejected,
    duplicates,
    errors,
    warnings,
  };
}
