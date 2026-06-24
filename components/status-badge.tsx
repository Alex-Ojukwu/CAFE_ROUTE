import type { OrderStatus } from "@/lib/types";

// Bright pills that pop on the dark surface. Identical across ALL portals.
const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-400/20 text-amber-300",
  accepted: "bg-blue-400/20 text-blue-300",
  out_for_delivery: "bg-indigo-400/20 text-indigo-300",
  delivered: "bg-green-400/20 text-green-300",
  cancelled: "bg-gray-400/15 text-gray-400",
};

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
