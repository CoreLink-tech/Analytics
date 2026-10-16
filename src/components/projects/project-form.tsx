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

export function ProjectForm({ mode, projectId, initial }: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
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
        router.push(`/dashboard/websites/${data.project.id}`);
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
        <Label htmlFor="domain">Domain or URL (optional)</Label>
        <Input
          id="domain"
          name="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes about this website project"
          disabled={loading}
          className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 hover:border-border-strong"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
