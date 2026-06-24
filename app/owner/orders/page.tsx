import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { OwnerStatusSelect } from "@/components/owner/owner-status-select";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OwnerOrdersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("placed_at", { ascending: false });
  const orders = (data as Order[] | null) ?? [];

  // Resolve customer + rider names (owner can read all profiles).
  const ids = Array.from(
    new Set(
      orders.flatMap((o) => [o.customer_id, o.rider_id]).filter(Boolean)
    )
  ) as string[];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);
  const nameById = new Map((profs ?? []).map((p) => [p.id, p.full_name]));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <RealtimeRefresher table="orders" intervalMs={15000} />
      <h1 className="font-serif text-3xl font-bold text-ink">All orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No orders yet"
            description="Orders placed by customers will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Rider</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {orders.map((o) => (
                <tr key={o.id} className="text-ink">
                  <td className="px-4 py-3 font-medium">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {nameById.get(o.customer_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {o.rider_id ? nameById.get(o.rider_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {format(new Date(o.placed_at), "d MMM, HH:mm")}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatNaira(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <OwnerStatusSelect orderId={o.id} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
