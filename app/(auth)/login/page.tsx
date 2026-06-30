"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white transition placeholder:text-white/35 focus:border-primary/70 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  // Stays true through the redirect so the overlay doesn't flicker off before
  // the destination portal renders. Only reset on error.
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-black">
      {/* Full-bleed cinematic food background with a slow Ken Burns drift. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/food_login_pic.jpg"
          alt=""
          aria-hidden="true"
          className="animate-ken-burns h-full w-full object-cover"
        />
      </div>
      {/* Cinematic scrim: keep the food visible but dark enough for white text
          and the glass card to read with contrast. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/85 via-black/55 to-black/85" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
      {/* Top + bottom fades blend the photo into pure black at the edges. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-black to-transparent" />

      {/* Full-screen loading overlay — stays up from click through the redirect. */}
      {signingIn && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/90 backdrop-blur-md"
        >
          <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />
          <p className="font-display text-2xl italic text-white">
            Signing you in…
          </p>
        </div>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-6 py-16 lg:flex-row lg:justify-between lg:gap-8 lg:px-10">
        {/* Welcome — desktop only, editorial italic display headline. */}
        <div className="hidden max-w-xl flex-col justify-center lg:flex">
          <span className="liquid-glass inline-flex h-14 w-14 items-center justify-center rounded-full">
            <Compass className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">
            Campus cafeteria, delivered
          </p>
          <h1 className="mt-3 font-display text-6xl italic leading-[0.95] tracking-tight text-white drop-shadow-xl lg:text-7xl">
            Good food,
            <br />
            served fast.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">
            Sign in to browse today&apos;s specials, track live orders, and pick
            up right where you left off.
          </p>
        </div>

        {/* Form — floating liquid-glass card. */}
        <div className="flex w-full max-w-sm items-center justify-center lg:w-auto lg:flex-none">
          <div className="liquid-glass-strong w-full max-w-sm rounded-[28px] p-8">
            <div className="text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary-300">
                Welcome back
              </p>
              <h2 className="mt-2 font-display text-4xl italic text-white">
                Sign in
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-white/70"
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
                  className="block text-xs font-semibold uppercase tracking-wider text-white/70"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/50 transition hover:text-primary focus:outline-none focus-visible:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={signingIn}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold uppercase tracking-wide text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-80"
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
                  <>
                    Sign in
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={onForgotPassword}
              className="mx-auto mt-5 block text-sm font-medium text-white/70 transition hover:text-primary"
            >
              Forgot password?
            </button>

            <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/55">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary-300 transition hover:text-primary"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal footer bar. */}
      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 pb-8 text-xs text-white/40 sm:flex-row lg:px-10">
        <p>&copy; {new Date().getFullYear()} CafeRoute. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          {["Help", "Terms", "Privacy"].map((link) => (
            <Link
              key={link}
              href="/"
              className="transition hover:text-white/70"
            >
              {link}
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}
