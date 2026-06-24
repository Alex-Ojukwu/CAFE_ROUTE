"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AcceptOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    // accept_order atomically flips pending -> accepted only if still pending.
    const { error } = await supabase.rpc("accept_order", {
      p_order_id: orderId,
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      toast.error(error.message);
      router.refresh();
      return;
    }
    toast.success("Delivery accepted");
    router.push(`/rider/active/${orderId}`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={accept}
        disabled={loading}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Accepting…" : "Accept delivery"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
