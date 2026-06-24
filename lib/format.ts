const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

// Format a value as Nigerian Naira (₦).
export function formatNaira(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return ngn.format(Number.isFinite(n) ? n : 0);
}
