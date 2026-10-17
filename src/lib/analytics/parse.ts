/**
 * Parse CSV / JSON analytics exports into normalized row candidates.
 * No permanent file storage in Stage 7 (R2 deferred).
 */

export type RawImportRow = Record<string, string | number | null | undefined>;

export type ParsedFile = {
  format: "csv" | "json";
  headers: string[];
  rows: RawImportRow[];
  warnings: string[];
};

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 10_000;

export function assertFileSize(byteLength: number): void {
  if (byteLength > MAX_FILE_BYTES) {
    throw new Error("File is too large. Maximum size is 5 MB.");
  }
}

/** Minimal CSV parser: supports commas, quoted fields, CRLF/LF. */
export function parseCsv(text: string): ParsedFile {
  const warnings: string[] = [];
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  if (headers.length === 0 || headers.every((h) => !h)) {
    throw new Error("CSV has no header row.");
  }

  const rows: RawImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (rows.length >= MAX_ROWS) {
      warnings.push(`Stopped at ${MAX_ROWS} rows (file limit).`);
      break;
    }
    const cells = splitCsvLine(lines[i]);
    const row: RawImportRow = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] !== undefined ? cells[idx] : "";
    });
    rows.push(row);
  }

  return { format: "csv", headers, rows, warnings };
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseJson(text: string): ParsedFile {
  const warnings: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON.");
  }

  let records: unknown[];
  if (Array.isArray(data)) {
    records = data;
  } else if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    records = (data as { data: unknown[] }).data;
  } else if (data && typeof data === "object" && Array.isArray((data as { rows?: unknown }).rows)) {
    records = (data as { rows: unknown[] }).rows;
  } else {
    throw new Error("JSON must be an array of objects, or { data: [...] } / { rows: [...] }.");
  }

  if (records.length === 0) {
    throw new Error("JSON array is empty.");
  }

  const headersSet = new Set<string>();
  const rows: RawImportRow[] = [];

  for (const item of records) {
    if (rows.length >= MAX_ROWS) {
      warnings.push(`Stopped at ${MAX_ROWS} rows (file limit).`);
      break;
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      warnings.push("Skipped a non-object row.");
      continue;
    }
    const row: RawImportRow = {};
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      headersSet.add(k);
      if (v === null || v === undefined) row[k] = null;
      else if (typeof v === "number" || typeof v === "string") row[k] = v;
      else row[k] = JSON.stringify(v);
    }
    rows.push(row);
  }

  return {
    format: "json",
    headers: Array.from(headersSet),
    rows,
    warnings,
  };
}

export function parseUpload(
  filename: string,
  text: string
): ParsedFile {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    return parseCsv(text);
  }
  if (lower.endsWith(".json")) {
    return parseJson(text);
  }
  // sniff
  const trimmed = text.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseJson(text);
  }
  return parseCsv(text);
}
