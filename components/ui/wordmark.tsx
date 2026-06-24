import Link from "next/link";
import { Compass } from "lucide-react";

// Serif wordmark + amber compass-pin logo. Used in every portal shell.
export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="CafeRoute home">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/40">
        <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
      </span>
      <span className="font-serif text-xl font-bold tracking-tight text-ink">
        CafeRoute
      </span>
    </Link>
  );
}
