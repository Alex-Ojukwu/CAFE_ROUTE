// Small amber pill marking the active portal's role.
export function RolePill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary-300 ring-1 ring-primary/30">
      {label}
    </span>
  );
}
