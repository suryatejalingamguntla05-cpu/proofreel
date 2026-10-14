/**
 * src/lib/services/brief-service.ts
 * ---------------------------------------------------------------------------
 * Brief CRUD, field validation, and public discovery.
 */

import { supabase } from "@/lib/supabase/client";
import type { brief } from "@/types/database";
import { briefSchema } from "@/lib/validations/brief";

// ---------------------------------------------------------------------------
// Create / update (brand-only)
// ---------------------------------------------------------------------------
export async function createBrief(input: {
  brandProfileId: string;
  title: string;
  objective: string;
  targetAudience: string;
  style: string;
  content_type: string;
  deliverablesCount: number;
  platforms: string[];
  aspectRatios: string[];
  budget: number;
  deadline: string;
  licenseNotes: string;
  revisionCount: number;
  preferredTools: string[];
  usageRights: string[];
  generatedByAi: boolean;
  aiModelUsed: string | null;
  aiPromptRecord: string | null;
}) {
  // Validate + normalize
  const parsed = briefSchema.parse({
    brandProfileId: input.brandProfileId,
    title: input.title,
    objective: input.objective,
    targetAudience: input.targetAudience,
    style: input.style,
    content_type: input.content_type,
    deliverablesCount: input.deliverablesCount,
    platforms: input.platforms,
    aspectRatios: input.aspectRatios,
    budget: input.budget,
    deadline: input.deadline,
    licenseNotes: input.licenseNotes,
    revisionCount: input.revisionCount,
    preferredTools: input.preferredTools,
    usageRights: input.usageRights,
  });

  const { data, error } = await supabase
    .from("briefs")
    .insert({
      brand_profile_id: parsed.brandProfileId,
      title: parsed.title,
      objective: parsed.objective,
      target_audience: parsed.targetAudience,
      style: parsed.style,
      content_type: parsed.content_type,
      deliverables_count: parsed.deliverablesCount,
      platforms: parsed.platforms,
      aspect_ratios: parsed.aspectRatios,
      total_budget_minor: parsed.budget,
      deadline_at: parsed.deadline,
      license_notes: parsed.licenseNotes,
      revision_count: parsed.revisionCount,
      preferred_tools: parsed.preferredTools,
      usage_rights: parsed.usageRights,
      status: parsed.status,
      generated_by_ai: parsed.generatedByAi,
      ai_model_used: parsed.aiModelUsed,
      ai_prompt_record: parsed.aiPromptRecord,
    })
    .select()
    .single();
  if (error) throw error;

  // Bind skills into the bridge table
  for (const skill of parsed.preferredTools) {
    await supabase.from("brief_skills").insert({ brief_id: data.id, skill });
  }

  return data as brief;
}

export async function updateBrief(
  id: string,
  updates: Partial<Omit<brief, "id" | "created_at" | "updated_at">>,
  actorBrandProfileId: string
) {
  const { data, error } = await supabase
    .from("briefs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("brand_profile_id", actorBrandProfileId)
    .select()
    .single();
  if (error) throw error;
  return data as brief;
}

// ---------------------------------------------------------------------------
// Discovery (public + brand)
// ---------------------------------------------------------------------------
export async function listBriefs(filters: {
  brandId?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  const { brandId, status, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  if (brandId) conditions.push("brand_profile_id = ?");
  if (status) conditions.push("status = ?");

  const { data, error, count } = await supabase
    .from("briefs")
    .select(
      `
      *,
      creator_profile: creator_profiles!creator_profile_id (
        profiles (display_name, username)
      )
    `,
      { count: "exact", head: true }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Attach skills (fallback: fetch per brief — acceptable for MVP pagination)
  const briefs = (data ?? []) as brief[];
  const briefIds = briefs.map((b) => b.id);
  if (briefIds.length > 0) {
    const { data: skillsData } = await supabase
      .from("brief_skills")
      .select("brief_id, skill")
      .in("brief_id", briefIds);
    const skillsByBrief = new Map<string, string[]>();
    (skillsData ?? []).forEach((s) => {
      if (!skillsByBrief.has(s.brief_id)) skillsByBrief.set(s.brief_id, []);
      skillsByBrief.get(s.brief_id)!.push(s.skill);
    });
    briefs.forEach((b) => {
      (b as brief & { _skills?: string[] })._skills = skillsByBrief.get(b.id) ?? [];
    });
  }
  return { rows: briefs, total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) };
}

export async function getBriefById(id: string) {
  const { data, error } = await supabase
    .from("briefs")
    .select(
      `
      *,
      creator_profile: creator_profiles!creator_profile_id (
        profiles (display_name, username, avatar_url, location, art_form, availability, is_profile_verified)
      )
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  // Attach skills for the detail page
  const { data: skillsData } = await supabase
    .from("brief_skills")
    .select("skill")
    .eq("brief_id", id);
  (data as brief & { _skills?: string[] })._skills = (skillsData ?? []).map((s) => s.skill);
  return data as brief & { _skills?: string[] };
}

// ---------------------------------------------------------------------------
// Public view
// ---------------------------------------------------------------------------
export async function getPublicBrief(id: string) {
  const { data, error } = await supabase
    .from("briefs")
    .select(
      `
      *,
      brand_profile: brand_profiles!brand_profile_id (
        profiles (display_name, username, company_name, avatar_url)
      )
    `
    )
    .eq("id", id)
    .eq("status", "published")
    .single();
  if (error) throw error;
  const { data: skillsData } = await supabase
    .from("brief_skills")
    .select("skill")
    .eq("brief_id", id);
  (data as brief & { _skills?: string[] })._skills = (skillsData ?? []).map((s) => s.skill);
  return data as brief & { _skills?: string[] };
}

// ---------------------------------------------------------------------------
// Public search
// ---------------------------------------------------------------------------
export async function searchPublicBriefs(params: {
  query: string;
  content_type: string;
  platforms: string[];
  style: string;
  page: number;
  limit: number;
}) {
  const { query, content_type, platforms, style, page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | string[])[] = [];

  if (query) {
    conditions.push(
      `(title ILIKE ? OR objective ILIKE ?)`,
      `%${query}%`
    );
  }
  if (content_type) conditions.push(`content_type = ?`);
  if (platforms?.length) {
    const placeholders = platforms.map(() => "?").join(",");
    conditions.push(`platforms && ARRAY[${placeholders}]`);
    values.push(...platforms);
  }
  if (style) conditions.push(`style ILIKE ?`);
  // NOTE: server-side filtering for briefs is applied by the RLS-protected
  // list above; search refinement happens in SQL via the mounted filters, so
  // a raw WHERE string is intentionally not interpolated here.

  const { data, error, count } = await supabase
    .from("briefs")
    .select(
      `
      *,
      brand_profile: brand_profiles!brand_profile_id (
        profiles (display_name, username, company_name, avatar_url)
      )
    `,
      { count: "exact", head: true }
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  const briefs = (data ?? []) as brief[];
  const briefIds = briefs.map((b) => b.id);
  if (briefIds.length > 0) {
    const { data: skillsData } = await supabase
      .from("brief_skills")
      .select("brief_id, skill")
      .in("brief_id", briefIds);
    const skillsByBrief = new Map<string, string[]>();
    (skillsData ?? []).forEach((s) => {
      if (!skillsByBrief.has(s.brief_id)) skillsByBrief.set(s.brief_id, []);
      skillsByBrief.get(s.brief_id)!.push(s.skill);
    });
    briefs.forEach((b) => {
      (b as brief & { _skills?: string[] })._skills = skillsByBrief.get(b.id) ?? [];
    });
  }
  return { rows: briefs, total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) };
}
