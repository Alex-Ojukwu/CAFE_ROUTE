"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";

// Fires an OS/browser notification only when the tab is in the background;
// when it's focused the in-app toast is enough.
function osNotify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted" && document.hidden) {
    try {
      new Notification(title, { body });
    } catch {
      // some browsers throw if called outside a SW context; ignore
    }
  }
}

const CUSTOMER_MESSAGES: Partial<
  Record<OrderStatus, { title: string; body: string }>
> = {
  accepted: { title: "Rider assigned ✅", body: "A rider accepted your order." },
  out_for_delivery: {
    title: "On the way 🛵",
    body: "Your order is out for delivery.",
  },
  delivered: {
    title: "Delivered 🍽️",
    body: "Your order has arrived. Enjoy!",
  },
};

// role="customer": alerts on this customer's order status changes.
// role="rider": alerts when a new order lands in the pool.
export function OrderNotifier({
  role,
  userId,
}: {
  role: "customer" | "rider";
  userId: string;
}) {
  const seen = useRef<Map<string, OrderStatus>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Notification chime. Browsers block audio until the user has interacted
    // with the page once (autoplay policy) — that's not a permission prompt, so
    // we silently "unlock" it on the first gesture. After that it plays on
    // every alert without ever asking the user.
    const audio = new Audio("/mixkit-confirmation-tone-2867.wav");
    audio.preload = "auto";
    audioRef.current = audio;

    const unlock = () => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    // One-time prompt to enable browser notifications.
    if (
      "Notification" in window &&
      Notification.permission === "default" &&
      !localStorage.getItem("caferoute_notif_prompted")
    ) {
      localStorage.setItem("caferoute_notif_prompted", "1");
      toast("Enable notifications?", {
        description:
          role === "rider"
            ? "Get alerted the moment a new order comes in."
            : "Get alerted as your order moves to your door.",
        action: {
          label: "Enable",
          onClick: () => Notification.requestPermission(),
        },
        duration: 12000,
      });
    }

    // Plays the chime on every alert, whether the tab is focused or not.
    const playSound = () => {
      const a = audioRef.current;
      if (!a) return;
      a.currentTime = 0;
      a.play().catch(() => {});
    };

    const supabase = createClient();
    const channel = supabase.channel(`notify-${role}-${userId}`);

    if (role === "customer") {
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          const o = payload.new as Order;
          if (seen.current.get(o.id) === o.status) return;
          seen.current.set(o.id, o.status);
          const msg = CUSTOMER_MESSAGES[o.status];
          if (msg) {
            playSound();
            toast.success(`${msg.title} — ${msg.body}`);
            osNotify(msg.title, msg.body);
          }
        }
      );
    } else {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `status=eq.pending`,
        },
        (payload) => {
          const o = payload.new as Order;
          if (seen.current.has(o.id)) return;
          seen.current.set(o.id, o.status);
          playSound();
          toast.success("New order 🛵 — a delivery is available in the pool.");
          osNotify("New order 🛵", "A delivery is available in the pool.");
        }
      );
    }

    channel.subscribe();
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      supabase.removeChannel(channel);
    };
  }, [role, userId]);

  return null;
}
