"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-context";
import type { MenuItem } from "@/lib/types";

type Variant = "full" | "icon";

// One add-to-cart behaviour, two looks: a labelled pill ("full") for the big
// staple cards, and a square "+" ("icon") for the compact cards.
export function AddToCartButton({
  item,
  variant = "full",
  tone = "dark",
}: {
  item: MenuItem;
  variant?: Variant;
  /** "dark" → dark button on cream cards; "amber" → amber button on dark cards. */
  tone?: "dark" | "amber";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({
      menu_item_id: item.id,
      name: item.name,
      price: Number(item.price),
      image_url: item.image_url,
    });
    setAdded(true);
    toast.success(`${item.name} added to cart`);
    setTimeout(() => setAdded(false), 1000);
  }

  if (variant === "icon") {
    const iconTone =
      tone === "amber"
        ? "bg-primary text-background hover:bg-primary-400"
        : "bg-background text-cream hover:bg-background-raised";
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${item.name} to cart`}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${iconTone}`}
      >
        {added ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Plus className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {added ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Added
        </>
      ) : (
        "Add to cart"
      )}
    </button>
  );
}
