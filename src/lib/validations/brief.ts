import { z } from "zod";

export const briefSchema = z.object({
  brandProfileId: z.string().uuid("Invalid brand id"),
  // Title — required, meaningful
  title: z
    .string()
    .trim()
    .min(8, "Brief title must be at least 8 characters")
    .max(120, "Brief title must be 120 characters or fewer")
    .regex(/^[a-zA-Z0-9\s_:.,-]+$/, "Brief title contains invalid characters"),
  // Objective — required, reasoned
  objective: z
    .string()
    .trim()
    .min(40, "Objective must be at least 40 characters")
    .max(1000, "Objective must be 1000 characters or fewer"),
  // Target audience — optional but if present must be longer
  targetAudience: z
    .string()
    .trim()
    .min(10, "Target audience description must be at least 10 characters")
    .max(500, "Target audience must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  // Style — optional
  style: z.string().trim().max(100, "Style must be 100 characters or fewer").optional().or(z.literal("")),
  // Content type — known inventory
  content_type: z.enum(["motion", "still", "3d", "ui", "audio", "writing"]),
  // Deliverable count
  deliverablesCount: z
    .number()
    .int()
    .min(1, "At least 1 deliverable is required")
    .max(20, "No more than 20 deliverables"),
  // Platforms — valid inventory
  platforms: z
    .array(z.enum(["youtube", "instagram", "facebook", "tiktok", "linkedin", "twitter", "web", "app_store"]))
    .min(1, "Select at least one platform"),
  // Aspect ratios
  aspectRatios: z
    .array(z.enum(["16:9", "9:16", "1:1", "4:5", "21:9"]))
    .min(1, "Select at least one aspect ratio"),
  // Budget (minor units)
  budget: z
    .number()
    .int()
    .min(1000, "Budget is too low (minimum 1000 minor units)")
    .max(100000000, "Budget is too high"),
  // Deadline
  deadline: z
    .string()
    .datetime("Deadline must be a valid date/time")
    .refine((d) => new Date(d) > new Date(), "Deadline must be in the future"),
  // License notes
  licenseNotes: z
    .string()
    .trim()
    .min(20, "License notes must be at least 20 characters")
    .max(1000, "License notes must be 1000 characters or fewer"),
  // Revision count
  revisionCount: z
    .number()
    .int()
    .min(0, "Revisions must be 0 or more")
    .max(20, "No more than 20 revisions"),
  // Preferred tools
  preferredTools: z
    .array(z.string().min(2).max(40))
    .max(15, "Too many preferred tools"),
  // Usage rights
  usageRights: z
    .array(z.enum(["social", "paid_ads", "website", "streaming", "merch", "theatrical", "app_store", "portfolio"]))
    .min(1, "Select at least one usage right"),
  // Audit fields (computed server-side)
  status: z.enum(["draft", "published", "archived", "closed"]).optional().default("draft"),
  generatedByAi: z.boolean().optional().default(false),
  aiModelUsed: z.string().max(100).optional(),
  aiPromptRecord: z.string().max(4000).optional(),
});

export type BriefInput = z.infer<typeof briefSchema>;

// ---------------------------------------------------------------------------
// Public view schema — a safe subset returned to browsers. Validated against
// the full briefSchema so public payloads never accept more than private ones.
// ---------------------------------------------------------------------------
export const briefPublicSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(8).max(120),
  objective: z.string().min(40).max(1000),
  content_type: z.enum(["motion", "still", "3d", "ui", "audio", "writing"]),
  deliverables_count: z.number().int().min(1).max(20),
  platforms: z.array(z.string()).min(1),
  aspect_ratios: z.array(z.string()).min(1),
  total_budget_minor: z.number().int().min(0),
  deadline_at: z.string(),
  license_notes: z.string().max(1000).nullable(),
  revision_count: z.number().int().min(0).max(20),
  preferred_tools: z.array(z.string()).max(15),
  usage_rights: z.array(z.string()).min(1),
  status: z.enum(["draft", "published", "archived", "closed"]),
});

export type BriefPublic = z.infer<typeof briefPublicSchema>;
