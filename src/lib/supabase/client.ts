/**
 * src/lib/supabase/client.ts
 * ---------------------------------------------------------------------------
 * Server/browser-safe Supabase client using the PUBLISHABLE (anon) key.
 *
 * When Supabase env vars are not configured (fresh checkout), exports a
 * fail-loud proxy instead of crashing at import time, so the app still
 * builds and boots; any real DB usage throws a clear actionable error.
 * Operations never fake success.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, requirePublicEnv } from "@/lib/env";

type Db = SupabaseClient<any, "public", any>;

function unconfiguredProxy(): Db {
  const failOnce = () => {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example) and restart the server. This operation was not performed."
    );
  };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handler: ProxyHandler<any> = {
    get() {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const callable: any = (..._args: unknown[]) => new Proxy(callable, handler);
      return callable;
    },
    apply() {
      failOnce();
    },
  };
  return new Proxy(function () {} as unknown as Db, handler);
}

export const supabase: Db = isSupabaseConfigured()
  ? createClient(requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL"), requirePublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : unconfiguredProxy();

export default supabase;
