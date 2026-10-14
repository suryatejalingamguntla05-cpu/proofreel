/**
 * src/lib/supabase/client.ts
 * ---------------------------------------------------------------------------
 * Client-side Supabase client using the public (anon/publishable) key.
 * This version supports fallback environment variable names so deployments
 * that provide SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY still work.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Db = SupabaseClient;

function unconfiguredProxy(): Db {
  const failOnce = () => {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY) in your environment (see .env.example) and restart the server. This operation was not performed."
    );
  };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handler: ProxyHandler<any> = {
    get(_target, property) {
      if (property === "then") return failOnce();
      return new Proxy(failOnce, handler);
    },
    apply() {
      failOnce();
    },
  };
  return new Proxy(failOnce, handler) as unknown as Db;
}

function publicUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? undefined;
}

function publicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? undefined;
}

const url = publicUrl();
const key = publicKey();

export const supabase: Db = url && key
  ? createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : unconfiguredProxy();

export default supabase;
