import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildBriefWithAi } from "@/lib/ai/provider";

const bodySchema = z.object({
  campaign_goal: z.string().min(8, "Describe the campaign goal in at least 8 characters").max(500),
  audience: z.string().min(5).max(400),
  content_type: z.enum(["motion", "still", "3d", "ui", "audio", "writing"]),
  deliverable_count: z.number().int().min(1).max(20).default(1),
  platforms: z.array(z.enum(["youtube", "instagram", "facebook", "tiktok", "linkedin", "twitter", "web", "app_store"])).default([]),
  aspect_ratios: z.array(z.enum(["16:9", "9:16", "1:1", "4:5", "21:9"])).default([]),
  budget: z.number().int().min(1000).max(100000000).default(50000),
  deadline: z.string().max(40).optional(),
  license_and_usage: z.string().max(500).optional(),
  revision_requirements: z.string().max(300).optional(),
  preferred_tools: z.array(z.string().max(60)).max(15).default([]),
  style: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { draft, source, aiModel, warning } = await buildBriefWithAi(parsed.data);

    return NextResponse.json({
      ok: true,
      brief: draft,
      source,
      aiModel: aiModel ?? null,
      warning: warning ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Brief builder failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
