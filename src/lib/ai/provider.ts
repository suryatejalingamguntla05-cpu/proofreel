/**
 * src/lib/ai/provider.ts
 * ---------------------------------------------------------------------------
 * Gemini-backed AI Brief Builder (server only).
 *
 * Behavior:
 *  - No API key configured  -> deterministic template fallback (buildTemplateBrief).
 *  - Key configured         -> call the Gemini REST API from the server, validate
 *                              the JSON response with zod, fall back on ANY
 *                              failure (network, schema, quota).
 *
 * The API key never leaves the server. The route handler never returns it.
 */

import { z } from "zod";
import { optionalIntegrations } from "@/lib/env";
import { BriefDraftSchema, buildTemplateBrief, type BriefDraft, type TemplateOptions } from "@/lib/ai/fallback";

/** Configurable model name; defaults to a current, economically sensible one. */
export function getGeminiModel(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  // Only allow models that look like a Gemini generation to avoid surprises.
  if (configured && /^gemini-[\w.-]+$/i.test(configured)) return configured;
  return "gemini-2.0-flash";
}

export function isAiConfigured(): boolean {
  return optionalIntegrations.gemini && /^AIza[\w-]{20,}$/.test(process.env.GEMINI_API_KEY ?? "");
}

const GeminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(z.object({ text: z.string().optional() })).min(1),
          })
          .passthrough()
          .optional(),
        finishReason: z.string().optional(),
      })
    )
    .min(1),
});

function extractJsonBlock(raw: string): unknown {
  // The model is instructed to return JSON only, but tolerate fences.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** Calls Gemini generateContent and validates the parsed draft. */
async function callGemini(options: TemplateOptions, apiKey: string): Promise<BriefDraft> {
  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const prompt = `You are a creative-brief assistant for an AI creator marketplace.
Return ONLY a valid JSON object with exactly these keys (no markdown, no prose):
campaign_goal, audience, content_type (one of motion|still|3d|ui|audio|writing),
style, deliverable_count (1-20), platforms (subset of youtube|instagram|facebook|tiktok|linkedin|twitter|web|app_store),
aspect_ratios (subset of 16:9|9:16|1:1|4:5|21:9), budget (integer, minor currency units),
deadline (ISO-8601), license_and_usage, revision_requirements, preferred_tools (string array).
Refine and sharpen the inputs below; keep them faithful to the request.

Campaign goal: ${options.campaign_goal}
Audience: ${options.audience}
Content type: ${options.content_type}
Deliverables: ${options.deliverable_count}
Platforms: ${(options.platforms ?? []).join(", ") || "unspecified"}
Budget (minor units): ${options.budget}
Deadline: ${options.deadline ?? "unspecified"}
License/usage: ${options.license_and_usage ?? "unspecified"}
Revisions: ${options.revision_requirements ?? "unspecified"}
Preferred tools: ${(options.preferred_tools ?? []).join(", ") || "unspecified"}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Gemini request failed with status ${res.status}`);
  }

  const body: unknown = await res.json();
  const envelope = GeminiResponseSchema.parse(body);
  const text = envelope.candidates[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");

  const parsed: unknown = extractJsonBlock(text);
  return BriefDraftSchema.parse(parsed);
}

/**
 * Public entry point for the brief builder.
 * Never throws: falls back to the deterministic template on any failure.
 */
export async function buildBriefWithAi(options: TemplateOptions): Promise<{
  draft: BriefDraft;
  source: "ai" | "template";
  aiModel?: string;
  warning?: string;
}> {
  if (isAiConfigured()) {
    try {
      const draft = await callGemini(options, process.env.GEMINI_API_KEY as string);
      return { draft, source: "ai", aiModel: getGeminiModel() };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return {
        draft: buildTemplateBrief(options),
        source: "template",
        warning: `AI generation failed (${reason}). Showing a deterministic template instead — edit freely before publishing.`,
      };
    }
  }

  return {
    draft: buildTemplateBrief(options),
    source: "template",
    warning: "No Gemini API key configured. Showing a deterministic template instead — edit freely before publishing.",
  };
}
