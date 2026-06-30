import Image from "next/image";
import { Star } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart-button";
import type { MenuItem } from "@/lib/types";

// The hero "everyday specials" card: a warm cream panel with the cut-out dish
// scaled up and bled past the card's edge so it reads as popping off the page.
// The parent grid MUST allow overflow (no overflow-hidden) for the pop to show.
export function StapleCard({
  item,
  tag,
}: {
  item: MenuItem;
  tag?: string;
}) {
  return (
    <article className="group relative overflow-visible rounded-3xl bg-cream shadow-card ring-1 ring-cream-dark/60 transition hover:-translate-y-0.5">
      {tag && (
        <span className="absolute left-4 top-4 z-20 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-background shadow-sm">
          {tag}
        </span>
      )}

      <div className="flex items-center gap-3 p-5 sm:gap-5">
        {/* Pop-out image. Cut-out PNG scaled past its box; drop shadow lifts it. */}
        <div className="relative h-28 w-28 shrink-0 self-stretch sm:h-36 sm:w-36">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 112px, 144px"
              className="pointer-events-none -translate-x-1 -translate-y-2 scale-[1.4] object-contain drop-shadow-pop transition duration-300 group-hover:scale-[1.5] sm:scale-[1.45]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              🍽️
            </div>
          )}
        </div>

        {/* Copy */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-serif text-xl font-bold uppercase leading-tight tracking-tight text-background sm:text-2xl">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-background/60">
              {item.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-background/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background/70">
              Everyday
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-background/70">
              <Star
                className="h-3.5 w-3.5 fill-primary text-primary"
                aria-hidden="true"
              />
              4.8
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="font-serif text-2xl font-bold text-background">
              {formatNaira(item.price)}
            </span>
            <AddToCartButton item={item} variant="icon" tone="dark" />
          </div>
        </div>
      </div>
    </article>
  );
}
