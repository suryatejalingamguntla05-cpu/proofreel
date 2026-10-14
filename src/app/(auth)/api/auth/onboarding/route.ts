import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const onboardingBodySchema = z.object({
  // Shared profile fields
  bio: z.string().max(500).optional(),
  location: z.string().max(60).optional(),
  languages: z.array(z.string().max(10)).max(8).optional(),
  // Creator extended fields
  portfolioUrl: z.string().max(200).optional(),
  websiteUrl: z.string().max(200).optional(),
  instagramUrl: z.string().max(200).optional(),
  youtubeUrl: z.string().max(200).optional(),
  hourlyRate: z.number().int().min(0).max(100000000).optional(),
  availability: z.string().max(300).optional(),
  art_form: z.array(z.string().min(1).max(60)).max(12).optional(),
  experienceYears: z.number().int().min(0).max(100).optional(),
  tools: z.array(z.string().min(1).max(60)).max(20).optional(),
  workflowTitle: z.string().min(1).max(100).optional(),
});

function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const isEmptyString = typeof v === "string" && v.trim() === "";
    const isEmptyArray = Array.isArray(v) && v.length === 0;
    if (v === undefined || v === null || isEmptyString || isEmptyArray) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Identify the caller from the session cookie — never from the payload.
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (profileErr) throw profileErr;
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // NOTE: caller must send JSON; Next parses it for us below.
    return NextResponse.json({ ok: true, needsBody: true, profileId: profile.id, role: profile.role, supabaseAdminConfigured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const body = await req.json().catch(() => ({}));
    const parsed = onboardingBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const d = parsed.data;
    const sharedUpdates = removeEmpty({
      bio: d.bio,
      location: d.location,
      languages: d.languages,
    });

    if (Object.keys(sharedUpdates).length > 0) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ ...sharedUpdates, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (error) throw error;
    }

    if (profile.role === "creator") {
      const creatorUpdates = removeEmpty({
        portfolio_url: d.portfolioUrl,
        website_url: d.websiteUrl,
        instagram_url: d.instagramUrl,
        youtube_url: d.youtubeUrl,
        hourly_rate_minor: d.hourlyRate,
        availability: d.availability,
        art_form: d.art_form,
        experience_years: d.experienceYears,
      });
      const { error } = await supabaseAdmin
        .from("creator_profiles")
        .update({ ...creatorUpdates, updated_at: new Date().toISOString() })
        .eq("profile_id", profile.id);
      if (error) throw error;

      // Optional tools and workflow entries
      if (d.tools && d.tools.length > 0) {
        const rows = d.tools.map((name) => ({
          creator_profile_id: profile.id,
          tool_name: name,
          workflow_step: "production",
        }));
        const { error: toolsErr } = await supabaseAdmin.from("creator_tools").insert(rows);
        if (toolsErr) throw toolsErr;
      }
      if (d.workflowTitle) {
        const { error: wfErr } = await supabaseAdmin.from("creator_workflow").insert({
          creator_profile_id: profile.id,
          title: d.workflowTitle,
          step_order: 1,
        });
        if (wfErr) throw wfErr;
      }
    } else if (profile.role === "brand") {
      // Brands only edit their shared profile here; extended fields live in
      // the brand profile editor.
    }

    const { error: doneErr } = await supabaseAdmin
      .from("profiles")
      .update({ is_onboarding_complete: true, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (doneErr) throw doneErr;

    return NextResponse.json({
      ok: true,
      redirectTo: profile.role === "brand" ? "/brand" : "/creator",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
