/**
 * src/lib/auth/session.ts
 * ---------------------------------------------------------------------------
 * Session, role, and permission helpers.
 *
 * We perform authorization in TypeScript (server-side), never trusting the
 * browser. Roles are derived server-side from the `profiles` table.
 */

import { supabase } from "@/lib/supabase/client";
import { profileWithUser } from "@/types/database";
import { isUserRole } from "@/types/role";

// ---------------------------------------------------------------------------
// Fetch the current authenticated user + their profile (if any)
// ---------------------------------------------------------------------------
export async function getSessionUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.warn("[auth] getUser error:", error.message);
    return null;
  }
  if (!user) return null;

  const profile = await getProfileByAuthId(user.id);
  const role = profile?.role ?? "creator";
  if (!isUserRole(role)) {
    console.warn(`[auth] Invalid role "${role}" for auth_id ${user.id}, defaulting to "creator"`);
  }

  return {
    user,
    profile: profile as profileWithUser | null,
    role,
  };
}

export async function getProfileByAuthId(authId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", authId)
    .single();
  if (error) {
    console.warn("[auth] getProfileByAuthId error:", error.message, { authId });
    return null;
  }
  return data as profileWithUser | null;
}

// ---------------------------------------------------------------------------
// Fetch the profile of the currently logged-in user (or null if not logged in)
// ---------------------------------------------------------------------------
export async function getSessionProfile() {
  const sessionUser = await getSessionUser();
  return sessionUser?.profile ?? null;
}

// ---------------------------------------------------------------------------
// Server-side role permission helpers
// ---------------------------------------------------------------------------
export const requiresRole = (allowedRoles: string[]) => {
  return (_ctx: { user: { role: string } }) => allowedRoles.includes(_ctx.user.role);
};

export function hasRole(user: { role: string } | null, role: string) {
  if (!user) return false;
  return user.role === role;
}

// ---------------------------------------------------------------------------
// Role guards for route handlers
// ---------------------------------------------------------------------------
export function requiresBrand(ctx: { user: { role: string } }) {
  if (ctx.user.role !== "brand" && ctx.user.role !== "admin") {
    throw new Error("Brand access required");
  }
  return ctx;
}

export function requiresCreator(ctx: { user: { role: string } }) {
  if (ctx.user.role !== "creator" && ctx.user.role !== "admin") {
    throw new Error("Creator access required");
  }
  return ctx;
}

export function requiresAdmin(ctx: { user: { role: string } }) {
  if (ctx.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Admin check — strictly server-side
// ---------------------------------------------------------------------------
export async function currentUserIsAdmin() {
  const sessionUser = await getSessionUser();
  return sessionUser?.role === "admin";
}

export async function getAdminProfile() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  if (sessionUser.role !== "admin") return null;
  return sessionUser.profile;
}

// ---------------------------------------------------------------------------
// Role changes — only admins may change roles; the function refuses any
// client-requested role assignment to "admin".
// ---------------------------------------------------------------------------
export async function changeUserRole(
  authId: string,
  newRole: "creator" | "brand" | "admin",
  actorRole: string,
  reason: string
) {
  // Security: never allow a non-admin to grant the "admin" role.
  if (newRole === "admin" && actorRole !== "admin") {
    throw new Error("Only admins can grant admin roles.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("auth_id", authId);

  if (error) throw error;

  // Record an audit log entry.
  await supabase.from("audit_logs").insert({
    actor_id: null,
    actor_type: "system",
    action: `role_changed_to_${newRole}`,
    resource_type: "profiles",
    resource_id: authId,
    ip_address: null,
    user_agent: null,
    metadata_json: { actor_role: actorRole, reason, target_role: newRole },
  });

  return true;
}
