import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects/store";
import { listImportBatchesForProject } from "@/lib/analytics/records";
import { listRecordsForProject } from "@/lib/analytics/records";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { EmptyState } from "@/components/ui/empty-state";

type PageProps = { params: Promise<{ id: string }> };

export default async function WebsiteDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites");
  }

  const { id } = await params;
  const project = await getProjectForUser(id, session.user.id);
  if (!project) {
    notFound();
  }

  const batches = (await listImportBatchesForProject(id, session.user.id)) ?? [];
  const records = (await listRecordsForProject(id, session.user.id, { limit: 5 })) ?? [];
  const recordCountHint =
    records.length >= 5 ? "5+ recent" : String(records.length);

  return (
    <AppShell
      title={project.name}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/dashboard/websites"
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              ← Back to websites
            </Link>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {project.name}
            </h2>
            {project.domain && (
              <p className="mt-1 text-sm text-foreground-muted">
                {project.domain}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/websites/${project.id}/import`}
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Import data
            </Link>
            <Link
              href={`/dashboard/websites/${project.id}/edit`}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium text-foreground hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Edit
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>Project metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-foreground-subtle">Description</p>
              <p className="text-foreground">
                {project.description || "No description"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-foreground-subtle">Created</p>
                <p className="text-foreground">
                  {new Date(project.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-foreground-subtle">Updated</p>
                <p className="text-foreground">
                  {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {batches.length === 0 ? (
          <EmptyState
            title="No analytics imported yet"
            description="Upload a CSV or JSON export to start building this project's history."
            action={
              <Link
                href={`/dashboard/websites/${project.id}/import`}
                className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Import data
              </Link>
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Import history</CardTitle>
              <CardDescription>
                Recent batches · showing up to {recordCountHint} sample records in the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-2">
                {batches.slice(0, 10).map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0"
                  >
                    <span className="text-foreground">
                      {b.originalFileName || b.source} · {b.status}
                    </span>
                    <span className="text-xs text-foreground-subtle">
                      {b.acceptedRows} accepted · {b.rejectedRows} rejected ·{" "}
                      {b.duplicateRows} dupes
                    </span>
                  </li>
                ))}
              </ul>
              {records.length > 0 && (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-foreground-subtle">
                        <th className="py-1 pr-2">Date</th>
                        <th className="py-1 pr-2">Metric</th>
                        <th className="py-1 pr-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.id} className="text-foreground">
                          <td className="py-1 pr-2">{r.observationDate}</td>
                          <td className="py-1 pr-2">{r.metricName}</td>
                          <td className="py-1 pr-2">{r.metricValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">Danger zone</h3>
          <p className="mt-1 mb-3 text-sm text-foreground-muted">
            Deleting a project removes it from your account permanently.
          </p>
          <DeleteProjectButton
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>
    </AppShell>
  );
}
