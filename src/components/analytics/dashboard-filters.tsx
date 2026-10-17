"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DashboardFilters({
  metrics,
  initialFrom,
  initialTo,
  initialMetric,
}: {
  metrics: string[];
  initialFrom: string;
  initialTo: string;
  initialMetric: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [metric, setMetric] = useState(initialMetric);
  const [pending, startTransition] = useTransition();

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("from", from);
    else params.delete("from");
    if (to) params.set("to", to);
    else params.delete("to");
    if (metric) params.set("metric", metric);
    else params.delete("metric");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [from, to, metric, pathname, router, searchParams]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="space-y-1">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full sm:w-40"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full sm:w-40"
        />
      </div>
      <div className="space-y-1 sm:min-w-[12rem] sm:flex-1">
        <Label htmlFor="metric">Metric</Label>
        <select
          id="metric"
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          <option value="">All metrics (table only)</option>
          {metrics.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" onClick={apply} loading={pending}>
        Apply
      </Button>
    </div>
  );
}
