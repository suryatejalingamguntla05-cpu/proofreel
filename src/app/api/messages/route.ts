import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const messageBodySchema = z.object({
  body: z.string().trim().min(1, "Message is empty").max(5000, "Message must be 5000 characters or fewer"),
});

/** GET /api/messages?conversation_id=… — thread history (participant-only). */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Resolve the caller's profile id for participant checks.
    const { data: me } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!me) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const conversationId = new URL(req.url).searchParams.get("conversation_id");
    if (conversationId) {
      // Participant check happens in-code; ONLY members may read.
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .select("id, participant_a_id, participant_b_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (convErr) throw convErr;
      if (!conv || (conv.participant_a_id !== me.id && conv.participant_b_id !== me.id)) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return NextResponse.json({ messages: data ?? [] });
    }

    // Conversation list with the other participant's display info.
    const { data: convs, error: listErr } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_a_id.eq.${me.id},participant_b_id.eq.${me.id}`)
      .order("updated_at", { ascending: false });
    if (listErr) throw listErr;

    const partnerIds = new Set<string>();
    (convs ?? []).forEach((c) => {
      const a = c.participant_a_id;
      const b = c.participant_b_id;
      partnerIds.add(a === me.id ? b : a);
    });
    const { data: partnerProfiles } = partnerIds.size
      ? await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url, role")
          .in("id", [...partnerIds])
      : { data: [] };
    const partnerMap = new Map(((partnerProfiles ?? []) as unknown as Array<{ id: string; display_name: string; username: string }>).map((p) => [p.id, p]));

    const conversations = (convs ?? []).map((c) => ({
      id: c.id,
      topic: c.topic,
      partner: partnerMap.get(c.participant_a_id === me.id ? c.participant_b_id : c.participant_a_id) ?? null,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return NextResponse.json({ conversations, myProfileId: me.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/messages — send within an existing conversation. */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", userData.user.id)
      .maybeSingle();
    if (!me) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const parsedUrl = new URL(req.url);
    const conversationId = parsedUrl.searchParams.get("conversation_id") ?? body.conversationId;
    const parsed = messageBodySchema.safeParse(body);
    if (!conversationId || !parsed.success) {
      return NextResponse.json(
        { error: "conversation_id and a non-empty body are required" },
        { status: 400 }
      );
    }

    // Only participants may post.
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, participant_a_id, participant_b_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv || (conv.participant_a_id !== me.id && conv.participant_b_id !== me.id)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: me.id, body: parsed.data.body })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, message: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
