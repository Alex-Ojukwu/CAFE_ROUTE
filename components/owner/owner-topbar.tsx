"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/wordmark";
import { RolePill } from "@/components/ui/role-pill";
import { SignOutButton } from "@/components/sign-out-button";

const LINKS = [
  { href: "/owner", label: "Dashboard" },
  { href: "/owner/orders", label: "Orders" },
  { href: "/owner/menu", label: "Menu" },
];

export function OwnerTopbar() {
  const pathname = usePathname();
  const navClass = (href: string) =>
    `text-sm ${
      pathname === href
        ? "font-semibold text-primary-300"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-background-raised/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/owner" />
          <RolePill label="Owner" />
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-4 sm:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={navClass(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </div>
      </div>
      <nav className="flex items-center gap-5 border-t border-surface-border px-4 py-2 sm:hidden">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={navClass(l.href)}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
