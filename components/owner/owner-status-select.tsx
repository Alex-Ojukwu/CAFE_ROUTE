"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OwnerStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function change(next: OrderStatus) {
    if (next === status) return;
    setLoading(true);
    // Cancel goes through cancel_order (stamps cancelled_at); other overrides
    // go through update_order_status (owner-override path, stamps delivered_at).
    const { error } =
      next === "cancelled"
        ? await supabase.rpc("cancel_order", { p_order_id: orderId })
        : await supabase.rpc("update_order_status", {
            p_order_id: orderId,
            p_new_status: next,
          });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Order updated");
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={(e) => change(e.target.value as OrderStatus)}
      disabled={loading}
      aria-label="Change order status"
      className="rounded-lg border border-surface-border bg-background px-2 py-1.5 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
