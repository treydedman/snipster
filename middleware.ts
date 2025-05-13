import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function middleware(request: NextRequest) {
  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define public paths (no auth required)
  const publicPaths = [
    "/auth/sign-up",
    "/auth/sign-in",
    "/auth/guest-sign-in",
    "/auth/callback",
  ];

  // Get the current pathname
  const pathname = request.nextUrl.pathname;

  // If the path is public, allow access
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Protect other routes (e.g., /dashboard)
  if (!session) {
    // Redirect to sign-in page for non-guest attempts
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // Allow access if authenticated (including guest)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
