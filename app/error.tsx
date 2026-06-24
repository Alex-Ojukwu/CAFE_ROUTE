"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-2xl font-bold text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        Try again
      </button>
    </main>
  );
}
