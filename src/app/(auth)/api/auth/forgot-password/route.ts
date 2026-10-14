import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { appUrl } from "@/lib/env";

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
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

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${appUrl()}/login#reset`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Always respond the same way to avoid leaking which emails exist.
    return NextResponse.json({ ok: true, message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send reset link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
