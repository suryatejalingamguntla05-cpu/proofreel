import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const allowedUpdateSchema = z.object({
  title: z.string().trim().min(8).max(120).optional(),
  objective: z.string().trim().min(40).max(1000).optional(),
  targetAudience: z.string().trim().max(500).optional(),
  style: z.string().trim().max(120).optional(),
  content_type: z.enum(["motion", "still", "3d", "ui", "audio", "writing"]).optional(),
  deliverablesCount: z.number().int().min(1).max(20).optional(),
  platforms: z
    .array(z.enum(["youtube", "instagram", "facebook", "tiktok", "linkedin", "twitter", "web", "app_store"]))
    .min(1)
    .optional(),
  aspectRatios: z.array(z.enum(["16:9", "9:16", "1:1", "4:5", "21:9"])).min(1).optional(),
  budget: z.number().int().min(1000).max(100000000).optional(),
  deadline: z
    .string()
    .refine((d) => !Number.isNaN(new Date(d).getTime()))
    .optional(),
  licenseNotes: z.string().trim().min(20).max(1000).optional(),
  revisionCount: z.number().int().min(0).max(20).optional(),
  preferredTools: z.array(z.string().min(1).max(60)).max(15).optional(),
  usageRights: z
    .array(z.enum(["social", "paid_ads", "website", "streaming", "merch", "theatrical", "app_store", "portfolio"]))
    .min(1)
    .optional(),
  status: z.enum(["draft", "published", "archived", "closed"]).optional(),
});

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data, error } = await supabase
      .from("briefs")
      .select(
        `
        *,
        brand_profiles ( company_name, profiles ( display_name, username, avatar_url ) )
      `
      )
      .eq("id", ctx.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    return NextResponse.json({ brief: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load brief";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Only the owning brand (or admin) may update the brief. */
export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: caller } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!caller) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { data: briefRow } = await supabase
      .from("briefs")
      .select("id, brand_profile_id")
      .eq("id", ctx.params.id)
      .maybeSingle();
    if (!briefRow) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

    if (caller.role !== "admin") {
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("profile_id", caller.id)
        .maybeSingle();
      if (!brandProfile || brandProfile.id !== briefRow.brand_profile_id) {
        return NextResponse.json({ error: "Not your brief" }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const parsed = allowedUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const d = parsed.data;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (d.title !== undefined) updates.title = d.title;
    if (d.objective !== undefined) updates.objective = d.objective;
    if (d.targetAudience !== undefined) updates.target_audience = d.targetAudience || null;
    if (d.style !== undefined) updates.style = d.style || null;
    if (d.content_type !== undefined) updates.content_type = d.content_type;
    if (d.deliverablesCount !== undefined) updates.deliverables_count = d.deliverablesCount;
    if (d.platforms !== undefined) updates.platforms = d.platforms;
    if (d.aspectRatios !== undefined) updates.aspect_ratios = d.aspectRatios;
    if (d.budget !== undefined) updates.total_budget_minor = d.budget;
    if (d.deadline !== undefined) updates.deadline_at = new Date(d.deadline).toISOString();
    if (d.licenseNotes !== undefined) updates.license_notes = d.licenseNotes;
    if (d.revisionCount !== undefined) updates.revision_count = d.revisionCount;
    if (d.preferredTools !== undefined) updates.preferred_tools = d.preferredTools;
    if (d.usageRights !== undefined) updates.usage_rights = d.usageRights;
    if (d.status !== undefined) updates.status = d.status;

    const { data, error } = await supabase
      .from("briefs")
      .update(updates)
      .eq("id", ctx.params.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, brief: data, redirectTo: "/brand/briefs" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update brief";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
