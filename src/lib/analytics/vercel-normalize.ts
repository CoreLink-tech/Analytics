/**
 * Normalize common Vercel Analytics / traffic export shapes
 * into long-format rows our importer expects.
 *
 * Vercel does not expose a full historical dump API for arbitrary sites
 * in this MVP; users can paste JSON exports or mapped CSV via Stage 7 import.
 * This helper recognizes several common field names so "source: vercel"
 * imports work when JSON is uploaded.
 */

import type { RawImportRow } from "@/lib/analytics/parse";

const DATE_KEYS = ["date", "day", "timestamp", "period", "observation_date"];
const PAGEVIEW_KEYS = ["pageviews", "pageViews", "views", "total"];
const VISITOR_KEYS = ["visitors", "uniqueVisitors", "unique_visitors", "users"];
const PATH_KEYS = ["path", "page", "pathname", "route", "page_path"];

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k];
    const lower = k.toLowerCase();
    for (const [rk, rv] of Object.entries(row)) {
      if (rk.toLowerCase() === lower) return rv;
    }
  }
  return undefined;
}

/**
 * Expand a single Vercel-style object into one or more long-format rows
 * (pageviews / visitors metrics).
 */
export function expandVercelRow(
  item: Record<string, unknown>
): RawImportRow[] {
  const dateRaw = pick(item, DATE_KEYS);
  const pathRaw = pick(item, PATH_KEYS);
  const pageviews = pick(item, PAGEVIEW_KEYS);
  const visitors = pick(item, VISITOR_KEYS);

  const observation_date =
    dateRaw === undefined || dateRaw === null
      ? ""
      : String(dateRaw).slice(0, 10);
  const page_path =
    pathRaw === undefined || pathRaw === null ? null : String(pathRaw);

  const out: RawImportRow[] = [];

  if (pageviews !== undefined && pageviews !== null && pageviews !== "") {
    out.push({
      observation_date,
      metric_name: "pageviews",
      metric_value: Number(pageviews),
      page_path,
      source_record_id: null,
    });
  }
  if (visitors !== undefined && visitors !== null && visitors !== "") {
    out.push({
      observation_date,
      metric_name: "visitors",
      metric_value: Number(visitors),
      page_path,
      source_record_id: null,
    });
  }

  // Already long-format
  if (out.length === 0 && item.metric_name && item.metric_value !== undefined) {
    out.push({
      observation_date:
        observation_date ||
        String(pick(item, DATE_KEYS) ?? "").slice(0, 10),
      metric_name: String(item.metric_name),
      metric_value: Number(item.metric_value),
      page_path,
      source_record_id:
        item.source_record_id == null
          ? null
          : String(item.source_record_id),
    });
  }

  return out;
}

export function expandVercelRecords(
  records: Record<string, unknown>[]
): RawImportRow[] {
  return records.flatMap((r) => expandVercelRow(r));
}
