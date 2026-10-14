import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const inviteBodySchema = z.object({
  briefId: z.string().uuid("Invalid brief id"),
  creatorId: z.string().uuid("Invalid creator id"),
  messageText: z
    .string()
    .trim()
    .min(8, "Invitation message must be at least 8 characters")
    .max(2000, "Invitation message must be 2000 characters or fewer"),
});

/** POST /api/collaborations — a brand invites a creator to one of its briefs. */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: caller } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!caller) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (caller.role !== "brand" && caller.role !== "admin") {
      return NextResponse.json({ error: "Brand access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = inviteBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { data: brandProfile } = await supabase
      .from("brand_profiles")
      .select("id, profile_id")
      .eq("profile_id", caller.id)
      .maybeSingle();
    if (!brandProfile && caller.role !== "admin") {
      return NextResponse.json({ error: "Brand profile required" }, { status: 403 });
    }

    // Brief must be published and belong to the caller's brand.
    const { data: briefRow } = await supabase
      .from("briefs")
      .select("id, brand_profile_id, title, status")
      .eq("id", parsed.data.briefId)
      .maybeSingle();
    if (!briefRow || briefRow.status !== "published") {
      return NextResponse.json({ error: "Published brief not found" }, { status: 404 });
    }
    if (caller.role !== "admin" && briefRow.brand_profile_id !== brandProfile!.id) {
      return NextResponse.json({ error: "This brief belongs to another brand" }, { status: 403 });
    }

    const { data: creatorRow } = await supabase
      .from("creator_profiles")
      .select("id, profiles!inner (is_public, role)")
      .eq("id", parsed.data.creatorId)
      .eq("profiles.is_public", true)
      .maybeSingle();
    if (!creatorRow) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Idempotency: one open invitation per (brand, creator, brief).
    const { data: existing } = await supabase
      .from("collaboration_requests")
      .select("id, status")
      .eq("brand_profile_id", briefRow.brand_profile_id)
      .eq("creator_profile_id", creatorRow.id)
      .eq("brief_id", briefRow.id)
      .maybeSingle();
    if (existing && !["completed", "archived"].includes(existing.status)) {
      return NextResponse.json({ ok: true, collaboration: existing, duplicate: true });
    }

    const { data, error } = await supabase
      .from("collaboration_requests")
      .insert({
        brand_profile_id: briefRow.brand_profile_id,
        creator_profile_id: creatorRow.id,
        brief_id: briefRow.id,
        message_text: parsed.data.messageText,
        status: "invited",
      })
      .select()
      .single();
    if (error) throw error;

    // Notify the creator (best effort — notification failure must not fail invite).
    try {
      const { data: creatorProfileIdRow } = await supabase
        .from("creator_profiles")
        .select("profile_id")
        .eq("id", creatorRow.id)
        .maybeSingle();
      if (creatorProfileIdRow) {
        await supabase.from("notifications").insert({
          recipient_id: creatorProfileIdRow.profile_id,
          actor_id: caller.id,
          type: "invitation",
          payload_json: { collaboration_id: data.id, brief_title: briefRow.title },
        });
      }
    } catch {
      // non-fatal
    }

    return NextResponse.json({ ok: true, collaboration: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET /api/collaborations — the caller's own collaboration rows. */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!me) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const statusFilter = new URL(req.url).searchParams.get("status");

    if (me.role === "brand" || me.role === "admin") {
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("profile_id", me.id)
        .maybeSingle();
      if (!brandProfile) {
        return NextResponse.json({ collaborations: [] });
      }
      let query = supabase
        .from("collaboration_requests")
        .select("*")
        .eq("brand_profile_id", brandProfile.id)
        .order("created_at", { ascending: false });
      if (statusFilter) query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ collaborations: data ?? [] });
    }

    const { data: creatorProfile } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("profile_id", me.id)
      .maybeSingle();
    if (!creatorProfile) {
      return NextResponse.json({ collaborations: [] });
    }
    let query = supabase
      .from("collaboration_requests")
      .select("*")
      .eq("creator_profile_id", creatorProfile.id)
      .order("created_at", { ascending: false });
    if (statusFilter) query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ collaborations: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load collaborations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
