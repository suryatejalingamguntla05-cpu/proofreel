import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { appUrl } from "@/lib/env";

/**
 * Supabase email-confirmation / magic-link callback.
 * Exchanges the one-time code for a session cookie, then routes the user to
 * onboarding (first visit) or their hub.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", appUrl())
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin ?? appUrl())
      );
    }

    // Server-side routing decision (never trust the "next" parameter blindly —
    // only allow internal paths).
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";
    return NextResponse.redirect(new URL(safeNext, origin ?? appUrl()));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Callback failed";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, origin ?? appUrl())
    );
  }
}
