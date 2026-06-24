import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/owner/kpi-card";
import { DashboardCharts } from "@/components/owner/dashboard-charts";
import { formatNaira } from "@/lib/format";
import type { OwnerStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "all", label: "All time" },
];

function computeRange(range: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  switch (range) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "all":
      return { from: new Date("2000-01-01"), to };
    case "7d":
    default:
      from.setDate(from.getDate() - 7);
  }
  return { from, to };
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default async function OwnerDashboard({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const range = searchParams.range ?? "7d";
  const { from, to } = computeRange(range);

  const supabase = createClient();
  const { data } = await supabase.rpc("owner_stats", {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  const stats = (data as OwnerStats | null) ?? null;
  const kpis = stats?.kpis ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-ink">Dashboard</h1>
        <nav className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface p-1">
          {RANGES.map((r) => {
            const active = r.key === range;
            return (
              <Link
                key={r.key}
                href={`/owner?range=${r.key}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-background"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {!stats ? (
        <p className="mt-10 rounded-2xl border border-surface-border bg-surface px-4 py-10 text-center text-sm text-ink-muted">
          Couldn&apos;t load stats. Make sure you&apos;re signed in as the owner.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KpiCard label="Total orders" value={String(kpis?.total_orders ?? 0)} />
            <KpiCard label="Delivered" value={String(kpis?.delivered ?? 0)} />
            <KpiCard
              label="Active now"
              value={String(kpis?.active ?? 0)}
              hint="pending + accepted + out"
            />
            <KpiCard label="Cancelled" value={String(kpis?.cancelled ?? 0)} />
            <KpiCard
              label="Revenue"
              value={formatNaira(kpis?.revenue ?? 0)}
              hint="delivered orders"
            />
            <KpiCard
              label="Avg delivery time"
              value={formatDuration(kpis?.avg_delivery_seconds ?? null)}
              hint="placed → delivered"
            />
          </div>

          <DashboardCharts stats={stats} />
        </>
      )}
    </main>
  );
}
