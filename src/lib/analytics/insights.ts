import { getDb } from "@/lib/db/client";
import { ensureDbReady } from "@/lib/db/ensure";
import { getProjectForUser } from "@/lib/projects/store";

export type InsightContext = {
  projectName: string;
  domain: string | null;
  metrics: {
    metric: string;
    points: number;
    sum: number;
    avg: number;
    minDate: string | null;
    maxDate: string | null;
  }[];
  recentDaily: { date: string; metric: string; value: number }[];
};

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY?.trim());
}

export async function buildInsightContext(
  projectId: string,
  userId: string
): Promise<InsightContext | null> {
  await ensureDbReady();
  const project = await getProjectForUser(projectId, userId);
  if (!project) return null;

  const db = await getDb();

  const metricAgg = await db.execute({
    sql: `SELECT metric_name AS m,
                 COUNT(*) AS c,
                 SUM(metric_value) AS s,
                 AVG(metric_value) AS a,
                 MIN(observation_date) AS mind,
                 MAX(observation_date) AS maxd
          FROM analytics_records
          WHERE project_id = ?
          GROUP BY metric_name
          ORDER BY c DESC
          LIMIT 12`,
    args: [projectId],
  });

  const metrics = metricAgg.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      metric: String(row.m),
      points: Number(row.c ?? 0),
      sum: Number(row.s ?? 0),
      avg: Number(row.a ?? 0),
      minDate: row.mind == null ? null : String(row.mind),
      maxDate: row.maxd == null ? null : String(row.maxd),
    };
  });

  const recent = await db.execute({
    sql: `SELECT observation_date AS d, metric_name AS m, SUM(metric_value) AS v
          FROM analytics_records
          WHERE project_id = ?
          GROUP BY observation_date, metric_name
          ORDER BY observation_date DESC
          LIMIT 60`,
    args: [projectId],
  });

  const recentDaily = recent.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      date: String(row.d),
      metric: String(row.m),
      value: Number(row.v ?? 0),
    };
  });

  return {
    projectName: project.name,
    domain: project.domain,
    metrics,
    recentDaily,
  };
}

/** Deterministic local insights when no AI key is configured. */
export function localHeuristicInsights(ctx: InsightContext): string {
  if (ctx.metrics.length === 0) {
    return "No analytics records yet. Import CSV or JSON data to generate insights.";
  }

  const lines: string[] = [];
  lines.push(
    `Project “${ctx.projectName}”${ctx.domain ? ` (${ctx.domain})` : ""} has ${ctx.metrics.length} metric type(s) in the archive.`
  );

  for (const m of ctx.metrics.slice(0, 5)) {
    lines.push(
      `• ${m.metric}: ${m.points} point(s), sum ${format(m.sum)}, average ${format(m.avg)}` +
        (m.minDate && m.maxDate ? ` (${m.minDate} → ${m.maxDate})` : "")
    );
  }

  // Simple trend: compare last vs previous value for top metric
  const top = ctx.metrics[0]?.metric;
  if (top) {
    const series = ctx.recentDaily
      .filter((r) => r.metric === top)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (series.length >= 2) {
      const last = series[series.length - 1];
      const prev = series[series.length - 2];
      const delta = last.value - prev.value;
      const pct =
        prev.value !== 0 ? ((delta / prev.value) * 100).toFixed(1) : "n/a";
      lines.push(
        `• Latest ${top} on ${last.date}: ${format(last.value)} (${delta >= 0 ? "+" : ""}${format(delta)} vs prior day, ${pct}%).`
      );
    }
  }

  lines.push(
    "Connect AI_API_KEY for richer narrative insights (OpenAI-compatible API)."
  );
  return lines.join("\n");
}

function format(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export async function generateAiInsights(
  ctx: InsightContext
): Promise<{ text: string; provider: "ai" | "local" }> {
  if (!isAiConfigured()) {
    return { text: localHeuristicInsights(ctx), provider: "local" };
  }

  const baseUrl = (
    process.env.AI_BASE_URL?.trim() || "https://api.x.ai/v1"
  ).replace(/\/$/, "");
  const model = process.env.AI_MODEL?.trim() || "grok-3";
  const apiKey = process.env.AI_API_KEY!.trim();

  const payload = {
    model,
    temperature: 0.3,
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content:
          "You are an analytics assistant for Analytics History Archive. " +
          "Given aggregated website metrics, write a concise, practical insight summary " +
          "(3–6 short paragraphs or bullets). Note trends, possible anomalies, and one suggested follow-up. " +
          "Do not invent numbers that are not in the data. No marketing fluff.",
      },
      {
        role: "user",
        content: `Analyze this project analytics summary as JSON:\n${JSON.stringify(ctx)}`,
      },
    ],
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("AI insights error:", res.status, errText.slice(0, 200));
    return {
      text:
        localHeuristicInsights(ctx) +
        "\n\n(AI request failed; showing local summary instead.)",
      provider: "local",
    };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return { text: localHeuristicInsights(ctx), provider: "local" };
  }
  return { text, provider: "ai" };
}
