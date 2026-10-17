import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import type { AnalyticsRecord, ImportBatch } from "@/lib/analytics/types";
import { getProjectForUser } from "@/lib/projects/store";

function rowToRecord(row: Record<string, unknown>): AnalyticsRecord {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    source: String(row.source),
    sourceRecordId: row.source_record_id == null ? null : String(row.source_record_id),
    metricName: String(row.metric_name),
    metricValue: Number(row.metric_value),
    observationDate: String(row.observation_date),
    periodEnd: row.period_end == null ? null : String(row.period_end),
    dimensionName: row.dimension_name == null ? null : String(row.dimension_name),
    dimensionValue: row.dimension_value == null ? null : String(row.dimension_value),
    pagePath: row.page_path == null ? null : String(row.page_path),
    importBatchId: row.import_batch_id == null ? null : String(row.import_batch_id),
    sourceMetadata: row.source_metadata == null ? null : String(row.source_metadata),
    createdAt: String(row.created_at),
  };
}

function rowToBatch(row: Record<string, unknown>): ImportBatch {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    userId: String(row.user_id),
    source: String(row.source),
    originalFileName:
      row.original_file_name == null ? null : String(row.original_file_name),
    status: String(row.status),
    totalRows: Number(row.total_rows ?? 0),
    acceptedRows: Number(row.accepted_rows ?? 0),
    rejectedRows: Number(row.rejected_rows ?? 0),
    duplicateRows: Number(row.duplicate_rows ?? 0),
    startedAt: row.started_at == null ? null : String(row.started_at),
    completedAt: row.completed_at == null ? null : String(row.completed_at),
    errorSummary: row.error_summary == null ? null : String(row.error_summary),
  };
}

export async function listRecordsForProject(
  projectId: string,
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<AnalyticsRecord[] | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 1000);
  const offset = Math.max(options?.offset ?? 0, 0);

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT * FROM analytics_records
          WHERE project_id = ?
          ORDER BY observation_date DESC, created_at DESC
          LIMIT ? OFFSET ?`,
    args: [projectId, limit, offset],
  });
  return result.rows.map((r) => rowToRecord(r as Record<string, unknown>));
}

export async function createImportBatch(input: {
  projectId: string;
  userId: string;
  source: string;
  originalFileName?: string | null;
}): Promise<{ batch: ImportBatch } | { error: string }> {
  await ensureDbReady();
  const project = await getProjectForUser(input.projectId, input.userId);
  if (!project) return { error: "Project not found." };

  const batch: ImportBatch = {
    id: randomUUID(),
    projectId: input.projectId,
    userId: input.userId,
    source: input.source,
    originalFileName: input.originalFileName ?? null,
    status: "pending",
    totalRows: 0,
    acceptedRows: 0,
    rejectedRows: 0,
    duplicateRows: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    errorSummary: null,
  };

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO import_batches (
            id, project_id, user_id, source, original_file_name, status,
            total_rows, accepted_rows, rejected_rows, duplicate_rows,
            started_at, completed_at, error_summary
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      batch.id,
      batch.projectId,
      batch.userId,
      batch.source,
      batch.originalFileName,
      batch.status,
      batch.totalRows,
      batch.acceptedRows,
      batch.rejectedRows,
      batch.duplicateRows,
      batch.startedAt,
      batch.completedAt,
      batch.errorSummary,
    ],
  });

  return { batch };
}

export async function listImportBatchesForProject(
  projectId: string,
  userId: string
): Promise<ImportBatch[] | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT * FROM import_batches
          WHERE project_id = ? AND user_id = ?
          ORDER BY started_at DESC`,
    args: [projectId, userId],
  });
  return result.rows.map((r) => rowToBatch(r as Record<string, unknown>));
}
