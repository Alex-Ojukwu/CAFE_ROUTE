"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { Wordmark } from "@/components/ui/wordmark";
import { RolePill } from "@/components/ui/role-pill";
import { SignOutButton } from "@/components/sign-out-button";
import { formatNaira } from "@/lib/format";

export function CustomerTopbar() {
  const { items, count, total, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navClass = (href: string) =>
    `text-sm ${
      pathname === href
        ? "font-semibold text-primary-300"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-surface-border bg-background-raised/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Wordmark href="/customer" />
            <RolePill label="Customer" />
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 sm:flex">
              <Link href="/customer" className={navClass("/customer")}>
                Menu
              </Link>
              <Link
                href="/customer/orders"
                className={navClass("/customer/orders")}
              >
                My orders
              </Link>
            </nav>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              className="relative inline-flex h-10 items-center gap-1.5 rounded-lg border border-surface-border bg-background px-3 text-sm font-medium text-ink transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-background">
                  {count}
                </span>
              )}
            </button>
            <SignOutButton />
          </div>
        </div>
        <nav className="flex items-center gap-5 border-t border-surface-border px-4 py-2 sm:hidden">
          <Link href="/customer" className={navClass("/customer")}>
            Menu
          </Link>
          <Link href="/customer/orders" className={navClass("/customer/orders")}>
            My orders
          </Link>
        </nav>
      </header>

      {/* Mobile bottom cart bar — one-thumb reach. Hidden on checkout so it
          doesn't cover the "Place order" button. */}
      {count > 0 && !open && pathname !== "/customer/checkout" && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-between rounded-2xl bg-primary px-5 py-3 text-background shadow-glow sm:hidden"
        >
          <span className="text-sm font-semibold">
            {count} item{count === 1 ? "" : "s"}
          </span>
          <span className="text-sm font-semibold">View cart · {formatNaira(total)}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-30" role="dialog" aria-label="Cart">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-surface-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
              <h2 className="font-serif text-lg font-semibold text-ink">
                Your cart
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="rounded p-1 text-ink-muted hover:bg-background-raised hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-sm text-ink-muted">
                  Your cart&apos;s empty. Add something tasty.
                </p>
              ) : (
                <ul className="space-y-3">
                  {items.map((i) => (
                    <li key={i.menu_item_id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">{i.name}</p>
                        <p className="text-xs text-ink-muted">
                          {formatNaira(i.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(i.menu_item_id, i.quantity - 1)}
                          aria-label={`Decrease ${i.name}`}
                          className="rounded border border-surface-border p-1.5 text-ink hover:bg-background-raised"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-6 text-center text-sm text-ink">
                          {i.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(i.menu_item_id, i.quantity + 1)}
                          aria-label={`Increase ${i.name}`}
                          className="rounded border border-surface-border p-1.5 text-ink hover:bg-background-raised"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(i.menu_item_id)}
                          aria-label={`Remove ${i.name}`}
                          className="ml-1 rounded p-1.5 text-ink-muted hover:bg-background-raised hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-surface-border px-4 py-3">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-ink-muted">Total</span>
                <span className="text-base font-semibold text-ink">
                  {formatNaira(total)}
                </span>
              </div>
              <Link
                href="/customer/checkout"
                onClick={() => setOpen(false)}
                aria-disabled={items.length === 0}
                className={`block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                  items.length === 0
                    ? "pointer-events-none bg-surface-border text-ink-muted"
                    : "bg-primary text-background hover:bg-primary-400"
                }`}
              >
                Proceed to checkout
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
