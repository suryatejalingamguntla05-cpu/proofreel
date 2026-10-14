/**
 * src/lib/supabase/admin.ts
 * ---------------------------------------------------------------------------
 * SERVICE-ROLE Supabase client (server only — never import into browser
 * bundles). Used for privileged operations: creating profiles after signup,
 * admin moderation, seeding, verification review.
 *
 * If SUPABASE_SERVICE_ROLE_KEY is not configured, operations fail loudly with
 * an actionable message instead of crashing at import time.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseAdminConfigured, requirePublicEnv, requireServerEnv } from "@/lib/env";

type Db = SupabaseClient;

function unconfiguredProxy(): Db {
  const failOnce = () => {
    throw new Error(
      "Supabase service-role access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example), restart the server, and retry. This privileged operation was NOT executed."
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

export const supabaseAdmin: Db = isSupabaseAdminConfigured()
  ? createClient(requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL"), requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : unconfiguredProxy();

export default supabaseAdmin;
