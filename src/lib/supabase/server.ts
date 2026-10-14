/**
 * src/lib/supabase/server.ts
 * ---------------------------------------------------------------------------
 * Server-only privileged Supabase access (service-role key).
 *
 * This is a thin re-export of the admin client in admin.ts so either import
 * path keeps working. The service-role key NEVER reaches the browser bundle;
 * consumers of this module must be server-side only (route handlers, server
 * components, scripts).
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export const supabaseServer = supabaseAdmin;

export default supabaseAdmin;
