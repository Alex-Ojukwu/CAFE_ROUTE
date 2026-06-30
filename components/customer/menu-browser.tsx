import { UtensilsCrossed } from "lucide-react";
import { StapleCard } from "./staple-card";
import { MenuItemCard } from "./menu-item-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { MenuItem } from "@/lib/types";

// Editorial "Popular" tags on a few signature dishes.
const POPULAR = new Set(["Jollof Rice", "Shawarma", "Pizza"]);

export function MenuBrowser({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          icon={<UtensilsCrossed className="h-8 w-8" />}
          title="Menu coming soon"
          description="No dishes are available right now. Check back shortly."
        />
      </div>
    );
  }

  const staples = items.filter((i) => i.is_staple);
  const others = items.filter((i) => !i.is_staple);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8">
      {/* Warm cinematic glow behind the header for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 z-0 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <header className="relative z-10 mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">
          Discover
        </p>
        <h1 className="mt-2 font-display text-5xl italic leading-[0.95] tracking-tight text-ink drop-shadow sm:text-6xl">
          <span className="text-primary">CafeRoute</span> specials
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
          Freshly made, delivered hot. Tap add, then check out when you&apos;re
          ready.
        </p>
      </header>

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Everyday staples — the big cream pop-out heroes. */}
        {staples.length > 0 && (
          <section className="min-w-0">
            <h2 className="mb-5 font-display text-2xl italic text-ink">
              Everyday specials
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8">
              {staples.map((item) => (
                <StapleCard
                  key={item.id}
                  item={item}
                  tag={POPULAR.has(item.name) ? "Popular" : undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* Everything else — quieter rail to the right (stacks below on mobile). */}
        {others.length > 0 && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-4 font-display text-2xl italic text-ink">
              Also on the menu
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {others.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  tag={POPULAR.has(item.name) ? "Popular" : undefined}
                />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
