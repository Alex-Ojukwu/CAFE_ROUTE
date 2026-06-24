"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.rpc("cancel_order", {
      p_order_id: orderId,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    toast.success("Order cancelled");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancel}
        disabled={loading}
        className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Cancelling…" : "Cancel order"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
