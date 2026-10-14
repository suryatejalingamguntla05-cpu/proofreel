/**
 * src/lib/services/creator-service.ts
 * ---------------------------------------------------------------------------
 * Business logic for creators: profile, portfolio, tools, workflow, social,
 * metrics, verification requests, and proof passport scoring.
 *
 * All reads are *query-only*: the caller passes the authenticated user's
 * profile (or the requesting brand's profile) so authorization can be
 * enforced before touching the database.
 */

import { supabase } from "@/lib/supabase/client";
import type {
  creatorProfile,
  portfolioItem,
  creatorTool,
  creatorWorkflow,
  socialAccount,
  socialMetricSnapshot,
  verificationRequest,
  creatorDiscoveryRow,
} from "@/types/database";

// ---------------------------------------------------------------------------
// Profile CRUD
// ---------------------------------------------------------------------------
export async function listPublicCreatorProfiles() {
  const { data, error } = await supabase
    .from("creator_profiles")
    .select(
      `
      id,
      profile_id,
      portfolio_url,
      website_url,
      instagram_url,
      twitter_url,
      youtube_url,
      behance_url,
      art_form,
      specialty,
      experience_years,
      availability,
      hourly_rate_minor,
      min_project_size_minor,
      is_profile_verified,
      profiles (
        id, display_name, username, bio, location, languages, avatar_url, is_public, role
      )
    `
    )
    .eq("profiles.is_public", true)
    .eq("profiles.role", "creator")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as (creatorProfile & {
    profiles: { display_name: string; username: string; bio: string | null; location: string | null; avatar_url: string | null; is_public: boolean; role: "creator" };
  })[] | null;
}

export async function getCreatorProfileForPublicRead(profileId: string) {
  const { data, error } = await supabase
    .from("creator_profiles")
    .select(
      `
      id, profile_id, portfolio_url, availability, hourly_rate_minor,
      is_profile_verified,
      profiles (display_name, username, bio, location, languages, avatar_url)
    `
    )
    .eq("id", profileId)
    .eq("profiles.is_public", true)
    .single();
  if (error) throw error;
  return data as unknown as (creatorProfile & { profiles: { display_name: string; username: string; bio: string | null; location: string | null; avatar_url: string | null } }) | null;
}

