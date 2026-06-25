"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

const inputClass =
  "h-12 w-full rounded-xl border border-primary/60 bg-[#0E0B08] px-4 text-sm text-ink shadow-[0_0_14px_-3px_rgba(234,106,31,0.55)] transition placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  // Stays true through the redirect so the overlay doesn't flicker off before
  // the destination portal renders. Only reset on error.
  const [signingIn, setSigningIn] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setSigningIn(false);
      setServerError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function onForgotPassword() {
    const email = watch("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error("Enter your email above first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent — check your email.");
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Full-bleed food background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/food_login_pic.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Mood + contrast gradient: food shows through the middle, dark at the
          edges for the welcome text and the form. */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/35 to-background/90" />

      {/* Full-screen loading overlay — stays up from click through the redirect. */}
      {signingIn && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm"
        >
          <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />
          <p className="font-serif text-lg text-ink">Signing you in…</p>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        {/* Welcome — desktop only */}
        <div className="hidden flex-1 flex-col justify-center px-12 lg:px-20 md:flex">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/40">
            <Compass className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight text-ink drop-shadow-lg lg:text-6xl">
            Welcome to <span className="text-primary">CafeRoute</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-muted drop-shadow lg:text-lg">
            Sign in to access your curated meals, track live orders, and manage
            your account.
          </p>
        </div>

        {/* Form — floating dark card, pinned right on desktop */}
        <div className="flex flex-1 items-center justify-center p-6 md:flex-none md:basis-[460px] lg:basis-[540px]">
          <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-surface/95 p-7 shadow-glow backdrop-blur">
            <h2 className="text-center font-serif text-2xl font-bold text-ink">
              CafeRoute
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-muted"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  className={`mt-2 ${inputClass}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                  className={`mt-2 ${inputClass}`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <p className="text-sm text-ink-muted">
                Login with your account to continue.
              </p>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={signingIn}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold uppercase tracking-wide text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-80"
              >
                {signingIn ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={onForgotPassword}
              className="mx-auto mt-4 block text-sm font-medium text-primary-300 hover:text-primary"
            >
              Forgot Password?
            </button>

            <p className="mt-2 text-center text-sm text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary-300 hover:text-primary"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
