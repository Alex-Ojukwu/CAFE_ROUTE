import Link from "next/link";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("placed_at", { ascending: false });
  const orders = (data as Order[] | null) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <RealtimeRefresher
        table="orders"
        filter={`customer_id=eq.${user!.id}`}
        intervalMs={8000}
      />
      <h1 className="font-serif text-2xl font-bold text-ink">My orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Receipt className="h-8 w-8" />}
            title="No orders yet"
            description="When you place an order it'll show up here so you can track it."
            action={
              <Link
                href="/customer"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background hover:bg-primary-400"
              >
                Browse the menu
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/customer/orders/${o.id}`}
                className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface p-4 transition hover:border-primary/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    Order #{o.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {format(new Date(o.placed_at), "d MMM yyyy, HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {formatNaira(o.total)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
