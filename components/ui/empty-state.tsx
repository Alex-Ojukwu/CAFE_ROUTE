import type { ReactNode } from "react";

// On-theme empty state: friendly copy + an optional next action.
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface px-6 py-14 text-center">
      {icon && <div className="mb-3 text-primary/70">{icon}</div>}
      <p className="font-serif text-lg text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
