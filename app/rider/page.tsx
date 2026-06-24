import { format } from "date-fns";
import { MapPin, PackageOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { AcceptOrderButton } from "@/components/rider/accept-order-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type PoolOrder = Order & { order_items: { count: number }[] };

export default async function RiderPoolPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .eq("status", "pending")
    .order("placed_at", { ascending: true });
  const orders = (data as PoolOrder[] | null) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <RealtimeRefresher table="orders" intervalMs={8000} />
      <h1 className="font-serif text-2xl font-bold text-ink">Available orders</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Accept a delivery to start. New orders appear automatically.
      </p>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<PackageOpen className="h-8 w-8" />}
            title="No deliveries waiting"
            description="Nothing in the pool right now — check back soon."
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((o) => {
            const itemCount = o.order_items?.[0]?.count ?? 0;
            return (
              <li
                key={o.id}
                className="rounded-2xl border border-surface-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Order #{o.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {format(new Date(o.placed_at), "d MMM, HH:mm")} ·{" "}
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-300">
                    {formatNaira(o.total)}
                  </span>
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-sm text-ink">
                  <MapPin
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-muted"
                    aria-hidden="true"
                  />
                  {o.delivery_address}
                </p>
                <div className="mt-4">
                  <AcceptOrderButton orderId={o.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
