import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatusTimeline } from "@/components/order-status-timeline";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { CancelOrderButton } from "@/components/customer/cancel-order-button";
import { OrderChat } from "@/components/order-chat";
import { formatNaira } from "@/lib/format";
import type { Order, OrderItem, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

const cardClass = "rounded-2xl border border-surface-border bg-surface p-5";

export default async function OrderDetailPage({
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

  let rider: { full_name: string; phone: string | null } | null = null;
  let messages: Message[] = [];
  if (order.rider_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", order.rider_id)
      .single();
    rider = data;

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    messages = (msgs as Message[]) ?? [];
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <RealtimeRefresher table="orders" filter={`id=eq.${order.id}`} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-ink-muted">
            {format(new Date(order.placed_at), "d MMM yyyy, HH:mm")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className={`mt-6 ${cardClass}`}>
        <OrderStatusTimeline status={order.status} />
      </section>

      {rider && (
        <>
          <section className={`mt-4 ${cardClass}`}>
            <h2 className="text-sm font-semibold text-ink">Your rider</h2>
            <p className="mt-1 text-sm text-ink">
              {rider.full_name}
              {rider.phone ? ` · ${rider.phone}` : ""}
            </p>
          </section>
          <div className="mt-4">
            <OrderChat
              orderId={order.id}
              currentUserId={user!.id}
              counterpartyName={rider.full_name}
              initialMessages={messages}
            />
          </div>
        </>
      )}

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

      <section className={`mt-4 ${cardClass}`}>
        <h2 className="text-sm font-semibold text-ink">Delivery</h2>
        <p className="mt-1 text-sm text-ink">{order.delivery_address}</p>
        {order.delivery_notes && (
          <p className="mt-1 text-xs text-ink-muted">
            Notes: {order.delivery_notes}
          </p>
        )}
        {order.customer_phone && (
          <p className="mt-1 text-xs text-ink-muted">
            Phone: {order.customer_phone}
          </p>
        )}
      </section>

      {order.status === "pending" && (
        <div className="mt-5">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </main>
  );
}
