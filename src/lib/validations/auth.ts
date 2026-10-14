import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .email("Enter a valid email address")
      .max(254, "Email is too long"),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters")
      .max(60, "Display name is too long"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(24, "Username must be 24 characters or fewer")
      .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
    role: z.enum(["creator", "brand"]),
    companyName: z
      .string()
      .trim()
      .min(2, "Company name is required")
      .max(100, "Company name is too long")
      .optional()
      .or(z.literal("")),
    industry: z
      .string()
      .trim()
      .max(60, "Industry is too long")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => (data.role === "brand" ? data.companyName?.trim().length : true), {
    message: "Company name is required for brand accounts",
    path: ["companyName"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const profileOnboardingSchema = z.object({
  bio: z.string().max(500, "Bio is too long").optional().or(z.literal("")),
  location: z.string().max(60, "Location is too long").optional().or(z.literal("")),
  languages: z.array(z.string().max(10)).max(8, "Too many languages"),
  portfolioUrl: z.string().max(200, "URL is too long").optional().or(z.literal("")),
  websiteUrl: z.string().max(200, "URL is too long").optional().or(z.literal("")),
  instagramUrl: z.string().max(200, "URL is too long").optional().or(z.literal("")),
  youtubeUrl: z.string().max(200, "URL is too long").optional().or(z.literal("")),
  hourlyRate: z.number().int().min(0, "Rate must be a whole number").optional(),
  availability: z.string().max(300, "Availability notes are too long").optional().or(z.literal("")),
  isProfileVerified: z.boolean().optional(),
  art_form: z.array(z.string().min(2).max(60)).max(12, "Too many art forms"),
  experienceYears: z.number().int().min(0).max(100).optional(),
  tools: z.array(z.string().min(2).max(60)).max(20, "Too many tools"),
  workflowTitle: z.string().min(3).max(100).optional(),
});

// Alias used by client-side onboarding forms.
export const updateProfileSchema = profileOnboardingSchema;
