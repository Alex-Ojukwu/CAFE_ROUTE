import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { DeliveryStatusButtons } from "@/components/rider/delivery-status-buttons";
import { OrderChat } from "@/components/order-chat";
import { formatNaira } from "@/lib/format";
import type { Order, OrderItem, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-surface-border bg-surface p-5";

export default async function RiderDeliveryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single<Order>();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", order.customer_id)
    .single();

  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  const messages = (msgs as Message[]) ?? [];

  const phone = order.customer_phone ?? customer?.phone ?? null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:pb-8">
      <RealtimeRefresher table="orders" filter={`id=eq.${order.id}`} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-ink-muted">
            Placed {format(new Date(order.placed_at), "d MMM, HH:mm")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className={`mt-6 ${cardClass}`}>
        <h2 className="text-sm font-semibold text-ink">Deliver to</h2>
        <p className="mt-1 text-sm text-ink">
          {customer?.full_name ?? "Customer"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">{order.delivery_address}</p>
        {order.delivery_notes && (
          <p className="mt-1 text-xs text-ink-muted">
            Notes: {order.delivery_notes}
          </p>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm font-medium text-primary-300 hover:border-primary/40"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {phone}
          </a>
        )}
      </section>

      <section className={`mt-4 ${cardClass}`}>
        <h2 className="text-sm font-semibold text-ink">Items</h2>
        <ul className="mt-3 space-y-2">
          {(items as OrderItem[] | null)?.map((it) => (
            <li
              key={it.id}
              className="flex justify-between text-sm text-ink-muted"
            >
              <span>
                {it.quantity} × {it.item_name}
              </span>
              <span>{formatNaira(Number(it.unit_price) * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-surface-border pt-3 text-sm font-semibold text-ink">
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </div>
      </section>

      <div className="mt-4">
        <OrderChat
          orderId={order.id}
          currentUserId={user!.id}
          counterpartyName={customer?.full_name ?? "Customer"}
          initialMessages={messages}
        />
      </div>

      {/* Primary action — bottom-anchored on mobile for one-thumb reach. */}
      <div className="fixed inset-x-3 bottom-3 z-20 sm:static sm:mt-4">
        <DeliveryStatusButtons orderId={order.id} status={order.status} />
      </div>
    </main>
  );
}
