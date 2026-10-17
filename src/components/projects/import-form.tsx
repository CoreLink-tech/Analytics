"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

type Suggested = {
  observationDate?: string;
  metricName?: string;
  metricValue?: string;
  pagePath?: string | null;
  dimensionName?: string | null;
  dimensionValue?: string | null;
  sourceRecordId?: string | null;
};

type Preview = {
  format: string;
  headers: string[];
  sampleRows: Record<string, string | number | null>[];
  rowCount: number;
  suggestedMapping: Suggested;
  warnings: string[];
};

type Summary = {
  accepted: number;
  rejected: number;
  duplicates: number;
  total: number;
  status: string;
};

export function ImportForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState({
    observationDate: "",
    metricName: "",
    metricValue: "",
    pagePath: "",
    dimensionName: "",
    dimensionValue: "",
    sourceRecordId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function onPreview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);
    setRowErrors([]);
    if (!file) {
      setError("Choose a CSV or JSON file.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("preview", "1");
      const res = await fetch(`/api/projects/${projectId}/import`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Preview failed.");
        return;
      }
      setPreview(data as Preview);
      const s = data.suggestedMapping as Suggested;
      setMapping({
        observationDate: s.observationDate ?? "",
        metricName: s.metricName ?? "",
        metricValue: s.metricValue ?? "",
        pagePath: s.pagePath ?? "",
        dimensionName: s.dimensionName ?? "",
        dimensionValue: s.dimensionValue ?? "",
        sourceRecordId: s.sourceRecordId ?? "",
      });
    } catch {
      setError("Preview failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);
    setRowErrors([]);
    if (!file) {
      setError("Choose a file.");
      return;
    }
    if (!mapping.observationDate || !mapping.metricName || !mapping.metricValue) {
      setError("Map date, metric name, and value columns.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append(
        "mapping",
        JSON.stringify({
          observationDate: mapping.observationDate,
          metricName: mapping.metricName,
          metricValue: mapping.metricValue,
          pagePath: mapping.pagePath || null,
          dimensionName: mapping.dimensionName || null,
          dimensionValue: mapping.dimensionValue || null,
          sourceRecordId: mapping.sourceRecordId || null,
        })
      );
      const res = await fetch(`/api/projects/${projectId}/import`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      setSummary(data.summary as Summary);
      setRowErrors((data.errors as string[]) ?? []);
      router.refresh();
    } catch {
      setError("Import failed.");
    } finally {
      setLoading(false);
    }
  }

  const headerOptions = preview?.headers ?? [];

  return (
    <div className="space-y-6">
      <form onSubmit={onPreview} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <div className="space-y-2">
          <Label htmlFor="file">CSV or JSON file</Label>
          <Input
            id="file"
            type="file"
            accept=".csv,.json,.txt,text/csv,application/json"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setPreview(null);
              setSummary(null);
            }}
            disabled={loading}
          />
          <p className="text-xs text-foreground-subtle">
            Max 5 MB / 10,000 rows. Supports CSV and JSON. Vercel-style JSON
            with pageviews/visitors is expanded automatically. Originals are
            not stored in object storage yet (R2 deferred).
          </p>
        </div>
        <Button type="submit" variant="outline" loading={loading} disabled={!file}>
          Preview & map columns
        </Button>
      </form>

      {preview && (
        <form onSubmit={onImport} className="space-y-4 rounded-lg border border-border p-4">
          <p className="text-sm text-foreground-muted">
            Detected <strong>{preview.format.toUpperCase()}</strong> ·{" "}
            {preview.rowCount} rows
          </p>
          {preview.warnings?.length > 0 && (
            <Alert variant="warning">{preview.warnings.join(" ")}</Alert>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["observationDate", "Date column", true],
                ["metricName", "Metric name column", true],
                ["metricValue", "Value column", true],
                ["pagePath", "Page path (optional)", false],
                ["dimensionName", "Dimension name (optional)", false],
                ["dimensionValue", "Dimension value (optional)", false],
                ["sourceRecordId", "Source row id (optional)", false],
              ] as const
            ).map(([key, label, required]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key}>
                  {label}
                  {required ? " *" : ""}
                </Label>
                <select
                  id={key}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={mapping[key]}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [key]: e.target.value }))
                  }
                  disabled={loading}
                  required={required}
                >
                  <option value="">—</option>
                  {headerOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {preview.sampleRows.length > 0 && (
            <div className="overflow-x-auto text-xs">
              <p className="mb-1 font-medium text-foreground">Sample rows</p>
              <pre className="rounded-md bg-background-subtle p-2 text-foreground-muted">
                {JSON.stringify(preview.sampleRows, null, 2)}
              </pre>
            </div>
          )}

          <Button type="submit" loading={loading}>
            Import into project
          </Button>
        </form>
      )}

      {summary && (
        <div className="space-y-2 rounded-lg border border-border bg-background-subtle p-4">
          <p className="font-medium text-foreground">Import summary</p>
          <ul className="text-sm text-foreground-muted">
            <li>Status: {summary.status}</li>
            <li>Total rows: {summary.total}</li>
            <li>Accepted: {summary.accepted}</li>
            <li>Rejected: {summary.rejected}</li>
            <li>Duplicates skipped: {summary.duplicates}</li>
          </ul>
          {rowErrors.length > 0 && (
            <div className="text-xs text-error">
              {rowErrors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
