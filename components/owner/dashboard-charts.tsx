"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatNaira } from "@/lib/format";
import type { OwnerStats, OrderStatus } from "@/lib/types";

const AXIS = "#A89A88";
const GRID = "#3A2F24";
const PRIMARY = "#EA6A1F";
const SUCCESS = "#4FB06A";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#FBBF24",
  accepted: "#60A5FA",
  out_for_delivery: "#818CF8",
  delivered: "#4ADE80",
  cancelled: "#9CA3AF",
};
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const tooltipStyle = {
  background: "#241D16",
  border: "1px solid #3A2F24",
  borderRadius: 12,
  color: "#F5EEE6",
  fontSize: 12,
} as const;

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function shortDay(day: string) {
  // "2026-06-24" -> "24 Jun"
  const d = new Date(day);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function DashboardCharts({ stats }: { stats: OwnerStats }) {
  const ordersData = stats.orders_per_day.map((d) => ({
    ...d,
    label: shortDay(d.day),
  }));
  const statusData = stats.status_breakdown.map((s) => ({
    name: STATUS_LABELS[s.status],
    value: Number(s.count),
    color: STATUS_COLORS[s.status],
  }));
  const topItems = stats.top_items.map((t) => ({
    name: t.item_name,
    qty: Number(t.qty),
  }));
  const riders = stats.deliveries_per_rider.map((r) => ({
    name: r.full_name,
    deliveries: Number(r.deliveries),
  }));

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Panel title="Orders per day">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={ordersData}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} />
            <YAxis stroke={AXIS} fontSize={11} allowDecimals={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
            <Bar dataKey="orders" fill={PRIMARY} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Revenue per day">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={ordersData}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} />
            <YAxis
              stroke={AXIS}
              fontSize={11}
              tickLine={false}
              width={70}
              tickFormatter={(v) => formatNaira(Number(v))}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => formatNaira(Number(v))}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={SUCCESS}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Status breakdown">
        {statusData.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {statusData.map((s) => (
                  <Cell key={s.name} fill={s.color} stroke="#241D16" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {statusData.map((s) => (
            <li key={s.name} className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.name} ({s.value})
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Top 5 items">
        {topItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">No sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" stroke={AXIS} fontSize={11} allowDecimals={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke={AXIS}
                fontSize={11}
                width={110}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
              <Bar dataKey="qty" fill={PRIMARY} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Deliveries per rider">
        {riders.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            No completed deliveries yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riders}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" stroke={AXIS} fontSize={11} tickLine={false} />
              <YAxis stroke={AXIS} fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
              <Bar dataKey="deliveries" fill={SUCCESS} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </div>
  );
}
