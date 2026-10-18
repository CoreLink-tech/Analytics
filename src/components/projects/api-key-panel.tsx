"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type KeyMeta = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

function statusFor(k: KeyMeta): {
  label: string;
  variant: "success" | "warning" | "error" | "outline";
  detail: string;
} {
  if (k.revokedAt) {
    return {
      label: "Revoked",
      variant: "error",
      detail: `Revoked ${k.revokedAt.slice(0, 10)}`,
    };
  }
  if (k.lastUsedAt) {
    const used = new Date(k.lastUsedAt).getTime();
    const days = (Date.now() - used) / (1000 * 60 * 60 * 24);
    if (days <= 7) {
      return {
        label: "Connected",
        variant: "success",
        detail: `Last request ${k.lastUsedAt.slice(0, 16).replace("T", " ")} UTC`,
      };
    }
    return {
      label: "Connected (idle)",
      variant: "warning",
      detail: `Last used ${k.lastUsedAt.slice(0, 10)} — no recent traffic`,
    };
  }
  return {
    label: "Not connected",
    variant: "outline",
    detail: "No successful ingest yet. Add the key on your site and send data.",
  };
}

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

  async function refreshKeys() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/keys`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not refresh keys.");
        return;
      }
      setKeys((data.keys as KeyMeta[]) ?? []);
      router.refresh();
    } catch {
      setError("Could not refresh keys.");
    } finally {
      setLoading(false);
    }
  }

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
    if (
      !window.confirm(
        "Revoke this API key? Sites using it will stop working."
      )
    ) {
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
            On your website host set an env var to this value, and POST metrics
            to the ingest URL below. Status becomes <strong>Connected</strong>{" "}
            after the first successful request.
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
  -d '{"records":[{"date":"2026-10-18","metric_name":"pageviews","metric_value":1,"path":"/"}]}'`}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={generate} loading={loading} size="sm">
          Generate API key
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={refreshKeys}
        >
          Refresh status
        </Button>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          Your API keys
        </h4>
        {keys.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-foreground-muted">
            No keys yet. Generate one to connect a website.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {keys.map((k) => {
              const status = statusFor(k);
              return (
                <li
                  key={k.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {k.name}
                      </span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="font-mono text-xs text-foreground-subtle">
                      {k.keyPrefix}…
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Created {k.createdAt.slice(0, 10)} · {status.detail}
                    </p>
                  </div>
                  {!k.revokedAt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => revoke(k.id)}
                      className="shrink-0"
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-xs text-foreground-subtle">
          <strong>Connected</strong> means this archive received at least one
          successful request with that key. Env vars alone do not mark a key
          connected until data is sent.
        </p>
      </div>
    </div>
  );
}
