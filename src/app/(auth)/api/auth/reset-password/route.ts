import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const resetSchema = z.object({
  newPassword: z.string().min(10, "Password must be at least 10 characters").max(128),
  newPasswordConfirm: z.string().min(10).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { newPassword, newPasswordConfirm } = parsed.data;
    if (newPassword !== newPasswordConfirm) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Requires the user to be authenticated with the recovery session.
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired. Request a new one." },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, redirectTo: "/login" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
