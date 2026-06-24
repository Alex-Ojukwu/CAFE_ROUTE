"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Subscribes to Realtime changes on a table and refreshes the server
// components when something changes. RLS still scopes what the user receives.
//
// `filter` narrows the subscription (e.g. `customer_id=eq.<id>`).
// `intervalMs` adds a polling fallback — used by the rider pool, where an
// order accepted by another rider becomes unreadable to this rider (RLS), so
// the "row left the pool" event is never delivered and a periodic refresh
// catches it instead.
export function RealtimeRefresher({
  table,
  filter,
  intervalMs,
}: {
  table: string;
  filter?: string;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`rt-${table}-${filter ?? "all"}`);
    const subscription = filter
      ? channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter },
          () => router.refresh()
        )
      : channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => router.refresh()
        );
    subscription.subscribe();

    const timer = intervalMs
      ? setInterval(() => router.refresh(), intervalMs)
      : undefined;

    return () => {
      supabase.removeChannel(channel);
      if (timer) clearInterval(timer);
    };
  }, [table, filter, intervalMs, router]);

  return null;
}
