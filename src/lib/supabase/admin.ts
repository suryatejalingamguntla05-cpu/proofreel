/**
 * src/lib/supabase/admin.ts
 * ---------------------------------------------------------------------------
 * Server-side Supabase admin client. Only constructed when server-side envs are
 * available. Exports a fail-loud proxy when not configured so builds remain safe.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AdminDb = SupabaseClient;

function unconfiguredProxy(): AdminDb {
  const failOnce = () => {
    throw new Error(
      "Supabase admin is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in your environment. This operation was not performed."
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
  return new Proxy(failOnce, handler) as unknown as AdminDb;
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

export const supabaseAdmin: AdminDb = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : unconfiguredProxy();

export default supabaseAdmin;
