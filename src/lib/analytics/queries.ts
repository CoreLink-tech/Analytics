import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import { getProjectForUser } from "@/lib/projects/store";

export type DateRange = {
  from: string | null;
  to: string | null;
};

export type MetricSeriesPoint = {
  date: string;
  value: number;
};

export type DashboardSummary = {
  totalRecords: number;
  metricCount: number;
  minDate: string | null;
  maxDate: string | null;
  sumSelected: number | null;
  avgSelected: number | null;
};

function isValidDate(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function listMetricsForProject(
  projectId: string,
  userId: string
): Promise<string[] | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT DISTINCT metric_name AS m
          FROM analytics_records
          WHERE project_id = ?
          ORDER BY metric_name ASC`,
    args: [projectId],
  });
  return result.rows.map((r) => String((r as unknown as { m: unknown }).m));
}

export async function getDashboardSummary(
  projectId: string,
  userId: string,
  range: DateRange,
  metricName: string | null
): Promise<DashboardSummary | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const args: (string | number)[] = [projectId];
  let where = "project_id = ?";
  if (isValidDate(range.from)) {
    where += " AND observation_date >= ?";
    args.push(range.from);
  }
  if (isValidDate(range.to)) {
    where += " AND observation_date <= ?";
    args.push(range.to);
  }

  const totals = await db.execute({
    sql: `SELECT
            COUNT(*) AS c,
            COUNT(DISTINCT metric_name) AS mc,
            MIN(observation_date) AS mind,
            MAX(observation_date) AS maxd
          FROM analytics_records
          WHERE ${where}`,
    args,
  });
  const row = totals.rows[0] as Record<string, unknown>;

  let sumSelected: number | null = null;
  let avgSelected: number | null = null;
  if (metricName) {
    const mArgs = [...args, metricName];
    const agg = await db.execute({
      sql: `SELECT SUM(metric_value) AS s, AVG(metric_value) AS a
            FROM analytics_records
            WHERE ${where} AND metric_name = ?`,
      args: mArgs,
    });
    const ar = agg.rows[0] as Record<string, unknown>;
    sumSelected = ar.s == null ? null : Number(ar.s);
    avgSelected = ar.a == null ? null : Number(ar.a);
  }

  return {
    totalRecords: Number(row.c ?? 0),
    metricCount: Number(row.mc ?? 0),
    minDate: row.mind == null ? null : String(row.mind),
    maxDate: row.maxd == null ? null : String(row.maxd),
    sumSelected,
    avgSelected,
  };
}

export async function getMetricTimeSeries(
  projectId: string,
  userId: string,
  metricName: string,
  range: DateRange
): Promise<MetricSeriesPoint[] | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const args: (string | number)[] = [projectId, metricName];
  let where = "project_id = ? AND metric_name = ?";
  if (isValidDate(range.from)) {
    where += " AND observation_date >= ?";
    args.push(range.from);
  }
  if (isValidDate(range.to)) {
    where += " AND observation_date <= ?";
    args.push(range.to);
  }

  const result = await db.execute({
    sql: `SELECT observation_date AS d, SUM(metric_value) AS v
          FROM analytics_records
          WHERE ${where}
          GROUP BY observation_date
          ORDER BY observation_date ASC
          LIMIT 500`,
    args,
  });

  return result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      date: String(row.d),
      value: Number(row.v ?? 0),
    };
  });
}

export async function listRecordsTable(
  projectId: string,
  userId: string,
  range: DateRange,
  metricName: string | null,
  limit = 50
): Promise<
  | {
      id: string;
      observationDate: string;
      metricName: string;
      metricValue: number;
      pagePath: string | null;
      dimensionName: string | null;
      dimensionValue: string | null;
    }[]
  | null
> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();
  const args: (string | number)[] = [projectId];
  let where = "project_id = ?";
  if (isValidDate(range.from)) {
    where += " AND observation_date >= ?";
    args.push(range.from);
  }
  if (isValidDate(range.to)) {
    where += " AND observation_date <= ?";
    args.push(range.to);
  }
  if (metricName) {
    where += " AND metric_name = ?";
    args.push(metricName);
  }
  const lim = Math.min(Math.max(limit, 1), 200);
  args.push(lim);

  const result = await db.execute({
    sql: `SELECT id, observation_date, metric_name, metric_value,
                 page_path, dimension_name, dimension_value
          FROM analytics_records
          WHERE ${where}
          ORDER BY observation_date DESC, created_at DESC
          LIMIT ?`,
    args,
  });

  return result.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      observationDate: String(row.observation_date),
      metricName: String(row.metric_name),
      metricValue: Number(row.metric_value),
      pagePath: row.page_path == null ? null : String(row.page_path),
      dimensionName: row.dimension_name == null ? null : String(row.dimension_name),
      dimensionValue:
        row.dimension_value == null ? null : String(row.dimension_value),
    };
  });
}
