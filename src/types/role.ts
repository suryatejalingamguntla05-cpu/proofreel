/**
 * src/types/role.ts
 * ---------------------------------------------------------------------------
 * Platform user roles.
 *
 * These are the only roles the platform recognizes:
 *   - `creator`  : AI content creator (portfolios, quotes, collaborations)
 *   - `brand`    : business/agency buyer (briefs, invites, collaborations)
 *   - `admin`    : platform moderator (verification, reports, audit)
 *
 * IMPORTANT SECURITY NOTE: Roles are stored server-side in the `profiles`
 * table and read from the authenticated user's profile. The browser never
 * supplies a role, and a non-admin can NEVER grant the "admin" role.
 * Server-side enforcement is the source of truth.
 */

export type UserRole = "creator" | "brand" | "admin";

/** Ordered priority for canned role resolution (used in onboarding flows) */
export const ALL_ROLES: UserRole[] = ["creator", "brand"];

export function isUserRole(value: unknown): value is UserRole {
  return value === "creator" || value === "brand" || value === "admin";
}
