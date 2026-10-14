/**
 * src/lib/supabase/middleware.ts
 * ---------------------------------------------------------------------------
 * Supabase middleware helpers.
 *
 * Prefer the auth helpers in src/lib/auth/session.ts over this file in most
 * app code. This file exists to house shared middleware utilities.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseMiddleware() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Ensure the auth cookie is read on each request
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // This can happen if the cookie has already been set
            // prior to the request (e.g. via a redirect from the
            // auth callback). In that case, ignore the error.
          }
        },
      },
    }
  );
}
