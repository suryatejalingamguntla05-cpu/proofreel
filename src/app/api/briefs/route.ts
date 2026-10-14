import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { listDemoBriefs } from "@/lib/demo/database";

const briefBodySchema = z.object({
  title: z.string().trim().min(8, "Title must be at least 8 characters").max(120),
  objective: z.string().trim().min(40, "Objective must be at least 40 characters").max(1000),
  targetAudience: z.string().trim().max(500).optional().or(z.literal("")),
  style: z.string().trim().max(120).optional().or(z.literal("")),
  content_type: z.enum(["motion", "still", "3d", "ui", "audio", "writing"]),
  deliverablesCount: z.number().int().min(1).max(20),
  platforms: z
    .array(z.enum(["youtube", "instagram", "facebook", "tiktok", "linkedin", "twitter", "web", "app_store"]))
    .min(1, "Select at least one platform"),
  aspectRatios: z.array(z.enum(["16:9", "9:16", "1:1", "4:5", "21:9"])).min(1, "Select at least one aspect ratio"),
  /** Minor units (paise). */
  budget: z.number().int().min(1000, "Budget is too low").max(100000000, "Budget is too high"),
  deadline: z
    .string()
    .refine((d) => !Number.isNaN(new Date(d).getTime()), "Deadline must be a valid date")
    .refine((d) => new Date(d).getTime() > Date.now(), "Deadline must be in the future"),
  licenseNotes: z.string().trim().min(20, "License notes must be at least 20 characters").max(1000),
  revisionCount: z.number().int().min(0).max(20),
  preferredTools: z.array(z.string().min(1).max(60)).max(15).default([]),
  usageRights: z
    .array(z.enum(["social", "paid_ads", "website", "streaming", "merch", "theatrical", "app_store", "portfolio"]))
    .min(1, "Select at least one usage right"),
  status: z.enum(["draft", "published"]).default("published"),
  generatedByAi: z.boolean().default(false),
});

async function requireBrandProfile(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not authenticated", status: 401 as const, brandProfile: null };
  const { data: caller } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_id", userData.user.id)
    .maybeSingle();
  if (!caller) return { error: "Profile not found", status: 404 as const, brandProfile: null };
  if (caller.role !== "brand" && caller.role !== "admin") {
    return { error: "Brand access required", status: 403 as const, brandProfile: null };
  }
  const { data: brandProfile } = await supabase
    .from("brand_profiles")
    .select("id, profile_id")
    .eq("profile_id", caller.id)
    .maybeSingle();
  if (!brandProfile) {
    return { error: "Brand profile required", status: 403 as const, brandProfile: null };
  }
  return { error: null, status: 200 as const, brandProfile };
}

/** POST /api/briefs — create a brief (brand-only, server-validated). */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Brief creation requires a configured database. The demo brief builder does not save submissions." },
      { status: 503 }
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const guard = await requireBrandProfile(supabase);
    if (guard.error || !guard.brandProfile) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    if (guard.brandProfile.id) {
      /* brand profile resolved */
    }

    const body = await req.json().catch(() => ({}));
    const parsed = briefBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const { data: created, error: insertErr } = await supabase
      .from("briefs")
      .insert({
        brand_profile_id: guard.brandProfile.id,
        title: d.title,
        objective: d.objective,
        target_audience: d.targetAudience || null,
        style: d.style || null,
        content_type: d.content_type,
        deliverables_count: d.deliverablesCount,
        platforms: d.platforms,
        aspect_ratios: d.aspectRatios,
        total_budget_minor: d.budget,
        deadline_at: new Date(d.deadline).toISOString(),
        license_notes: d.licenseNotes,
        revision_count: d.revisionCount,
        preferred_tools: d.preferredTools,
        usage_rights: d.usageRights,
        status: d.status,
        expected_handoff: null,
        generated_by_ai: d.generatedByAi,
        ai_model_used: null,
        ai_prompt_record: null,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    return NextResponse.json({
      ok: true,
      brief: created,
      redirectTo: "/brand/briefs",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create brief";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET /api/briefs — published briefs for discovery, or the caller's own briefs. */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const mine = searchParams.get("mine") === "1";
    const requestedPage = Number(searchParams.get("page") ?? "1");
    const requestedLimit = Number(searchParams.get("limit") ?? "12");
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
    const limit = Number.isFinite(requestedLimit) ? Math.min(24, Math.max(1, Math.floor(requestedLimit))) : 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (!isSupabaseConfigured()) {
      const rows = mine ? [] : listDemoBriefs({
        q: searchParams.get("q") ?? undefined,
        content_type: searchParams.get("content_type") ?? undefined,
      });
      const briefs = rows.slice(from, from + limit);
      return NextResponse.json({
        briefs,
        pagination: { page, limit, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
        usingDemo: true,
      });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    if (mine) {
      const guard = await requireBrandProfile(supabase);
      if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });
      const { data, error, count } = await supabase
        .from("briefs")
        .select("*", { count: "exact" })
        .eq("brand_profile_id", guard.brandProfile!.id)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return NextResponse.json({ briefs: data ?? [], pagination: { page, limit, total: count ?? 0 } });
    }

    // Public discovery: only published briefs.
    const { data, error, count } = await supabase
      .from("briefs")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;

    return NextResponse.json({
      briefs: data ?? [],
      pagination: { page, limit, total: count ?? 0, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch briefs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PUT handled by /api/briefs/[id]/route.ts */
export const dynamic = "force-dynamic";
