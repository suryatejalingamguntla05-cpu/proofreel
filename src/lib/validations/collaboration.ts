import { z } from "zod";

// ---------------------------------------------------------------------------
// Collaboration invitation
// ---------------------------------------------------------------------------
export const collaborationSchema = z.object({
  brandProfileId: z.string().uuid("Invalid brand id"),
  creatorProfileId: z.string().uuid("Invalid creator id"),
  briefId: z.string().uuid("Invalid brief id"),
  messageText: z
    .string()
    .trim()
    .min(8, "Message must be at least 8 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
  quoteAmount: z.number().int().min(0).optional(),
});

export type CollaborationInput = z.infer<typeof collaborationSchema>;

// ---------------------------------------------------------------------------
// Quote
// ---------------------------------------------------------------------------
export const quoteSchema = z.object({
  creatorProfileId: z.string().uuid("Invalid creator id"),
  brandProfileId: z.string().uuid("Invalid brand id"),
  collaborationId: z.string().uuid("Invalid collaboration id"),
  amountMinor: z.number().int().min(0, "Amount must be a whole number of minor units").positive("Amount must be positive"),
  currency: z.enum(["INR"]).optional().default("INR"),
  timelineDays: z.number().int().min(1).max(365).optional(),
  revisionCount: z.number().int().min(0).max(20).optional(),
  packageDescription: z.string().max(500, "Package description is too long").optional(),
  licensingNotes: z.string().max(500, "Licensing notes are too long").optional(),
  revisionPolicy: z.string().max(300, "Revision policy is too long").optional(),
  acceptanceNotes: z.string().max(500, "Acceptance notes are too long").optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

// ---------------------------------------------------------------------------
// Agreement acceptance (not a legally binding signature — see SECURITY.md)
// ---------------------------------------------------------------------------
export const agreementSchema = z.object({
  collaborationId: z.string().uuid("Invalid collaboration id"),
  agreedTerms: z
    .record(z.any())
    .refine((v) => Object.keys(v).length > 0, "At least one term is required"),
  licenseTerms: z.string().max(4000, "License terms are too long").optional(),
  paymentTerms: z.string().max(4000, "Payment terms are too long").optional(),
  acceptanceRecord: z.string().max(2000, "Acceptance record is too long").optional(),
});

export type AgreementInput = z.infer<typeof agreementSchema>;

// ---------------------------------------------------------------------------
// Milestone transition
// ---------------------------------------------------------------------------
export const milestoneSchema = z.object({
  collaborationId: z.string().uuid("Invalid collaboration id"),
  title: z.string().min(3, "Milestone title is too short").max(120, "Milestone title too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  dueAt: z.string().datetime().optional(),
  orderNum: z.number().int().min(0).optional(),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

// ---------------------------------------------------------------------------
// Deliverable upload
// ---------------------------------------------------------------------------
export const deliverableSchema = z.object({
  collaborationId: z.string().uuid("Invalid collaboration id"),
  milestoneId: z.string().uuid("Invalid milestone id"),
  title: z.string().min(3, "Deliverable title is required").max(120, "Title is too long"),
  fileUrl: z.string().url("Invalid file url").optional(),
  fileMetaJson: z.record(z.any()).refine(
    (v) => JSON.stringify(v).length <= 2000,
    "File metadata is too large"
  ).optional(),
  fileName: z.string().max(255, "File name is too long").optional(),
  fileSizeBytes: z.number().int().min(0).optional(),
  width: z.number().int().min(0).max(100000).optional(),
  height: z.number().int().min(0).max(100000).optional(),
  durationSeconds: z.number().positive().optional(),
  format: z.string().max(40, "Format is too long").optional(),
  aspectRatio: z.string().max(40, "Aspect ratio is too long").optional(),
});

export type DeliverableInput = z.infer<typeof deliverableSchema>;

// ---------------------------------------------------------------------------
// Revision response
// ---------------------------------------------------------------------------
export const revisionSchema = z.object({
  deliverableId: z.string().uuid("Invalid deliverable id"),
  creatorProfileId: z.string().uuid("Invalid creator id"),
  brandProfileId: z.string().uuid("Invalid brand id"),
  content: z
    .record(z.any())
    .refine((v) => Object.keys(v).length > 0, "Revision content is required"),
  status: z.enum(["approved", "rejected"]),
  reviewerNotes: z.string().max(1000, "Reviewer notes are too long").optional(),
});

export type RevisionInput = z.infer<typeof revisionSchema>;

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------
export const messageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation id"),
  body: z
    .string()
    .trim()
    .min(1, "Message body is required")
    .max(5000, "Message must be 5000 characters or fewer"),
});

export type MessageInput = z.infer<typeof messageSchema>;

// ---------------------------------------------------------------------------
// Notification preference
// ---------------------------------------------------------------------------
export const notificationSchema = z.object({
  types: z
    .array(z.enum(["invitation", "quote_submitted", "revision_requested", "mention", "system"]))
    .max(8, "Too many notification types"),
});
