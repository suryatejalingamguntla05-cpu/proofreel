/**
 * src/lib/auth/permissions.ts
 * ---------------------------------------------------------------------------
 * Role → permission catalog used by server-side route guards.
 * The browser never receives or enforces these; they are server utilities.
 */

// ---------------------------------------------------------------------------
// Permission set per role
// ---------------------------------------------------------------------------
export const ROLE_PERMISSIONS = {
  creator: [
    "read_public_profiles",
    "read_own_profile",
    "edit_own_profile",
    "manage_own_portfolio",
    "submit_quote",
    "view_collaborations",
    "send_messages_to_collaborations",
    "upload_deliverables",
    "request_verification",
    "update_own_workflows",
    "manage_own_collaborations",
  ],
  brand: [
    "read_public_profiles",
    "read_own_profile",
    "edit_own_profile",
    "manage_own_briefs",
    "discover_creators",
    "save_creators",
    "send_invitations",
    "manage_own_collaborations",
    "view_messages",
    "upload_deliverables",
    "view_colab_documents",
  ],
  admin: [
    "manage_all_profiles",
    "manage_all_briefs",
    "manage_all_collaborations",
    "moderate_reports",
    "review_verification_requests",
    "view_all_audit_logs",
    "manage_users",
  ],
} as const;

export type Permission = (typeof ROLE_PERMISSIONS)["creator"][number]
  | (typeof ROLE_PERMISSIONS)["brand"][number]
  | (typeof ROLE_PERMISSIONS)["admin"][number];

export function hasPermission(role: string, permission: Permission): boolean {
  const catalog = ROLE_PERMISSIONS as Record<string, readonly string[]>;
  const allowed: readonly string[] = catalog[role] ?? [];
  return allowed.includes(permission);
}

// Convenience guards used by route handlers
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

export function isBrand(role: string | null | undefined): boolean {
  return role === "brand";
}

export function isCreator(role: string | null | undefined): boolean {
  return role === "creator";
}

// Registration/updating must never be able to self-assign "admin".
export const ASSIGNABLE_ROLES = ["creator", "brand"] as const;

export function safeRole(raw: unknown): "creator" | "brand" | "admin" {
  return raw === "brand" || raw === "admin" ? raw : "creator";
}
