"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

// Shared real-time chat between the customer and the assigned rider of an
// order. RLS guarantees only those two participants can read/write messages.
export function OrderChat({
  orderId,
  currentUserId,
  counterpartyName,
  initialMessages,
}: {
  orderId: string;
  currentUserId: string;
  counterpartyName: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Subscribe to new messages on this order.
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  // Keep the latest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setBody("");
    const { error } = await supabase.from("messages").insert({
      order_id: orderId,
      sender_id: currentUserId,
      body: text,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      setBody(text);
    }
    // The realtime subscription appends the message on insert.
  }

  return (
    <div className="flex flex-col rounded-2xl border border-surface-border bg-surface">
      <div className="border-b border-surface-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">
          Chat with {counterpartyName}
        </h2>
      </div>

      <div className="flex h-72 flex-col gap-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-ink-muted">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-primary text-background"
                      : "bg-background-raised text-ink"
                  }`}
                >
                  {m.body}
                </div>
                <span className="mt-0.5 text-[10px] text-ink-muted">
                  {format(new Date(m.created_at), "HH:mm")}
                </span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-surface-border p-3"
      >
        <label htmlFor={`chat-${orderId}`} className="sr-only">
          Message
        </label>
        <input
          id={`chat-${orderId}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          autoComplete="off"
          className="flex-1 rounded-lg border border-surface-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={sending || body.trim().length === 0}
          aria-label="Send message"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
