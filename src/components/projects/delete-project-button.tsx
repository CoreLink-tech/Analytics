"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not delete project.");
        return;
      }
      router.push("/dashboard/websites");
      router.refresh();
    } catch {
      setError("Could not delete project.");
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        Delete project
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-error/30 bg-error-muted p-4">
      <p className="text-sm text-error">
        Delete <strong>{projectName}</strong>? This cannot be undone. Associated
        analytics data (when available in later stages) will be removed with the
        project.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          loading={loading}
          onClick={onDelete}
        >
          Yes, delete
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
