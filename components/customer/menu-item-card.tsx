import Image from "next/image";
import { formatNaira } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart-button";
import type { MenuItem } from "@/lib/types";

// Compact, dark card for the non-staple ("also on the menu") tier. Deliberately
// quieter than the cream StapleCard — small image with a gentle pop, no big
// serif price — so the everyday staples stay the visual heroes.
export function MenuItemCard({
  item,
  tag,
}: {
  item: MenuItem;
  tag?: string;
}) {
  return (
    <article className="liquid-glass group relative flex items-center gap-3 overflow-visible rounded-2xl p-3 transition hover:-translate-y-0.5">
      <div className="relative h-16 w-16 shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="64px"
            className="pointer-events-none -translate-y-1 scale-[1.2] object-contain drop-shadow-pop-sm transition duration-300 group-hover:scale-[1.3]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {tag && (
          <span className="mb-0.5 w-fit rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-300">
            {tag}
          </span>
        )}
        <h3 className="truncate text-sm font-semibold text-ink">{item.name}</h3>
        <span className="text-sm font-semibold text-primary-300">
          {formatNaira(item.price)}
        </span>
      </div>

      <AddToCartButton item={item} variant="icon" tone="amber" />
    </article>
  );
}
