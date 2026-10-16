/**
 * Canonical metric and source identifiers for analytics records.
 * Import (Stage 7) maps external columns onto these names.
 */

export const METRIC_NAMES = [
  "visitors",
  "unique_visitors",
  "pageviews",
  "sessions",
  "bounce_rate",
  "avg_duration",
  "events",
  "other",
] as const;

export type MetricName = (typeof METRIC_NAMES)[number] | string;

export const RECORD_SOURCES = ["csv", "json", "vercel", "manual", "other"] as const;

export type RecordSource = (typeof RECORD_SOURCES)[number] | string;

export type AnalyticsRecord = {
  id: string;
  projectId: string;
  source: string;
  sourceRecordId: string | null;
  metricName: string;
  metricValue: number;
  observationDate: string;
  periodEnd: string | null;
  dimensionName: string | null;
  dimensionValue: string | null;
  pagePath: string | null;
  importBatchId: string | null;
  sourceMetadata: string | null;
  createdAt: string;
};

export type ImportBatch = {
  id: string;
  projectId: string;
  userId: string;
  source: string;
  originalFileName: string | null;
  status: "pending" | "processing" | "completed" | "failed" | string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  startedAt: string | null;
  completedAt: string | null;
  errorSummary: string | null;
};
