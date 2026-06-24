import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

type Role = "customer" | "rider" | "owner";
const PORTALS: Role[] = ["customer", "rider", "owner"];

// Refreshes the Supabase session and enforces role-based route guards.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/signup";
  const section = path.split("/")[1] as Role | string; // "", "customer", ...
  const isProtected = PORTALS.includes(section as Role);

  // Build a redirect that carries over any refreshed auth cookies.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // Logged out: only protected portals are blocked.
  if (!user) {
    return isProtected ? redirectTo("/login") : supabaseResponse;
  }

  // Logged in: resolve this user's role and home portal.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role as Role | undefined;
  const home = role ? `/${role}` : "/login";

  // On an auth page while logged in -> go to your own portal.
  if (isAuthPage) return redirectTo(home);

  // Wrong portal for your role -> bounce to your own.
  if (isProtected && section !== role) return redirectTo(home);

  return supabaseResponse;
}
