// Dark shimmer placeholder. Compose into list/card shapes for loading states.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}
