// ---------------------------------------------------------------------------
// Proofreel — shared database types
// These mirror the `public` schema in Supabase.
// ---------------------------------------------------------------------------

import type { UserRole } from "./role";

// ---------------------------------------------------------------------------
// Core identity
// ---------------------------------------------------------------------------
export type profile = {
  id: string;
  auth_id: string;
  display_name: string;
  username: string;
  bio: string | null;
  location: string | null;
  languages: string[];
  avatar_url: string | null;
  is_onboarding_complete: boolean;
  role: UserRole;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type profileWithUser = profile & {
  user: {
    id: string;
    email: string | null;
    user_metadata: Record<string, unknown> | null;
    app_metadata: Record<string, unknown> | null;
    role: string | null;
  } | null;
};

// ---------------------------------------------------------------------------
// Creator profiles
// ---------------------------------------------------------------------------
export type creatorProfile = {
  id: string;
  profile_id: string;
  portfolio_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  behance_url: string | null;
  dribbble_url: string | null;
  artstation_url: string | null;
  art_form: string[];
  specialty: string | null;
  experience_years: number | null;
  education: string | null;
  availability: string | null;
  hourly_rate_minor: number;
  min_project_size_minor: number;
  is_profile_verified: boolean;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Brand profiles
// ---------------------------------------------------------------------------
export type brandProfile = {
  id: string;
  profile_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  brand_aesthetic: string | null;
  typical_campaigns: string[] | null;
  is_brand_verified: boolean;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------
export type portfolioItem = {
  id: string;
  creator_profile_id: string;
  title: string;
  description: string | null;
  category: string;
  content_type: string;
  url: string | null;
  image_url: string | null;
  is_public: boolean;
  is_owned_by_creator: boolean;
  ownership_note: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Tools & workflow
// ---------------------------------------------------------------------------
export type creatorTool = {
  id: string;
  creator_profile_id: string;
  tool_name: string;
  tool_description: string | null;
  workflow_step: string;
  created_at: string;
  updated_at: string;
};

export type creatorWorkflow = {
  id: string;
  creator_profile_id: string;
  title: string;
  description: string | null;
  step_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Social
// ---------------------------------------------------------------------------
export type socialAccount = {
  id: string;
  creator_profile_id: string;
  platform: string;
  platform_user_id: string;
  handle: string | null;
  display_name: string | null;
  profile_url: string | null;
  data_source: string;
  is_connected: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type socialMetricSnapshot = {
  id: string;
  creator_profile_id: string;
  platform: string;
  platform_account: string;
  metric_name: string;
  value: number;
  unit: string;
  source_type: string;
  source_ref: string | null;
  captured_at: string;
  is_latest: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------
export type verificationRequest = {
  id: string;
  creator_profile_id: string;
  profile_id: string;
  evidence_urls: string[];
  evidence_note: string | null;
  status: "pending" | "under_review" | "reviewed" | "rejected";
  reviewed_by: string | null;
  decision_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Briefs
// ---------------------------------------------------------------------------
export type brief = {
  id: string;
  creator_profile_id: string | null;
  brand_profile_id: string;
  title: string;
  objective: string;
  target_audience: string | null;
  style: string | null;
  content_type: string;
  deliverables_count: number;
  platforms: string[];
  aspect_ratios: string[];
  total_budget_minor: number;
  deadline_at: string;
  license_notes: string | null;
  revision_count: number;
  preferred_tools: string[];
  usage_rights: string[];
  status: "draft" | "published" | "archived" | "closed";
  expected_handoff: string | null;
  generated_by_ai: boolean;
  ai_model_used: string | null;
  ai_prompt_record: string | null;
  created_at: string;
  updated_at: string;
};

export type briefSkill = {
  id: string;
  brief_id: string;
  skill: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Collaborations
// ---------------------------------------------------------------------------
export type collaborationRequest = {
  id: string;
  brand_profile_id: string;
  creator_profile_id: string;
  brief_id: string;
  message_text: string;
  quote_minor: number | null;
  status:
    | "draft"
    | "invited"
    | "in_progress"
    | "on_hold"
    | "delivering"
    | "completed"
    | "archived";
  created_at: string;
  updated_at: string;
};

export type quote = {
  id: string;
  collaboration_id: string;
  creator_profile_id: string;
  brand_profile_id: string;
  amount_minor: number;
  currency: string;
  timeline_days: number | null;
  revision_count: number;
  package_description: string | null;
  licensing_notes: string | null;
  revision_policy: string | null;
  acceptance_notes: string | null;
  status: "draft" | "submitted" | "accepted" | "declined" | "expired";
  submitted_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type agreement = {
  id: string;
  collaboration_id: string;
  creator_profile_id: string;
  brand_profile_id: string;
  agreed_terms: Record<string, unknown>;
  license_terms: string | null;
  payment_terms: string | null;
  acceptance_record: string | null;
  status: "draft" | "signed" | "accepted" | "declined" | "expired";
  accepted_by: UserRole | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type milestone = {
  id: string;
  collaboration_id: string;
  collaboration_request_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  order_num: number;
  status: "todo" | "in_progress" | "in_review" | "done" | "blocked";
  completed_by: UserRole | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type deliverable = {
  id: string;
  collaboration_id: string;
  milestone_id: string;
  title: string;
  file_url: string | null;
  file_meta_json: Record<string, unknown> | null;
  file_type: string | null;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  format: string | null;
  aspect_ratio: string | null;
  status: "todo" | "submitted" | "in_revision" | "approved" | "rejected" | "completed";
  submitted_by: UserRole | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type revision = {
  id: string;
  deliverable_id: string;
  creator_profile_id: string;
  brand_profile_id: string;
  content: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Conversations / messages
// ---------------------------------------------------------------------------
export type conversation = {
  id: string;
  participant_a_id: string;
  participant_b_id: string;
  topic: string;
  created_at: string;
  updated_at: string;
};

export type conversationMember = {
  id: string;
  conversation_id: string;
  profile_id: string;
  joined_at: string;
};

export type message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Notifications, reports, audit
// ---------------------------------------------------------------------------
export type notification = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  payload_json: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type report = {
  id: string;
  reporter_id: string | null;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type auditLog = {
  id: string;
  actor_id: string | null;
  actor_type: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Aggregate view helpers (used by services)
// ---------------------------------------------------------------------------
export type creatorDiscoveryRow = {
  creator_profile_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  location: string | null;
  languages: string[];
  portfolio_items_public: number;
  portfolio_items_total: number;
  hourly_rate_minor: number;
  min_project_size_minor: number;
  verification_status: string | null;
  bio: string | null;
  availability: string | null;
};

export type brandDiscoveryRow = {
  brand_profile_id: string;
  company_name: string;
  website_url: string | null;
  industry: string | null;
  brand_aesthetic: string | null;
  typical_campaigns: string[] | null;
  is_brand_verified: boolean;
};
