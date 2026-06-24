"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-context";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/format";

const schema = z.object({
  address: z.string().min(5, "Enter your delivery address"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    if (items.length === 0) {
      setServerError("Your cart is empty.");
      return;
    }

    const payload = items.map((i) => ({
      menu_item_id: i.menu_item_id,
      quantity: i.quantity,
    }));

    // Total is recomputed server-side inside place_order; never trusted here.
    const { data, error } = await supabase.rpc("place_order", {
      items: payload,
      address: values.address,
      phone: values.phone || null,
      notes: values.notes || null,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    clear();
    toast.success("Order placed! Track it below.");
    router.push(`/customer/orders/${data}`);
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-ink-muted">Your cart&apos;s empty.</p>
        <Link
          href="/customer"
          className="mt-3 inline-block text-sm font-medium text-primary-300 hover:text-primary"
        >
          Browse the menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl font-bold text-ink">Checkout</h1>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-surface-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">Order summary</h2>
          <ul className="mt-3 space-y-2">
            {items.map((i) => (
              <li
                key={i.menu_item_id}
                className="flex justify-between text-sm text-ink-muted"
              >
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span>{formatNaira(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-surface-border pt-3 text-sm font-semibold text-ink">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
        </section>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-surface-border bg-surface p-5"
          noValidate
        >
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-ink"
            >
              Delivery address
            </label>
            <textarea
              id="address"
              rows={2}
              {...register("address")}
              aria-invalid={!!errors.address}
              className={inputClass}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-400">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-ink"
            >
              Phone <span className="text-ink-muted">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-ink"
            >
              Notes <span className="text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={2}
              {...register("notes")}
              className={inputClass}
            />
          </div>

          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          >
            {isSubmitting
              ? "Placing order…"
              : `Place order · ${formatNaira(total)}`}
          </button>
        </form>
      </div>
    </main>
  );
}
