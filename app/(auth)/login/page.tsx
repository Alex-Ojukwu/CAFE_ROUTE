"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
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
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl shadow-glow ring-1 ring-primary/40 md:grid-cols-2">
        {/* Left — cream welcome panel (cropped from the design, hidden on mobile) */}
        <div className="relative hidden bg-ink md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-left.png"
            alt="Welcome back to CafeRoute — sign in to access your curated meals, track live orders, and manage your account."
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right — dark form panel */}
        <div className="bg-background px-7 py-9 sm:px-10">
          <h1 className="text-center font-serif text-2xl font-bold text-ink md:text-left">
            CafeRoute
          </h1>

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
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold uppercase tracking-wide text-background transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
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
    </main>
  );
}
