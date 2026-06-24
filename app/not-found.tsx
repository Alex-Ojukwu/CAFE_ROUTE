import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-5xl font-bold text-primary">404</p>
      <h1 className="mt-3 font-serif text-2xl font-bold text-ink">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        That page doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/"
        className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-400"
      >
        Back to CafeRoute
      </Link>
    </main>
  );
}
