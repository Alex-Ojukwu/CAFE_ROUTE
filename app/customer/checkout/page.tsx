"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-context";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/format";
import { PACK_FEE, DELIVERY_FEE } from "@/lib/fees";

const schema = z.object({
  address: z.string().min(5, "Enter your delivery address"),
  phone: z.string().min(7, "Enter a phone number so your rider can reach you"),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  // total from the cart is the items subtotal; fees are added on top and the
  // server (place_order) recomputes the same grand total it actually charges.
  const grandTotal = total + PACK_FEE + DELIVERY_FEE;
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Prefill the phone from the customer's signup profile so they don't retype
  // it. Still editable in case they want a different number for this delivery.
  useEffect(() => {
    let active = true;
    const sb = createClient();
    (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!active || !user) return;
      const { data: profile } = await sb
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single();
      if (active && profile?.phone) {
        setValue("phone", profile.phone);
      }
    })();
    return () => {
      active = false;
    };
  }, [setValue]);

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
          <div className="mt-3 space-y-2 border-t border-surface-border pt-3 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Items subtotal</span>
              <span>{formatNaira(total)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Packaging fee</span>
              <span>{formatNaira(PACK_FEE)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Delivery fee</span>
              <span>{formatNaira(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-surface-border pt-2 text-base font-semibold text-ink">
              <span>Total to pay</span>
              <span>{formatNaira(grandTotal)}</span>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-background-raised px-3 py-2 text-xs text-ink-muted">
            Your total includes a {formatNaira(PACK_FEE)} packaging fee and a{" "}
            {formatNaira(DELIVERY_FEE)} delivery fee.
          </p>
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
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              aria-invalid={!!errors.phone}
              className={inputClass}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
            )}
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
              : `Place order · ${formatNaira(grandTotal)}`}
          </button>
        </form>
      </div>
    </main>
  );
}
