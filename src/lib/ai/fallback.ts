/**
 * src/lib/ai/fallback.ts
 * ---------------------------------------------------------------------------
 * Deterministic template used by the AI Brief Builder when:
 *   - no Gemini API key is configured, or
 *   - the API call fails, or
 *   - the returned JSON fails validation.
 *
 * Self-contained and rule-based. Never touches any third-party API, never
 * exposes secrets, and degrades gracefully instead of blocking the flow.
 */

import { z } from "zod";

export const CONTENT_TYPE_VALUES = ["motion", "still", "3d", "ui", "audio", "writing"] as const;
export const PLATFORM_VALUES = [
  "youtube", "instagram", "facebook", "tiktok", "linkedin", "twitter", "web", "app_store",
] as const;
export const ASPECT_RATIO_VALUES = ["16:9", "9:16", "1:1", "4:5", "21:9"] as const;

/** The draft shape the Brief Builder wizard works with (snake_case). */
export const BriefDraftSchema = z.object({
  campaign_goal: z.string().min(8).max(500),
  audience: z.string().min(5).max(400),
  content_type: z.enum(CONTENT_TYPE_VALUES),
  style: z.string().max(120),
  deliverable_count: z.number().int().min(1).max(20),
  platforms: z.array(z.enum(PLATFORM_VALUES)).min(1),
  aspect_ratios: z.array(z.enum(ASPECT_RATIO_VALUES)).min(1),
  /** Minor units (paise). */
  budget: z.number().int().min(1000).max(100000000),
  /** ISO-8601 date/datetime the work must be delivered by. */
  deadline: z.string().min(4).max(40),
  license_and_usage: z.string().min(10).max(500),
  revision_requirements: z.string().min(5).max(300),
  preferred_tools: z.array(z.string().min(1).max(60)).max(15),
});

export type BriefDraft = z.infer<typeof BriefDraftSchema>;

export type TemplateOptions = {
  campaign_goal: string;
  audience: string;
  content_type: string;
  style?: string;
  deliverable_count: number;
  platforms?: string[];
  aspect_ratios?: string[];
  budget: number;
  deadline?: string;
  license_and_usage?: string;
  revision_requirements?: string;
  preferred_tools?: string[];
};

const PLATFORM_SET = new Set<string>(PLATFORM_VALUES);
const RATIO_SET = new Set<string>(ASPECT_RATIO_VALUES);

function intersect(values: string[] | undefined, allowed: Set<string>): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const s = String(v).toLowerCase().trim();
    if (allowed.has(s) && !seen.has(s)) {
      seen.add(s);
      out.push(s as (typeof PLATFORM_VALUES)[number] | (typeof ASPECT_RATIO_VALUES)[number]);
    }
  }
  return out;
}

/**
 * Build a usable draft brief from raw wizard answers using deterministic rules.
 */
export function buildTemplateBrief(options: TemplateOptions): BriefDraft {
  const goal = options.campaign_goal.trim().length >= 8
    ? options.campaign_goal.trim()
    : "Introduce the brand to a new audience with focused, on-message creative content.";

  const ct = options.content_type.toLowerCase().trim();
  const contentType = (CONTENT_TYPE_VALUES as readonly string[]).includes(ct)
    ? (ct as BriefDraft["content_type"])
    : "motion";

  const platformList = intersect(options.platforms, PLATFORM_SET);
  const platforms = platformList.length > 0
    ? (platformList as BriefDraft["platforms"])
    : (["instagram", "youtube"] as BriefDraft["platforms"]);

  const ratioList = intersect(options.aspect_ratios, RATIO_SET);
  const aspectRatios = ratioList.length > 0
    ? (ratioList as BriefDraft["aspect_ratios"])
    : (["16:9", "9:16"] as BriefDraft["aspect_ratios"]);

  const deliverableCount = Math.max(1, Math.min(20, Math.floor(options.deliverable_count) || 1));
  const budget = Math.max(1000, Math.floor(options.budget) || 50000);

  const deadlineParsed = options.deadline ? new Date(options.deadline) : new Date(NaN);
  const deadline = Number.isNaN(deadlineParsed.getTime()) || deadlineParsed.getTime() <= Date.now()
    ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    : deadlineParsed.toISOString();

  const audience = options.audience.trim().length >= 5
    ? options.audience.trim()
    : "A broad adult audience in the brand's core market.";

  const licenseText = options.license_and_usage && options.license_and_usage.trim().length >= 10
    ? options.license_and_usage.trim()
    : "Paid ads and organic social use authorized. Resale and sublicensing excluded unless agreed separately.";

  const revisionText = options.revision_requirements && options.revision_requirements.trim().length >= 5
    ? options.revision_requirements.trim()
    : "Include two revision rounds on the final deliverables.";

  const tools = (options.preferred_tools ?? [])
    .map((t) => String(t).trim())
    .filter((t) => t.length >= 1 && t.length <= 60)
    .slice(0, 15);

  const style = options.style && options.style.trim().length >= 1
    ? options.style.trim().slice(0, 120)
    : "Clean, professional, on-brand";

  return BriefDraftSchema.parse({
    campaign_goal: goal,
    audience,
    content_type: contentType,
    style,
    deliverable_count: deliverableCount,
    platforms,
    aspect_ratios: aspectRatios,
    budget,
    deadline,
    license_and_usage: licenseText,
    revision_requirements: revisionText,
    preferred_tools: tools,
  });
}
