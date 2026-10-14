import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { computeFitScore, type CreatorScoringContext, FIT_REPORT_DISCLAIMER } from "@/lib/services/matching-service";
import type { brief, creatorProfile, portfolioItem, creatorTool } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/env";
import { DEMO_CREATORS } from "@/lib/demo/database";

/**
 * GET /api/creators — public discovery (server-side filtering, pagination).
 * Anonymous-safe: reads only public creator rows (RLS also enforces).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const contentType = searchParams.get("content_type") ?? "";
    const maxBudgetRaw = searchParams.get("max_budget");
    const minBudgetRaw = searchParams.get("min_budget");
    const language = searchParams.get("language") ?? "";
    const availability = searchParams.get("availability")?.trim().toLowerCase() ?? "";
    const requestedPage = Number(searchParams.get("page") ?? "1");
    const requestedLimit = Number(searchParams.get("limit") ?? "12");
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
    const limit = Number.isFinite(requestedLimit) ? Math.min(24, Math.max(1, Math.floor(requestedLimit))) : 12;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (!isSupabaseConfigured()) {
      const cleanBudget = (raw: string | null) => {
        const value = Number(raw);
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
      };
      const minBudget = cleanBudget(minBudgetRaw);
      const maxBudget = cleanBudget(maxBudgetRaw);
      const filtered = DEMO_CREATORS.filter((creator) => {
        const searchable = `${creator.profiles.display_name} ${creator.profiles.username} ${creator.profiles.bio ?? ""}`.toLowerCase();
        return (!q || searchable.includes(q.toLowerCase()))
          && (!contentType || creator.art_form.includes(contentType))
          && (!language || creator.profiles.languages.includes(language))
          && (!availability || (creator.availability ?? "").toLowerCase().includes(availability))
          && (minBudget === null || creator.hourly_rate_minor >= minBudget)
          && (maxBudget === null || creator.hourly_rate_minor <= maxBudget);
      });
      const creators = filtered.slice(from, from + limit).map((creator) => ({
        creator_profile_id: creator.id,
        display_name: creator.profiles.display_name,
        username: creator.profiles.username,
        bio: creator.profiles.bio,
        location: creator.profiles.location,
        languages: creator.profiles.languages,
        avatar_url: creator.profiles.avatar_url,
        hourly_rate_minor: creator.hourly_rate_minor,
        min_project_size_minor: creator.min_project_size_minor,
        availability: creator.availability,
        verification_status: creator.is_profile_verified ? "Reviewed" : "Pending review",
      }));

      return NextResponse.json({
        creators,
        pagination: { page, limit, total: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / limit)) },
        filtersApplied: { q, contentType, minBudget, maxBudget, language, availability },
        usingDemo: true,
      });
    }

    let query = supabase
      .from("creator_profiles")
      .select(
        `
        id, profile_id, availability, hourly_rate_minor, min_project_size_minor,
        art_form, is_profile_verified,
        profiles!inner (display_name, username, bio, location, languages, avatar_url, is_public, role)
      `,
        { count: "exact" }
      )
      .eq("profiles.is_public", true)
      .eq("profiles.role", "creator")
      .order("created_at", { ascending: false })
      .range(from, to);

    // Text search against display_name/bio/username (server-side).
    if (q) {
      query = query.or(`profiles.display_name.ilike.%${q}%,profiles.bio.ilike.%${q}%,profiles.username.ilike.%${q}%`);
    }
    if (language) {
      query = query.contains("profiles.languages", [language]);
    }
    const cleanBudget = (raw: string | null) => {
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    };
    const minBudget = cleanBudget(minBudgetRaw);
    const maxBudget = cleanBudget(maxBudgetRaw);
    if (minBudget !== null) query = query.gte("hourly_rate_minor", minBudget);
    if (maxBudget !== null) query = query.lte("hourly_rate_minor", maxBudget);

    const { data, error, count } = await query;
    if (error) throw error;

    let rows = (data ?? []) as unknown as Array<creatorProfile & {
      profiles: { display_name: string; username: string; bio: string | null; location: string | null; languages: string[]; avatar_url: string | null; is_public: boolean; role: string };
    }>;

    // Content-type filter uses portfolio categories (via a second query only
    // when the filter is requested) — kept simple and honest for MVP scale.
    if (contentType) {
      const { data: matching } = await supabase
        .from("portfolio_items")
        .select("creator_profile_id, category")
        .eq("is_public", true)
        .eq("category", contentType);
      const matchingIds = new Set(((matching ?? []) as unknown as Array<{ creator_profile_id: string }>).map((m) => m.creator_profile_id));
      rows = rows.filter((r) => matchingIds.has(r.id));
    }
    if (availability) {
      rows = rows.filter((r) => (r.availability ?? "").toLowerCase().includes(availability));
    }

    const total = typeof count === "number" ? count : rows.length;

    return NextResponse.json({
      creators: rows.map((r) => ({
        creator_profile_id: r.id,
        display_name: r.profiles.display_name,
        username: r.profiles.username,
        bio: r.profiles.bio,
        location: r.profiles.location,
        languages: r.profiles.languages,
        avatar_url: r.profiles.avatar_url,
        hourly_rate_minor: r.hourly_rate_minor,
        min_project_size_minor: r.min_project_size_minor,
        availability: r.availability,
        verification_status: r.is_profile_verified ? "Reviewed" : "Pending review",
      })),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      filtersApplied: { q, contentType, minBudget, maxBudget, language, availability },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch creators";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/creators — Creative Fit Report for one brief × one creator.
 * Requires an authenticated brand.
 */
