"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-context";
import { formatNaira } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export function MenuItemCard({
  item,
  tag,
}: {
  item: MenuItem;
  tag?: string;
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-card transition hover:border-primary/40">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-raised">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🍽️
          </div>
        )}
        {tag && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-background">
            {tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-ink">{item.name}</h3>
          <span className="whitespace-nowrap text-sm font-semibold text-primary-300">
            {formatNaira(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
            {item.description}
          </p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
