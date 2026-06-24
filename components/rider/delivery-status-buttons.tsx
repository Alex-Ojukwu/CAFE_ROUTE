"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types";

export function DeliveryStatusButtons({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function advance(next: OrderStatus) {
    setLoading(true);
    setError(null);
    const { error } = await supabase.rpc("update_order_status", {
      p_order_id: orderId,
      p_new_status: next,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success(
      next === "out_for_delivery" ? "Marked as picked up" : "Delivered 🎉"
    );
    router.refresh();
  }

  if (status === "delivered") {
    return (
      <p className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
        Delivered ✓
      </p>
    );
  }

  if (status !== "accepted" && status !== "out_for_delivery") return null;

  const next: OrderStatus =
    status === "accepted" ? "out_for_delivery" : "delivered";
  const label = status === "accepted" ? "Mark picked up" : "Mark delivered";

  return (
    <div>
      <button
        type="button"
        onClick={() => advance(next)}
        disabled={loading}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
      >
        {loading ? "Updating…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
