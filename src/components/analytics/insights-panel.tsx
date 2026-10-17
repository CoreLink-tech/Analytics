"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InsightsPanel({ projectId }: { projectId: string }) {
  const [text, setText] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/insights`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate insights.");
        return;
      }
      setText(data.insights as string);
      setProvider(data.provider as string);
    } catch {
      setError("Could not generate insights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">AI insights</CardTitle>
          <CardDescription>
            Optional narrative summary from your archived metrics. Works offline
            with a local summary; set AI_API_KEY for model-generated insights.
          </CardDescription>
        </div>
        <Button type="button" onClick={run} loading={loading} size="sm">
          Generate insights
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <Alert variant="error">{error}</Alert>}
        {text && (
          <div className="space-y-2">
            {provider && (
              <p className="text-xs text-foreground-subtle">
                Source: {provider === "ai" ? "AI model" : "local heuristics"}
              </p>
            )}
            <pre className="whitespace-pre-wrap rounded-md border border-border bg-background-subtle p-3 text-sm text-foreground">
              {text}
            </pre>
          </div>
        )}
        {!text && !error && (
          <p className="text-sm text-foreground-muted">
            Click generate to analyze the metrics stored for this project.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
