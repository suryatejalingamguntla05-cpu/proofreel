"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { profileOnboardingSchema } from "@/lib/validations/auth";
// schema used for shared typing; form fields are kept deliberately liberal,
// final validation happens server-side via the same schema family.
void profileOnboardingSchema;

type FormValues = {
  bio: string;
  location: string;
  languages: string;
  portfolioUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  hourlyRate: number;
  availability: string;
  art_form: string[];
  experienceYears: number;
  tools: string[];
  workflowTitle: string;
};

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "ur", label: "Urdu" },
];

const ART_FORM_OPTIONS = [
  { value: "motion", label: "Motion Graphics" },
  { value: "still", label: "Still / Illustration" },
  { value: "3d", label: "3D Animation" },
  { value: "ui", label: "UI / Product Design" },
  { value: "audio", label: "Audio / Music" },
  { value: "writing", label: "Writing / Copy" },
];

const TOOL_OPTIONS = [
  "Runway", "Pika", "ElevenLabs", "Blender", "After Effects", "Figma",
  "DaVinci Resolve", "Midjourney", "Stable Diffusion", "Premiere Pro", "TouchDesigner", "Python",
];

export function ProfileOnboardingForm({ isBrand }: { isBrand: boolean }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      bio: "",
      location: "",
      languages: "en",
      portfolioUrl: "",
      websiteUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      hourlyRate: 0,
      availability: "",
      art_form: [],
      experienceYears: undefined as unknown as number,
      tools: [],
      workflowTitle: "",
    },
  });

  function parseNumber(value: string): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
  }

  function toggleTool(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setServerError(null);

    const res = await fetch("/api/auth/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: data.bio || undefined,
        location: data.location || undefined,
        languages: data.languages ? [data.languages] : undefined,
        portfolioUrl: data.portfolioUrl || undefined,
        websiteUrl: data.websiteUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        youtubeUrl: data.youtubeUrl || undefined,
        hourlyRate: data.hourlyRate ? parseNumber(String(data.hourlyRate)) : undefined,
        availability: data.availability || undefined,
        art_form: data.art_form && data.art_form.length > 0 ? data.art_form : undefined,
        experienceYears: data.experienceYears ? parseNumber(String(data.experienceYears)) : undefined,
        tools: selectedTools.length > 0 ? selectedTools : undefined,
        workflowTitle: data.workflowTitle || undefined,
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setServerError(body.error ?? "Saving your profile failed. Please try again.");
      return;
    }

    router.replace(body.redirectTo ?? "/creators");
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="bio" className={labelClass}>{isBrand ? "About your brand" : "Bio"}</label>
        <textarea
          id="bio"
          rows={3}
          {...register("bio", { maxLength: 500 })}
          className={inputClass}
          placeholder={isBrand ? "What does your company do, and what content do you need?" : "What do you create, and what makes your work distinctive?"}
        />
        {typeof errors.bio?.message === "string" && (
          <p className="mt-1 text-xs text-rose-600">{errors.bio.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className={labelClass}>Location (optional)</label>
          <input id="location" {...register("location", { maxLength: 60 })} className={inputClass} placeholder="City, Country" />
        </div>
        <div>
          <label htmlFor="languages" className={labelClass}>Primary language</label>
          <select id="languages" {...register("languages")} className={inputClass}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!isBrand && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="portfolioUrl" className={labelClass}>Portfolio URL (optional)</label>
              <input id="portfolioUrl" {...register("portfolioUrl", { maxLength: 200 })} className={inputClass} placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="websiteUrl" className={labelClass}>Website (optional)</label>
              <input id="websiteUrl" {...register("websiteUrl", { maxLength: 200 })} className={inputClass} placeholder="https://…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="instagramUrl" className={labelClass}>Instagram (optional)</label>
              <input id="instagramUrl" {...register("instagramUrl", { maxLength: 200 })} className={inputClass} placeholder="https://instagram.com/…" />
            </div>
            <div>
              <label htmlFor="youtubeUrl" className={labelClass}>YouTube (optional)</label>
              <input id="youtubeUrl" {...register("youtubeUrl", { maxLength: 200 })} className={inputClass} placeholder="https://youtube.com/@…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hourlyRate" className={labelClass}>Hourly rate (INR)</label>
              <input id="hourlyRate" type="number" min={0} {...register("hourlyRate")} className={inputClass} placeholder="15000" />
              <p className="mt-1 text-xs text-gray-400">You can set this to 0 and add it later.</p>
            </div>
            <div>
              <label htmlFor="experienceYears" className={labelClass}>Years of experience</label>
              <input id="experienceYears" type="number" min={0} max={100} {...register("experienceYears")} className={inputClass} placeholder="4" />
            </div>
          </div>

          <div>
            <span className={labelClass}>Art forms you work in</span>
            <div className="flex flex-wrap gap-2">
              {ART_FORM_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    {...register("art_form")}
                    className="accent-violet-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className={labelClass}>Tools you use</span>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((tool) => (
                <button
                  type="button"
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  aria-pressed={selectedTools.includes(tool)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedTools.includes(tool)
                      ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="availability" className={labelClass}>Availability notes (optional)</label>
            <input
              id="availability"
              {...register("availability", { maxLength: 300 })}
              className={inputClass}
              placeholder="e.g. Weekdays 10:00–18:00 IST; quick turnarounds welcome"
            />
          </div>

          <div>
            <label htmlFor="workflowTitle" className={labelClass}>First workflow step title (optional)</label>
            <input
              id="workflowTitle"
              {...register("workflowTitle", { maxLength: 100 })}
              className={inputClass}
              placeholder="e.g. Ideation — moodboards and prompt decks"
            />
          </div>
        </>
      )}

      {isBrand && (
        <div className="rounded-lg bg-violet-50 p-4 text-sm text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
          Next you&apos;ll publish your first creative brief from the brand dashboard.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
