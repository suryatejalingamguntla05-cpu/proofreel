/**
 * src/lib/constants.ts
 * ---------------------------------------------------------------------------
 * Central source of truth for the platform's content/inventory.
 *
 * Changing these values does NOT require code changes elsewhere; they are
 * the single place UI code, validation schemas, and database defaults should
 * reference.
 */

// ---------------------------------------------------------------------------
// User roles
// ---------------------------------------------------------------------------
export const ROLES = ["creator", "brand"] as const;
export type Role = (typeof ROLES)[number];

// ---------------------------------------------------------------------------
// User role labels (display)
// ---------------------------------------------------------------------------
export const ROLE_LABELS: Record<Role, string> = {
  creator: "Creator",
  brand: "Brand / Agency",
};

// ---------------------------------------------------------------------------
// Role colors (includes admin for moderation UI surfaces)
// ---------------------------------------------------------------------------
export const ROLE_COLORS: Record<Role | "admin", { text: string; bg: string; ring: string }> = {
  creator: { text: "text-violet-600", bg: "bg-violet-100", ring: "ring-violet-500" },
  brand: { text: "text-blue-600", bg: "bg-blue-100", ring: "ring-blue-500" },
  admin: { text: "text-rose-600", bg: "bg-rose-100", ring: "ring-rose-500" },
};

// ---------------------------------------------------------------------------
// Brief content types
// ---------------------------------------------------------------------------
export const CONTENT_TYPES = ["motion", "still", "3d", "ui", "audio", "writing"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Brief platforms
// ---------------------------------------------------------------------------
export const PLATFORMS = ["youtube", "instagram", "facebook", "tiktok", "linkedin", "twitter", "web", "app_store"] as const;
export type Platform = (typeof PLATFORMS)[number];

// ---------------------------------------------------------------------------
// Brief aspect ratios
// ---------------------------------------------------------------------------
export const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:5", "21:9"] as const;

// ---------------------------------------------------------------------------
// Brief usage rights
// ---------------------------------------------------------------------------
export const USAGE_RIGHTS = ["social", "paid_ads", "website", "streaming", "merch", "theatrical", "app_store", "portfolio"] as const;
export type UsageRight = (typeof USAGE_RIGHTS)[number];

// ---------------------------------------------------------------------------
// Platform currencies (price display; all MVP prices are in INR minor units)
// ---------------------------------------------------------------------------
export const CURRENCIES = ["INR"] as const;
export type Currency = (typeof CURRENCIES)[number];

// ---------------------------------------------------------------------------
// Verification statuses
// ---------------------------------------------------------------------------
export const VERIFICATION_STATUSES = ["pending", "under_review", "reviewed", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Collaboration statuses
// ---------------------------------------------------------------------------
export const COLLABORATION_STATUSES = ["draft", "invited", "in_progress", "on_hold", "delivering", "completed", "archived"] as const;
export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Quote statuses
// ---------------------------------------------------------------------------
export const QUOTE_STATUSES = ["draft", "submitted", "accepted", "declined", "expired"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Milestone statuses
// ---------------------------------------------------------------------------
export const MILESTONE_STATUSES = ["todo", "in_progress", "in_review", "done", "blocked"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Deliverable statuses
// ---------------------------------------------------------------------------
export const DELIVERABLE_STATUSES = ["todo", "submitted", "in_revision", "approved", "rejected", "completed"] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Revision statuses
// ---------------------------------------------------------------------------
export const REVISION_STATUSES = ["pending", "approved", "rejected"] as const;
export type RevisionStatus = (typeof REVISION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Category labels for portfolio items
// ---------------------------------------------------------------------------
export const PORTFOLIO_CATEGORIES = ["motion", "still", "3d", "ui", "audio", "writing"] as const;

// ---------------------------------------------------------------------------
// Social platforms (for connectors / metrics)
// ---------------------------------------------------------------------------
export const SOCIAL_PLATFORMS = ["youtube", "instagram", "facebook", "tiktok", "twitter", "linkedin"] as const;

// ---------------------------------------------------------------------------
// Language codes (display + search)
// ---------------------------------------------------------------------------
export const LANGUAGES = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "pa", "or", "ur", "it", "fr", "de", "es", "zh", "ja", "ko"] as const;

// ---------------------------------------------------------------------------
// Generic UI parity / spacing tokens
// ---------------------------------------------------------------------------
export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
};

export const DEFAULT_LIMIT = 12;
export const OVERVIEW_LIMIT = 20;
export const CONCISE_LIMIT = 6;
