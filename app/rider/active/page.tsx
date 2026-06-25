import Link from "next/link";
import { format } from "date-fns";
import { Bike, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RiderActivePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["accepted", "out_for_delivery"])
    .order("accepted_at", { ascending: false });
  const orders = (data as Order[] | null) ?? [];

  // Customer names + phones for these deliveries (RLS lets the assigned
  // rider read their counterparties' profiles).
  const ids = Array.from(new Set(orders.map((o) => o.customer_id)));
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", ids);
  const byId = new Map(
    (profs ?? []).map((p) => [p.id, p as { full_name: string; phone: string | null }])
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <RealtimeRefresher table="orders" filter={`rider_id=eq.${user!.id}`} />
      <h1 className="font-serif text-2xl font-bold text-ink">My deliveries</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Bike className="h-8 w-8" />}
            title="No active deliveries"
            description="Grab one from the pool to get going."
            action={
              <Link
                href="/rider"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background hover:bg-primary-400"
              >
                Go to pool
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((o) => {
            const customer = byId.get(o.customer_id);
            const phone = o.customer_phone ?? customer?.phone ?? null;
            return (
              <li
                key={o.id}
                className="rounded-2xl border border-surface-border bg-surface transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <Link href={`/rider/active/${o.id}`} className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      Order #{o.id.slice(0, 8)}
                    </p>
                    {customer?.full_name && (
                      <p className="text-xs text-ink">{customer.full_name}</p>
                    )}
                    <p className="truncate text-xs text-ink-muted">
                      {o.delivery_address}
                    </p>
                    {o.accepted_at && (
                      <p className="text-xs text-ink-muted/70">
                        Accepted {format(new Date(o.accepted_at), "HH:mm")}
                      </p>
                    )}
                  </Link>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink">
                        {formatNaira(o.total)}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        aria-label={`Call ${customer?.full_name ?? "customer"}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-medium text-primary-300 transition hover:border-primary/40"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
