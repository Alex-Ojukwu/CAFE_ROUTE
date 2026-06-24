"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/ui/wordmark";
import { RolePill } from "@/components/ui/role-pill";
import { SignOutButton } from "@/components/sign-out-button";

export function RiderTopbar({
  userId,
  initialActive,
}: {
  userId: string;
  initialActive: boolean;
}) {
  const supabase = createClient();
  const pathname = usePathname();
  const [active, setActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !active;
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: next })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Couldn't update availability");
      return;
    }
    setActive(next);
    toast.success(next ? "You're now available" : "You're off duty");
  }

  const navClass = (href: string) =>
    `text-sm ${
      pathname === href
        ? "font-semibold text-primary-300"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-background-raised/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/rider" />
          <RolePill label="Rider" />
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-4 sm:flex">
            <Link href="/rider" className={navClass("/rider")}>
              Pool
            </Link>
            <Link href="/rider/active" className={navClass("/rider/active")}>
              My deliveries
            </Link>
          </nav>
          <button
            type="button"
            onClick={toggle}
            disabled={saving}
            aria-pressed={active}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition disabled:opacity-60 ${
              active
                ? "bg-success/15 text-success ring-1 ring-success/40"
                : "bg-surface text-ink-muted ring-1 ring-surface-border"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                active ? "bg-success" : "bg-ink-muted"
              }`}
              aria-hidden="true"
            />
            {active ? "Available" : "Off duty"}
          </button>
          <SignOutButton />
        </div>
      </div>
      <nav className="flex items-center gap-5 border-t border-surface-border px-4 py-2 sm:hidden">
        <Link href="/rider" className={navClass("/rider")}>
          Pool
        </Link>
        <Link href="/rider/active" className={navClass("/rider/active")}>
          My deliveries
        </Link>
      </nav>
    </header>
  );
}
