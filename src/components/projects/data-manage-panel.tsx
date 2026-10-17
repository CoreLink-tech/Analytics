"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

type Batch = {
  id: string;
  originalFileName: string | null;
  source: string;
  status: string;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  startedAt: string | null;
};

export function DataManagePanel({
  projectId,
  batches,
  metrics,
}: {
  projectId: string;
  batches: Batch[];
  metrics: string[];
}) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [metric, setMetric] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function deleteRange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!from && !to && !metric) {
      setError("Choose a date range and/or metric before deleting.");
      return;
    }
    if (
      !window.confirm(
        "Delete matching analytics records? This cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/records`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from || undefined,
          to: to || undefined,
          metric: metric || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      setMessage(`Deleted ${data.deleted} record(s).`);
      router.refresh();
    } catch {
      setError("Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBatch(batchId: string, label: string) {
    setError(null);
    setMessage(null);
    if (
      !window.confirm(
        `Delete import batch “${label}” and all its records? This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/batches/${batchId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      setMessage(
        `Removed batch and ${data.deletedRecords} associated record(s).`
      );
      router.refresh();
    } catch {
      setError("Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Export analytics
        </h3>
        <p className="text-sm text-foreground-muted">
          Download up to 5,000 rows as CSV or JSON (optional filters apply when
          set on the analytics page query string).
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/projects/${projectId}/export?format=csv`}
            className="inline-flex h-9 items-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium hover:bg-background-subtle"
          >
            Download CSV
          </a>
          <a
            href={`/api/projects/${projectId}/export?format=json`}
            className="inline-flex h-9 items-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium hover:bg-background-subtle"
          >
            Download JSON
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Delete by filter
        </h3>
        <p className="text-sm text-foreground-muted">
          Requires at least one of: from date, to date, or metric. Unbounded
          deletes are blocked.
        </p>
        <form onSubmit={deleteRange} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="del-from">From</Label>
            <Input
              id="del-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="del-to">To</Label>
            <Input
              id="del-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="del-metric">Metric</Label>
            <select
              id="del-metric"
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              disabled={loading}
            >
              <option value="">Any metric</option>
              {metrics.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="destructive" loading={loading}>
              Delete matching records
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Import history</h3>
        {batches.length === 0 ? (
          <p className="text-sm text-foreground-muted">No import batches yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {batches.map((b) => {
              const label = b.originalFileName || b.source;
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-xs text-foreground-subtle">
                      {b.status} · {b.acceptedRows} accepted · {b.rejectedRows}{" "}
                      rejected · {b.duplicateRows} dupes
                      {b.startedAt ? ` · ${b.startedAt.slice(0, 10)}` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => deleteBatch(b.id, label)}
                  >
                    Delete batch
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
