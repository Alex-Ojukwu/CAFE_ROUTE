import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-9 w-44" />
      <Skeleton className="mt-6 h-80 w-full rounded-2xl" />
    </div>
  );
}
