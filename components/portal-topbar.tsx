import { Wordmark } from "@/components/ui/wordmark";
import { RolePill } from "@/components/ui/role-pill";
import { SignOutButton } from "./sign-out-button";

// Shared portal header on the dark surface. Used by portals without a
// portal-specific topbar (e.g. owner).
export function PortalTopbar({
  fullName,
  roleLabel,
}: {
  fullName: string;
  roleLabel: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-background-raised/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/" />
          <RolePill label={roleLabel} />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-muted sm:inline">
            {fullName}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
