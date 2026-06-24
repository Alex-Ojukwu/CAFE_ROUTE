"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-background-raised px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
