"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type KeyMeta = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export function ApiKeyPanel({
  projectId,
  initialKeys,
  appOrigin,
}: {
  projectId: string;
  initialKeys: KeyMeta[];
  appOrigin: string;
}) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ingestUrl = `${appOrigin.replace(/\/$/, "")}/api/v1/ingest`;

  async function generate() {
    setError(null);
    setSecret(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Website" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create key.");
        return;
      }
      setSecret(data.secret as string);
      setKeys((prev) => [data.key as KeyMeta, ...prev]);
      router.refresh();
    } catch {
      setError("Could not create key.");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(keyId: string) {
    if (!window.confirm("Revoke this API key? Sites using it will stop working.")) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/keys?keyId=${encodeURIComponent(keyId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not revoke key.");
        return;
      }
      setKeys((prev) =>
        prev.map((k) =>
          k.id === keyId ? { ...k, revokedAt: new Date().toISOString() } : k
        )
      );
      router.refresh();
    } catch {
      setError("Could not revoke key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {secret && (
        <Alert variant="success">
          <p className="font-medium">Copy your API key now (shown once):</p>
          <code className="mt-2 block break-all rounded bg-background p-2 text-xs">
            {secret}
          </code>
          <p className="mt-2 text-xs">
            On your website host, set e.g.{" "}
            <code className="text-xs">ANALYTICS_ARCHIVE_API_KEY={secret.slice(0, 16)}…</code>
          </p>
        </Alert>
      )}

      <div className="rounded-md border border-border bg-background-subtle p-3 text-xs text-foreground-muted">
        <p className="font-medium text-foreground">Ingest endpoint</p>
        <code className="mt-1 block break-all">{ingestUrl}</code>
        <p className="mt-2">
          Header: <code>Authorization: Bearer &lt;your_key&gt;</code>
        </p>
        <pre className="mt-2 overflow-x-auto rounded border border-border bg-background p-2 text-[11px] leading-relaxed text-foreground">
{`curl -X POST ${ingestUrl} \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"records":[{"date":"2026-10-01","metric_name":"pageviews","metric_value":42,"path":"/"}]}'`}
        </pre>
      </div>

      <Button type="button" onClick={generate} loading={loading} size="sm">
        Generate API key
      </Button>

      {keys.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border text-sm">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  {k.name}{" "}
                  <span className="font-mono text-xs text-foreground-subtle">
                    {k.keyPrefix}…
                  </span>
                </p>
                <p className="text-xs text-foreground-subtle">
                  Created {k.createdAt.slice(0, 10)}
                  {k.lastUsedAt ? ` · Last used ${k.lastUsedAt.slice(0, 10)}` : ""}
                  {k.revokedAt ? " · Revoked" : ""}
                </p>
              </div>
              {!k.revokedAt && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => revoke(k.id)}
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