export async function getCreatorProfileById(profileId: string, actorProfileId: string | null, actorRole: string | null) {
  // Authorization is enforced HERE, in code, before returning data. RLS is
  // enforced by the database as well; this is defense in depth.
  const { data, error } = await supabase
    .from("creator_profiles")
    .select(
      `
      id, profile_id, portfolio_url, website_url, instagram_url, twitter_url,
      youtube_url, behance_url, dribbble_url, artstation_url,
      art_form, specialty, experience_years, education, availability,
      hourly_rate_minor, min_project_size_minor, is_profile_verified,
      profiles (display_name, username, bio, location, languages, avatar_url, role, is_public)
    `
    )
    .eq("id", profileId)
    .single();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as (creatorProfile & {
    profiles: { display_name: string; username: string; bio: string | null; location: string | null; languages: string[]; avatar_url: string | null; role: string; is_public: boolean };
  });

  const isOwner = actorProfileId !== null && row.profile_id === actorProfileId;
  const isAdmin = actorRole === "admin";
  const isPublic = row.profiles?.is_public === true && row.profiles?.role === "creator";
  if (!isPublic && !isOwner && !isAdmin) {
    return null; // hidden from unauthorized callers — never throw which profile exists
  }
  return row;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------
export async function listPortfolioItems(
  creatorProfileId: string,
  includeNonPublic = false
): Promise<portfolioItem[]> {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as portfolioItem[];
  // Non-public items are only ever returned for owner/admin callers, which
  // enforce their identity upstream before passing includeNonPublic=true.
  return includeNonPublic ? rows : rows.filter((r) => r.is_public);
}

export async function getPortfolioItemById(itemId: string, actorProfileId: string | null) {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("id", itemId)
    .eq("creator_profile_id", actorProfileId) // shortcut for owner
    .maybeSingle();
  if (error) throw error;
  return data as portfolioItem | null;
}

export async function createPortfolioItem(input: {
  creatorProfileId: string;
  title: string;
  description: string;
  category: string;
  content_type: string;
  url: string | null;
  image_url: string | null;
  is_owned_by_creator: boolean;
  ownership_note: string | null;
}) {
  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      creator_profile_id: input.creatorProfileId,
      title: input.title,
      description: input.description,
      category: input.category,
      content_type: input.content_type,
      url: input.url,
      image_url: input.image_url,
      is_owned_by_creator: input.is_owned_by_creator,
      ownership_note: input.ownership_note,
      is_public: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as portfolioItem;
}

export async function updatePortfolioItem(
  itemId: string,
  updates: Partial<Omit<portfolioItem, "id" | "created_at" | "updated_at">>,
  actorProfileId: string
) {
  const { data, error } = await supabase
    .from("portfolio_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("creator_profile_id", actorProfileId)
    .select()
    .single();
  if (error) throw error;
  return data as portfolioItem;
}

// ---------------------------------------------------------------------------
// Tools & workflow
// ---------------------------------------------------------------------------
export async function listTools(creatorProfileId: string): Promise<creatorTool[]> {
  const { data, error } = await supabase
    .from("creator_tools")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("workflow_step");
  if (error) throw error;
  return data as creatorTool[];
}

export async function createTool(input: { creatorProfileId: string; tool_name: string; tool_description: string; workflow_step: string }) {
  const { data, error } = await supabase
    .from("creator_tools")
    .insert({
      creator_profile_id: input.creatorProfileId,
      tool_name: input.tool_name,
      tool_description: input.tool_description,
      workflow_step: input.workflow_step,
    })
    .select()
    .single();
  if (error) throw error;
  return data as creatorTool;
}

export async function listWorkflow(creatorProfileId: string): Promise<creatorWorkflow[]> {
  const { data, error } = await supabase
    .from("creator_workflow")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("step_order");
  if (error) throw error;
  return data as creatorWorkflow[];
}

export async function createWorkflow(input: { creatorProfileId: string; title: string; description: string; step_order: number; is_public: boolean }) {
  const { data, error } = await supabase
    .from("creator_workflow")
    .insert({
      creator_profile_id: input.creatorProfileId,
      title: input.title,
      description: input.description,
      step_order: input.step_order,
      is_public: input.is_public,
    })
    .select()
    .single();
  if (error) throw error;
  return data as creatorWorkflow;
}

// ---------------------------------------------------------------------------
// Social accounts & metrics
// ---------------------------------------------------------------------------
export async function listSocialAccounts(creatorProfileId: string): Promise<socialAccount[]> {
  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("created_at");
  if (error) throw error;
  return data as socialAccount[];
}

export async function upsertSocialAccount(input: {
  creatorProfileId: string;
  platform: string;
  platform_user_id: string;
  handle: string | null;
  display_name: string | null;
  profile_url: string | null;
  data_source: "manual" | "imported" | "user_submitted";
  is_connected: boolean;
  last_synced_at: string | null;
}) {
  const { data, error } = await supabase
    .from("social_accounts")
    .upsert({
      creator_profile_id: input.creatorProfileId,
      platform: input.platform,
      platform_user_id: input.platform_user_id,
      handle: input.handle,
      display_name: input.display_name,
      profile_url: input.profile_url,
      data_source: input.data_source,
      is_connected: input.is_connected,
      last_synced_at: input.last_synced_at,
    })
    .select()
    .single();
  if (error) throw error;
  return data as socialAccount;
}

export async function listSocialMetrics(creatorProfileId: string): Promise<socialMetricSnapshot[]> {
  const { data, error } = await supabase
    .from("social_metric_snapshots")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return data as socialMetricSnapshot[];
}

// ---------------------------------------------------------------------------
// Verification requests
// ---------------------------------------------------------------------------
export async function listVerificationRequests(creatorProfileId: string): Promise<verificationRequest[]> {
  const { data, error } = await supabase
    .from("creator_verification_requests")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as verificationRequest[];
}

export async function createVerificationRequest(input: {
  creatorProfileId: string;
  profileId: string;
  evidence_urls: string[];
  evidence_note: string;
}) {
  const { data, error } = await supabase
    .from("creator_verification_requests")
    .insert({
      profile_id: input.profileId,
      creator_profile_id: input.creatorProfileId,
      evidence_urls: input.evidence_urls,
      evidence_note: input.evidence_note,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data as verificationRequest;
}

export async function updateVerificationRequest(
  requestId: string,
  updates: Partial<verificationRequest>,
  reviewerRole: string
) {
  // Security: only admins can review verification requests
  if (reviewerRole !== "admin") {
    throw new Error("Only admins can review verification requests.");
  }
  const { data, error } = await supabase
    .from("creator_verification_requests")
    .update({
      ...updates,
      reviewed_by: reviewerRole,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();
  if (error) throw error;
  return data as verificationRequest;
}

// ---------------------------------------------------------------------------
// Onboarding / proof passport score
// ---------------------------------------------------------------------------
export function computeProofPassportScore(
  creator: Partial<creatorProfile> & { bio?: string | null; location?: string | null },
  stats: Partial<{
  portfolioCount: number;
  toolsCount: number;
  workflowCount: number;
  socialAccounts: number;
  metricSnapshots: number;
  socialMetricsLatest: number;
}>) {
  const portfolioCount = stats?.portfolioCount ?? 0;
  const toolsCount = stats?.toolsCount ?? 0;
  const workflowCount = stats?.workflowCount ?? 0;
  const socialAccounts = stats?.socialAccounts ?? 0;
  const metricSnapshots = stats?.metricSnapshots ?? 0;
  const socialMetricsLatest = stats?.socialMetricsLatest ?? 0;

  // Weighted score (max 100) with per-factor clarity.
  const score = (
    ((portfolioCount > 0 ? 1 : 0) + (toolsCount > 0 ? 1 : 0) + (workflowCount > 0 ? 1 : 0)) / 3 * 40 +
    (socialAccounts > 0 ? 1 : 0) * 20 +
    (metricSnapshots > 0 && socialMetricsLatest > 0 ? 1 : 0) * 15 +
    (creator.is_profile_verified ? 1 : 0) * 15 +
    (creator.availability ? 1 : 0) * 10
  );

  // Maturity classification
  const maturity = score >= 80 ? "complete"
    : score >= 60 ? "near-complete"
    : score >= 40 ? "developing"
    : "empty";

  return {
    score: Math.round(Math.min(score, 100)),
    maturity,
    factors: {
      profile_completeness: creator.bio && creator.location ? "strong" : creator.bio ? "partial" : "empty",
      portfolio_completeness: portfolioCount > 3 ? "strong" : portfolioCount >= 1 ? "partial" : "empty",
      tools_documented: toolsCount > 0 ? "strong" : "empty",
      workflow_documented: workflowCount > 0 ? "strong" : "empty",
      social_connected: socialAccounts > 0 ? "strong" : "empty",
      metrics_evidence: metricSnapshots > 0 ? "strong" : "empty",
      verification_status: creator.is_profile_verified ? "reviewed" : "pending",
    },
  };
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------
export async function searchCreators(params: {
  query: string;
  skills: string[];
  contentTypes: string[];
  tools: string[];
  budgetMin: number;
  budgetMax: number;
  languages: string[];
  availability: string | null;
  minPortfolioItems: number;
  page: number;
  limit: number;
}) {
  const { query, skills, contentTypes, tools, budgetMin, budgetMax, languages, availability, minPortfolioItems, page = 1, limit = 12 } = params;

  // Build filters step by step, reusing already-built selects/conditions.
  const filters: (string | undefined)[] = [];
  const filterValues: (string | string[])[] = [];

  if (query) {
    filters.push(
      `creator_profiles.display_name ILIKE ${`'${query}%'`} OR creator_profiles.bio ILIKE ${`'${query}%'`} OR creator_profiles.username ILIKE ${`'${query}%'`}`
    );
  }

  if (skills?.length) {
    // PostgreSQL ANY() syntax; each skill is a literal string
    const placeholders = skills.map(() => "?").join(",");
    filters.push(`creator_profiles.art_form && ${'ARRAY[' + placeholders + ']'}`);
    filterValues.push(...skills);
  }

  if (contentTypes?.length) {
    const placeholders = contentTypes.map(() => "?").join(",");
    filters.push(`portfolio_items.category && ${'ARRAY[' + placeholders + ']'}`);
    filterValues.push(...contentTypes);
  }

  if (tools?.length) {
    const placeholders = tools.map(() => "?").join(",");
    filters.push(`creator_profiles.art_form && ${'ARRAY[' + placeholders + ']'}`);
    filterValues.push(...tools);
  }

  if (budgetMin !== undefined && budgetMax !== undefined) {
    filters.push(`creator_profiles.hourly_rate_minor >= ${budgetMin} AND creator_profiles.hourly_rate_minor <= ${budgetMax}`);
  }

  if (languages?.length) {
    const placeholders = languages.map(() => "?").join(",");
    filters.push(`creator_profiles.languages && ${'ARRAY[' + placeholders + ']'}`);
    filterValues.push(...languages);
  }

  if (availability) {
    // Availability is free text; match on keyword
    filters.push(`creator_profiles.availability ILIKE ${`'%${availability}%'`}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  const { data, error } = await supabase.rpc(
    "search_creators_with_pagination",
    {
      p_where: whereClause,
      p_skills: skills ?? null,
      p_content_types: contentTypes ?? null,
      p_budget_min: budgetMin ?? null,
      p_budget_max: budgetMax ?? null,
      p_languages: languages ?? null,
      p_availability: availability ?? null,
      p_min_portfolio: minPortfolioItems ?? 0,
      p_offset: offset,
      p_limit: limit,
    }
  );
  // Fallback: if the RPC isn't defined, fetch manually and paginate in JS
  if (error && error.code === "PGRST_NOT_IMPLEMENTED") {
    const { data: all, error: allErr } = await supabase
      .from("creator_profiles")
      .select(
        `
        id, profile_id, portfolio_url, availability, hourly_rate_minor, min_project_size_minor,
        is_profile_verified,
        profiles (display_name, username, bio, location, languages, avatar_url)
      `
      )
      .eq("profiles.is_public", true)
      .eq("profiles.role", "creator");
    if (allErr) throw allErr;
    const rows = all as unknown as (creatorProfile & {
      profiles: { display_name: string; username: string; bio: string | null; location: string | null; languages: string[]; avatar_url: string | null };
    })[];
    let filtered = rows.filter((r) => {
      if (query && !r.profiles.display_name.toLowerCase().startsWith(query.toLowerCase()) && !r.profiles.username.toLowerCase().startsWith(query.toLowerCase())) return false;
      if (availability && !(!r.availability || !r.availability.toLowerCase().includes(availability.toLowerCase()))) return false;
      return true;
    });
    if (skills?.length) filtered = filtered.filter((r) => (r.art_form ?? []).some((s: string) => skills.includes(s)));
    if (languages?.length) filtered = filtered.filter((r) => (r.profiles.languages ?? []).some((l: string) => languages.includes(l)));
    const total = filtered.length;
    filtered = filtered.slice(offset, offset + limit);
    const stats = await countPublicCreators();
    return { rows: filtered, total, page, limit, totalPages: Math.ceil(total / limit), stats };
  }

  if (error) throw error;
  const rows = data as creatorDiscoveryRow[] | null;
  const stats = await countPublicCreators();
  return { rows: rows ?? [], total: 0, page, limit, totalPages: 1, stats };
}

export async function countPublicCreators() {
  const { count, error } = await supabase
    .from("creator_profiles")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", "profiles.id")
    .eq("profiles.is_public", true)
    .eq("profiles.role", "creator");
  if (error) throw error;
  return count ?? 0;
}
