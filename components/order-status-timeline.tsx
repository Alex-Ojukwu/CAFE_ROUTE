import type { OrderStatus } from "@/lib/types";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Placed" },
  { status: "accepted", label: "Accepted" },
  { status: "out_for_delivery", label: "On the way" },
  { status: "delivered", label: "Delivered" },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-surface-border bg-background-raised px-4 py-3 text-sm text-ink-muted">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="flex items-start">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step.status} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-primary text-background shadow-glow"
                    : "bg-surface-border/50 text-ink-muted"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`mt-1.5 text-center text-[11px] ${
                  done ? "text-ink" : "text-ink-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 mb-5 h-0.5 flex-1 ${
                  i < currentIndex ? "bg-primary" : "bg-surface-border/60"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
