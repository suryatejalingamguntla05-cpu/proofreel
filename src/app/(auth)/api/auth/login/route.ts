import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const loginBodySchema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const parsed = loginBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Resolve the server-side role so the client can route to the right hub.
    let redirectTo = "/creators";
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_onboarding_complete")
        .eq("auth_id", data.user.id)
        .maybeSingle();
      if (profile) {
        if (!profile.is_onboarding_complete) redirectTo = "/onboarding";
        else redirectTo = profile.role === "brand" ? "/brand" : "/creator";
      }
    }

    return NextResponse.json({ ok: true, redirectTo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
