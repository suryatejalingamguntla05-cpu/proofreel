"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fromDraftToFormPayload } from "@/lib/brief-draft-mapper";
import { CONTENT_TYPES, PLATFORMS, ASPECT_RATIOS, USAGE_RIGHTS } from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800";
const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";
const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs font-medium ${
    active
      ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
  }`;

type Payload = ReturnType<typeof fromDraftToFormPayload>;

export function BriefForm({ initialData, editingId }: { initialData?: Payload; editingId?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<Payload>(
    initialData ?? {
      title: "",
      objective: "",
      targetAudience: "",
      style: "",
      content_type: "motion",
      deliverablesCount: 1,
      platforms: ["instagram"],
      aspectRatios: ["16:9"],
      budget: 50000,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      licenseNotes: "",
      revisionCount: 2,
      preferredTools: [],
      usageRights: ["social", "paid_ads"],
      status: "published",
      generatedByAi: false,
    }
  );

  function update<K extends keyof Payload>(key: K, value: Payload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleIn<K extends "platforms" | "aspectRatios" | "usageRights" | "preferredTools" | "content_type">(
    key: K,
    value: (Payload[K] extends (infer T)[] ? T : Payload[K]) & string
  ) {
    setForm((f) => {
      if (key === "content_type") return f;
      const arr = (f[key] as unknown as string[]) ?? [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...f, [key]: next } as Payload;
    });
  }

  function validate(): string | null {
    if (form.title.trim().length < 8) return "Title must be at least 8 characters.";
    if (form.objective.trim().length < 40) return "Objective must be at least 40 characters.";
    if (!CONTENT_TYPES.includes(form.content_type as (typeof CONTENT_TYPES)[number])) return "Pick a valid content type.";
    if (!Number.isInteger(form.deliverablesCount) || form.deliverablesCount < 1 || form.deliverablesCount > 20) return "Deliverable count must be 1–20.";
    if (form.platforms.length === 0) return "Pick at least one platform.";
    if (form.aspectRatios.length === 0) return "Pick at least one aspect ratio.";
    if (form.budget < 1000) return "Budget must be at least 1000 minor units.";
    const deadlineDate = new Date(form.deadline);
    if (Number.isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) return "Deadline must be in the future.";
    if (form.licenseNotes.trim().length < 20) return "License notes must be at least 20 characters.";
    if (form.revisionCount < 0 || form.revisionCount > 20) return "Revisions must be 0–20.";
    if (!Number.isInteger(form.budget)) return "Budget must be a whole number of minor units.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(editingId ? `/api/briefs/${editingId}` : "/api/briefs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; redirectTo?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to publish brief");
      }
      router.push(body.redirectTo ?? "/brand/briefs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish brief.");
    } finally {
      setSubmitting(false);
    }
  }

  function convertToNativeType(value: string) {
    return value;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>Brief title</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Lunar Launch — Brand Film"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="objective" className={labelClass}>Objective (40+ chars)</label>
        <textarea
          id="objective"
          rows={3}
          value={form.objective}
          onChange={(e) => update("objective", e.target.value)}
          placeholder="What outcome and message should the creative deliver?"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="audience" className={labelClass}>Target audience</label>
          <input id="audience" value={form.targetAudience ?? ""} onChange={(e) => update("targetAudience", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="style" className={labelClass}>Style</label>
          <input id="style" value={form.style ?? ""} onChange={(e) => update("style", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className={labelClass}>Content type</span>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={form.content_type === t}
                onClick={() => update("content_type", t)}
                className={chipClass(form.content_type === t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="deliverablesCount" className={labelClass}>Deliverables (1–20)</label>
          <input
            id="deliverablesCount"
            type="number"
            min={1}
            max={20}
            value={form.deliverablesCount}
            onChange={(e) => update("deliverablesCount", Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Platforms</span>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={form.platforms.includes(p)}
              onClick={() => toggleIn("platforms", p)}
              className={chipClass(form.platforms.includes(p))}
            >
              {p.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={labelClass}>Aspect ratios</span>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={form.aspectRatios.includes(r)}
              onClick={() => toggleIn("aspectRatios", r)}
              className={chipClass(form.aspectRatios.includes(r))}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className={labelClass}>Budget (minor units)</label>
          <input
            id="budget"
            type="number"
            min={1000}
            value={form.budget}
            onChange={(e) => update("budget", Math.max(1000, Number(e.target.value) || 1000))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="deadline" className={labelClass}>Deadline</label>
          <input
            id="deadline"
            type="date"
            value={form.deadline.slice(0, 10)}
            onChange={(e) => update("deadline", convertToNativeType(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="licenseNotes" className={labelClass}>License / usage notes (20+ chars)</label>
        <textarea
          id="licenseNotes"
          rows={3}
          value={form.licenseNotes}
          onChange={(e) => update("licenseNotes", e.target.value)}
          placeholder="e.g. Paid ads and organic social worldwide for 12 months; resale excluded"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="revisionCount" className={labelClass}>Revisions included (0–20)</label>
          <input
            id="revisionCount"
            type="number"
            min={0}
            max={20}
            value={form.revisionCount}
            onChange={(e) => update("revisionCount", Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
            className={inputClass}
          />
        </div>
        <div>
          <span className={labelClass}>Usage rights</span>
          <div className="flex flex-wrap gap-2">
            {USAGE_RIGHTS.map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={form.usageRights.includes(u)}
                onClick={() => toggleIn("usageRights", u)}
                className={chipClass(form.usageRights.includes(u))}
              >
                {u.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="preferredTools" className={labelClass}>Preferred tools (comma-separated, optional)</label>
        <textarea
          id="preferredTools"
          rows={2}
          value={form.preferredTools.join(", ")}
          onChange={(e) => update("preferredTools", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          placeholder="Runway, Blender, After Effects"
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : editingId ? "Save changes" : "Publish brief"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
