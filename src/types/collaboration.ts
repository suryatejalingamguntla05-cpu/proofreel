// ---------------------------------------------------------------------------
// Collaboration request states
// ---------------------------------------------------------------------------
export type CollaborationStatus =
  | "draft"
  | "invited"
  | "in_progress"
  | "on_hold"
  | "delivering"
  | "completed"
  | "archived";

// ---------------------------------------------------------------------------
// Quote states
// ---------------------------------------------------------------------------
export type QuoteStatus = "draft" | "submitted" | "accepted" | "declined" | "expired";

// ---------------------------------------------------------------------------
// Agreement states (not legally binding — see SECURITY.md and agreements table)
// ---------------------------------------------------------------------------
export type AgreementStatus = "draft" | "signed" | "accepted" | "declined" | "expired";

// ---------------------------------------------------------------------------
// Milestone states
// ---------------------------------------------------------------------------
export type MilestoneStatus = "todo" | "in_progress" | "in_review" | "done" | "blocked";

// ---------------------------------------------------------------------------
// Deliverable states
// ---------------------------------------------------------------------------
export type DeliverableStatus =
  | "todo"
  | "submitted"
  | "in_revision"
  | "approved"
  | "rejected"
  | "completed";

// ---------------------------------------------------------------------------
// Revision states
// ---------------------------------------------------------------------------
export type RevisionStatus = "pending" | "approved" | "rejected";

// ---------------------------------------------------------------------------
// File submission constraints
// ---------------------------------------------------------------------------
export interface DeliverableConstraints {
  file_types: string[];
  max_file_size_bytes: number;
  required_due_date: string | null;
  min_format_count: number;
  required_aspect_ratios: string[];
  required_dimensions: { minWidth: number; minHeight: number } | null;
}

export interface CollaborationData {
  collaboration_id: string;
  brand_profile_id: string;
  creator_profile_id: string;
  status: CollaborationStatus;
  quote: { id: string; amount_minor: number; status: QuoteStatus } | null;
  agreement: { id: string; status: AgreementStatus } | null;
  latest_milestone: { id: string; title: string; status: MilestoneStatus } | null;
  latest_deliverable: { id: string; title: string; status: DeliverableStatus } | null;
}
