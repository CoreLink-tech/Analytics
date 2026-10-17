import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getProjectForUser } from "@/lib/projects/store";
import {
  getDashboardSummary,
  getMetricTimeSeries,
  listMetricsForProject,
  listRecordsTable,
} from "@/lib/analytics/queries";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardFilters } from "@/components/analytics/dashboard-filters";
import { MetricChart } from "@/components/analytics/metric-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string; metric?: string }>;
};

export default async function AnalyticsDashboardPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/websites");
  }

  const { id } = await params;
  const sp = await searchParams;
  const project = await getProjectForUser(id, session.user.id);
  if (!project) notFound();

  const metrics = (await listMetricsForProject(id, session.user.id)) ?? [];
  const range = {
    from: sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from) ? sp.from : null,
    to: sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to) ? sp.to : null,
  };
  const metric =
    sp.metric && metrics.includes(sp.metric)
      ? sp.metric
      : metrics[0] ?? null;

  const summary = await getDashboardSummary(
    id,
    session.user.id,
    range,
    metric
  );
  const series =
    metric != null
      ? ((await getMetricTimeSeries(id, session.user.id, metric, range)) ?? [])
      : [];
  const rows =
    (await listRecordsTable(id, session.user.id, range, metric, 50)) ?? [];

  const hasData = (summary?.totalRecords ?? 0) > 0 || metrics.length > 0;

  return (
    <AppShell
      title={`Analytics · ${project.name}`}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`/dashboard/websites/${project.id}`}
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              ← Back to project
            </Link>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Historical analytics
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {project.domain ? `${project.domain} · ` : ""}
              Explore imported metrics over time
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={buildExportHref(project.id, "csv", range, metric)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium hover:bg-background-subtle"
            >
              Export CSV
            </a>
            <a
              href={buildExportHref(project.id, "json", range, metric)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium hover:bg-background-subtle"
            >
              Export JSON
            </a>
            <Link
              href={`/dashboard/websites/${project.id}/manage`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium hover:bg-background-subtle"
            >
              Manage data
            </Link>
            <Link
              href={`/dashboard/websites/${project.id}/import`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border-strong bg-background px-3 text-sm font-medium hover:bg-background-subtle"
            >
              Import more
            </Link>
          </div>
        </div>

        {!hasData ? (
          <EmptyState
            title="No analytics data yet"
            description="Import a CSV or JSON export to populate this dashboard."
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
          <>
            <Suspense fallback={null}>
              <DashboardFilters
                metrics={metrics}
                initialFrom={range.from ?? ""}
                initialTo={range.to ?? ""}
                initialMetric={metric ?? ""}
              />
            </Suspense>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Records"
                value={String(summary?.totalRecords ?? 0)}
              />
              <SummaryCard
                label="Metrics"
                value={String(summary?.metricCount ?? 0)}
              />
              <SummaryCard
                label={metric ? `Sum · ${metric}` : "Sum"}
                value={
                  summary?.sumSelected != null
                    ? formatNum(summary.sumSelected)
                    : "—"
                }
              />
              <SummaryCard
                label={metric ? `Avg · ${metric}` : "Average"}
                value={
                  summary?.avgSelected != null
                    ? formatNum(summary.avgSelected)
                    : "—"
                }
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {metric ? `Trend · ${metric}` : "Trend"}
                </CardTitle>
                <CardDescription>
                  {summary?.minDate && summary?.maxDate
                    ? `Data range in filter: ${summary.minDate} → ${summary.maxDate}`
                    : "Daily totals for the selected metric"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metric ? (
                  <MetricChart data={series} metricName={metric} />
                ) : (
                  <p className="py-8 text-center text-sm text-foreground-muted">
                    Select a metric to view the chart.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data table</CardTitle>
                <CardDescription>Up to 50 most recent matching rows</CardDescription>
              </CardHeader>
              <CardContent>
                {rows.length === 0 ? (
                  <p className="py-6 text-center text-sm text-foreground-muted">
                    No rows in this filter.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[32rem] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-foreground-subtle">
                          <th className="py-2 pr-3 font-medium">Date</th>
                          <th className="py-2 pr-3 font-medium">Metric</th>
                          <th className="py-2 pr-3 font-medium">Value</th>
                          <th className="py-2 pr-3 font-medium">Path</th>
                          <th className="py-2 font-medium">Dimension</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr
                            key={r.id}
                            className="border-b border-border/60 text-foreground"
                          >
                            <td className="py-2 pr-3 whitespace-nowrap">
                              {r.observationDate}
                            </td>
                            <td className="py-2 pr-3">{r.metricName}</td>
                            <td className="py-2 pr-3 tabular-nums">
                              {formatNum(r.metricValue)}
                            </td>
                            <td className="py-2 pr-3 text-foreground-muted">
                              {r.pagePath ?? "—"}
                            </td>
                            <td className="py-2 text-foreground-muted">
                              {r.dimensionName
                                ? `${r.dimensionName}: ${r.dimensionValue ?? ""}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function buildExportHref(
  projectId: string,
  format: "csv" | "json",
  range: { from: string | null; to: string | null },
  metric: string | null
): string {
  const params = new URLSearchParams({ format });
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  if (metric) params.set("metric", metric);
  return `/api/projects/${projectId}/export?${params.toString()}`;
}
