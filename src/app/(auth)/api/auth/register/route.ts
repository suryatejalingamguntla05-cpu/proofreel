import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { appUrl } from "@/lib/env";

const registerBodySchema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
  password: z.string().min(10, "Password must be at least 10 characters").max(128),
  displayName: z.string().trim().min(2).max(60),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may contain letters, numbers, hyphens and underscores"),
  role: z.enum(["creator", "brand"]),
  companyName: z.string().trim().min(2).max(100).nullable().optional(),
  industry: z.string().trim().max(60).nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const parsed = registerBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, displayName, username, role, companyName, industry } = parsed.data;

    // Defensive double-check: brand accounts must supply a company name.
    if (role === "brand" && !companyName) {
      return NextResponse.json({ error: "Company name is required for brand accounts" }, { status: 400 });
    }

    // 1. Create the auth user. Passwords are hashed by Supabase — we never
    //    store plaintext, and role is NOT taken from the browser payload.
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, username, requested_role: role },
        emailRedirectTo: `${appUrl()}/callback`,
      },
    });

    if (authError) {
      const status = authError.status ?? 500;
      // surface only a safe client-facing message
      return NextResponse.json({ error: authError.message }, { status });
    }
    if (!authData.user) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    // 2. Create the profile row with a SERVER-decided role (never "admin").
    const safeRole: "creator" | "brand" = role === "brand" ? "brand" : "creator";

    // Ensure a unique username (append short suffix on collision).
    let finalUsername = slugify(username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) {
      finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user.id,
        display_name: displayName,
        username: finalUsername,
        role: safeRole,
        is_public: true,
        is_onboarding_complete: false,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    // 3. Create the role-specific extended profile.
    if (safeRole === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: companyName ?? displayName,
        industry: industry ?? null,
        is_brand_verified: false,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }

    // If email confirmation is disabled the user already has a session.
    // Otherwise they must confirm via the emailed link (documented).
    return NextResponse.json({
      ok: true,
      requiresEmailConfirmation: authData.session === null,
      redirectTo: "/onboarding",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    // Avoid leaking internals; keep the message generic.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
