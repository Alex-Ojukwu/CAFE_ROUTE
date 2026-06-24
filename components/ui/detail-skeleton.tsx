import { Skeleton } from "./skeleton";

// Loading shape for an order detail / delivery detail page.
export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
    </div>
  );
}
