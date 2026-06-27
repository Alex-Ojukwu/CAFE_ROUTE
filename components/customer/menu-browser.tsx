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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
          Discover
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          <span className="text-primary">CafeRoute</span> Specials
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          Freshly made, delivered hot. Tap add, then check out when you&apos;re
          ready.
        </p>
      </header>

      {/* Everyday staples — the big cream pop-out heroes. */}
      {staples.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 font-serif text-xl font-semibold text-ink">
            Everyday Specials
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

      {/* Everything else — quieter, compact cards. */}
      {others.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
            Also on the menu
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                tag={POPULAR.has(item.name) ? "Popular" : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
