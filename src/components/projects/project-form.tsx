"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

type ProjectFormProps = {
  mode: "create" | "edit";
  projectId?: string;
  initial?: {
    name: string;
    domain: string;
    description: string;
  };
};

type DataSource = "csv_json" | "api" | "both";

export function ProjectForm({ mode, projectId, initial }: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dataSource, setDataSource] = useState<DataSource>("both");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url =
        mode === "create" ? "/api/projects" : `/api/projects/${projectId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, description }),
      });

      const data = (await res.json()) as {
        error?: string;
        project?: { id: string };
      };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (mode === "create" && data.project?.id) {
        const id = data.project.id;
        if (dataSource === "csv_json") {
          router.push(`/dashboard/websites/${id}/import`);
        } else if (dataSource === "api") {
          router.push(`/dashboard/websites/${id}?setup=api`);
        } else {
          router.push(`/dashboard/websites/${id}`);
        }
      } else if (projectId) {
        router.push(`/dashboard/websites/${projectId}`);
      } else {
        router.push("/dashboard/websites");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My marketing site"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain (optional)</Label>
        <Input
          id="domain"
          name="domain"
          maxLength={253}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          name="description"
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short note about this site"
          disabled={loading}
        />
      </div>

      {mode === "create" && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            How will you add analytics data?
          </legend>
          <p className="text-xs text-foreground-muted">
            You can always use both later. This only chooses where we take you
            after creating the project.
          </p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-background-subtle has-[:checked]:border-primary has-[:checked]:bg-primary-muted/40">
              <input
                type="radio"
                name="dataSource"
                className="mt-1"
                checked={dataSource === "csv_json"}
                onChange={() => setDataSource("csv_json")}
                disabled={loading}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Upload CSV or JSON files
                </span>
                <span className="text-xs text-foreground-muted">
                  Import exports from analytics tools or spreadsheets.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-background-subtle has-[:checked]:border-primary has-[:checked]:bg-primary-muted/40">
              <input
                type="radio"
                name="dataSource"
                className="mt-1"
                checked={dataSource === "api"}
                onChange={() => setDataSource("api")}
                disabled={loading}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Connect via API
                </span>
                <span className="text-xs text-foreground-muted">
                  Generate a key and push metrics from your website or server.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-background-subtle has-[:checked]:border-primary has-[:checked]:bg-primary-muted/40">
              <input
                type="radio"
                name="dataSource"
                className="mt-1"
                checked={dataSource === "both"}
                onChange={() => setDataSource("both")}
                disabled={loading}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Both / decide later
                </span>
                <span className="text-xs text-foreground-muted">
                  Open the project with import and API options available.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      )}

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        {mode === "create" ? "Create project" : "Save changes"}
      </Button>
    </form>
  );
}
