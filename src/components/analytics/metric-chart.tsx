"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function MetricChart({
  data,
  metricName,
}: {
  data: { date: string; value: number }[];
  metricName: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-foreground-muted">
        No points for this metric in the selected range.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis tick={{ fontSize: 11 }} width={48} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid var(--color-border, #e5e7eb)",
            }}
            labelFormatter={(l) => String(l)}
          />
          <Line
            type="monotone"
            dataKey="value"
            name={metricName}
            stroke="var(--color-primary, #2563eb)"
            strokeWidth={2}
            dot={data.length < 40}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