const fitBodySchema = z.object({
  briefId: z.string().uuid(),
  creatorId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Creative Fit Reports require a configured database and authenticated brand account." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = fitBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData } = await supabaseAuth.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { data: caller } = await supabaseAuth
      .from("profiles")
      .select("role")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!caller || (caller.role !== "brand" && caller.role !== "admin")) {
      return NextResponse.json({ error: "Brand access required" }, { status: 403 });
    }

    const { data: briefData } = await supabase
      .from("briefs")
      .select("*")
      .eq("id", parsed.data.briefId)
      .eq("status", "published")
      .maybeSingle();
    if (!briefData) {
      return NextResponse.json({ error: "Published brief not found" }, { status: 404 });
    }

    const { data: creatorData } = await supabase
      .from("creator_profiles")
      .select("*, profiles!inner (is_public, role)")
      .eq("id", parsed.data.creatorId)
      .eq("profiles.is_public", true)
      .maybeSingle();
    if (!creatorData) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const [portfolioResult, toolsResult, metricsResult] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("*")
        .eq("creator_profile_id", creatorData.id)
        .eq("is_public", true),
      supabase.from("creator_tools").select("*").eq("creator_profile_id", creatorData.id),
      supabase
        .from("social_metric_snapshots")
        .select("id", { count: "exact" })
        .eq("creator_profile_id", creatorData.id)
        .eq("is_latest", true),
    ]);

    // Completed collaborations require privileged access; fall back
    // gracefully when the admin client is not configured locally.
    let completedCollaborations = 0;
    try {
      const { count } = await supabaseAdmin
        .from("collaboration_requests")
        .select("id", { count: "exact" })
        .eq("creator_profile_id", creatorData.id)
        .eq("status", "completed");
      completedCollaborations = count ?? 0;
    } catch {
      completedCollaborations = 0;
    }

    const context: CreatorScoringContext = {
      creatorProfile: creatorData as unknown as creatorProfile,
      publicPortfolio: (portfolioResult.data ?? []) as unknown as portfolioItem[],
      tools: (toolsResult.data ?? []) as unknown as creatorTool[],
      latestMetricCount: metricsResult.count ?? 0,
      completedCollaborations,
    };

    const briefSkills = Object.prototype.hasOwnProperty.call(briefData, "brief_skills")
      ? ((briefData as unknown as { brief_skills: unknown }).brief_skills as string[]) ?? []
      : [];

    const report = computeFitScore(briefData as unknown as brief, briefSkills, context);

    return NextResponse.json({
      ok: true,
      fitReport: report,
      disclaimer: FIT_REPORT_DISCLAIMER,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to score match";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
