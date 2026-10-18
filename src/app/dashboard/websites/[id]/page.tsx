import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects/store";
import { listImportBatchesForProject } from "@/lib/analytics/records";
import { listRecordsForProject } from "@/lib/analytics/records";
import { listApiKeysForProject } from "@/lib/projects/api-keys";
import {
  getDashboardSummary,
  listMetricsForProject,
} from "@/lib/analytics/queries";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ApiKeyPanel } from "@/components/projects/api-key-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

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

  const batches =
    (await listImportBatchesForProject(id, session.user.id)) ?? [];
  const records =
    (await listRecordsForProject(id, session.user.id, { limit: 10 })) ?? [];
  const apiKeys = (await listApiKeysForProject(id, session.user.id)) ?? [];
  const metrics = (await listMetricsForProject(id, session.user.id)) ?? [];
  const summary = await getDashboardSummary(
    id,
    session.user.id,
    { from: null, to: null },
    metrics[0] ?? null
  );
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://analytics-one-chi.vercel.app";

  const totalRecords = summary?.totalRecords ?? records.length;
  const hasData = totalRecords > 0;

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
              href={`/dashboard/websites/${project.id}/analytics`}
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View analytics
            </Link>
            <Link
              href={`/dashboard/websites/${project.id}/import`}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium text-foreground hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Import data
            </Link>
            <Link
              href={`/dashboard/websites/${project.id}/manage`}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium text-foreground hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Manage data
            </Link>
            <Link
              href={`/dashboard/websites/${project.id}/edit`}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium text-foreground hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Project analytics preview */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Project analytics</CardTitle>
              <CardDescription>
                Data stored in your Turso database for this project. Open the
                full dashboard for charts and filters.
              </CardDescription>
            </div>
            <Link
              href={`/dashboard/websites/${project.id}/analytics`}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Open full dashboard
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background-subtle p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Records
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  {totalRecords.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background-subtle p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Metrics
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  {summary?.metricCount ?? metrics.length}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background-subtle p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Date range
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {summary?.minDate && summary?.maxDate
                    ? `${summary.minDate} → ${summary.maxDate}`
                    : "—"}
                </p>
              </div>
            </div>

            {!hasData ? (
              <p className="text-sm text-foreground-muted">
                No records yet. Data appears here after API ingest or CSV/JSON
                import.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Recent records
                </p>
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-foreground-subtle">
                      <th className="py-2 pr-3 font-medium">Date</th>
                      <th className="py-2 pr-3 font-medium">Metric</th>
                      <th className="py-2 pr-3 font-medium">Value</th>
                      <th className="py-2 pr-3 font-medium">Path</th>
                      <th className="py-2 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/60 text-foreground"
                      >
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {r.observationDate}
                        </td>
                        <td className="py-2 pr-3">{r.metricName}</td>
                        <td className="py-2 pr-3 tabular-nums">
                          {Number.isInteger(r.metricValue)
                            ? r.metricValue.toLocaleString()
                            : r.metricValue.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                        </td>
                        <td className="py-2 pr-3 text-foreground-muted">
                          {r.pagePath ?? "—"}
                        </td>
                        <td className="py-2">
                          <Badge variant="outline">{r.source}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect website (API)</CardTitle>
            <CardDescription>
              Generate a key for this project. Add it as an env var on your site
              host, then POST metrics to the ingest endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeyPanel
              projectId={project.id}
              initialKeys={apiKeys}
              appOrigin={appOrigin}
            />
          </CardContent>
        </Card>

        {batches.length === 0 ? (
          <EmptyState
            title="No file imports yet"
            description="CSV/JSON uploads appear here. API-ingested rows show under Project analytics above."
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
                Recent file import batches for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {batches.slice(0, 8).map((b) => (
                  <li key={b.id} className="px-3 py-2 text-sm">
                    <p className="font-medium text-foreground">
                      {b.originalFileName || b.source}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {b.status} · {b.acceptedRows} accepted ·{" "}
                      {b.rejectedRows} rejected
                      {b.startedAt ? ` · ${b.startedAt.slice(0, 10)}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href={`/dashboard/websites/${project.id}/manage`}
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Manage data →
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="pt-4">
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>
    </AppShell>
  );
}
