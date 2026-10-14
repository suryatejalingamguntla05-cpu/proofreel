/**
 * src/lib/brief-draft-mapper.ts
 * ---------------------------------------------------------------------------
 * Shared shape for brief creation/edit form payloads sent to /api/briefs.
 * Keeps the dashboard form, the wizard, and the API route in lockstep.
 */

export type BriefFormPayload = {
  title: string;
  objective: string;
  targetAudience: string;
  style: string;
  content_type: "motion" | "still" | "3d" | "ui" | "audio" | "writing";
  deliverablesCount: number;
  platforms: string[];
  aspectRatios: string[];
  /** Minor units (paise). */
  budget: number;
  /** ISO datetime string. */
  deadline: string;
  licenseNotes: string;
  revisionCount: number;
  preferredTools: string[];
  usageRights: string[];
  status: "draft" | "published";
  generatedByAi: boolean;
};

export function fromDraftToFormPayload(): BriefFormPayload;
export function fromDraftToFormPayload(draft: unknown): BriefFormPayload;
export function fromDraftToFormPayload(draft?: unknown): BriefFormPayload {
  const d = (draft ?? {}) as Record<string, unknown>;
  return {
    title: typeof d.title === "string" ? d.title : "",
    objective: typeof d.objective === "string" ? d.objective : "",
    targetAudience: typeof d.targetAudience === "string" ? d.targetAudience : "",
    style: typeof d.style === "string" ? d.style : "",
    content_type:
      d.content_type === "motion" ||
      d.content_type === "still" ||
      d.content_type === "3d" ||
      d.content_type === "ui" ||
      d.content_type === "audio" ||
      d.content_type === "writing"
        ? d.content_type
        : "motion",
    deliverablesCount: typeof d.deliverablesCount === "number" ? d.deliverablesCount : Number(d.deliverable_count) || 1,
    platforms: Array.isArray(d.platforms) ? (d.platforms as string[]) : [],
    aspectRatios: Array.isArray(d.aspectRatios) ? (d.aspectRatios as string[]) : Array.isArray(d.aspect_ratios) ? (d.aspect_ratios as string[]) : ["16:9"],
    budget: typeof d.budget === "number" ? d.budget : 50000,
    deadline:
      typeof d.deadline === "string"
        ? d.deadline
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    licenseNotes: typeof d.licenseNotes === "string" ? d.licenseNotes : typeof d.license_and_usage === "string" ? d.license_and_usage : "",
    revisionCount: typeof d.revisionCount === "number" ? d.revisionCount : Number(d.revision_requirements) || 0,
    preferredTools: Array.isArray(d.preferredTools) ? (d.preferredTools as string[]) : Array.isArray(d.preferred_tools) ? (d.preferred_tools as string[]) : [],
    usageRights: Array.isArray(d.usageRights) ? (d.usageRights as string[]) : ["social", "paid_ads"],
    status: d.status === "draft" ? "draft" : "published",
    generatedByAi: d.generatedByAi === true || d.generatedByAi === undefined ? d.generatedByAi === true : false,
  };
}

export { fromDraftToFormPayload as default };
