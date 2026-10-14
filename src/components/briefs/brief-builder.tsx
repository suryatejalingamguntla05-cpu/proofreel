"use client";

import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, Wand2, Send, AlertTriangle } from "lucide-react";
import { BriefDraftSchema, type BriefDraft, CONTENT_TYPE_VALUES, PLATFORM_VALUES, ASPECT_RATIO_VALUES } from "@/lib/ai/fallback";

const STEPS = ["Goal", "Audience", "Content", "Platform", "Budget", "License", "Review"] as const;
type StepName = (typeof STEPS)[number];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800";
const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

const TOOL_OPTIONS = ["Runway", "Pika", "ElevenLabs", "Blender", "After Effects", "Figma", "DaVinci Resolve", "Midjourney", "Stable Diffusion"];

type PublishedPreview = {
  title: string;
  objective: string;
  targetAudience: string;
  style: string;
  content_type: string;
  deliverablesCount: number;
  platforms: string[];
  aspectRatios: string[];
  budget: number;
  deadline: Date;
  licenseNotes: string;
  revisionCount: number;
  preferredTools: string[];
  usageRights: string[];
  status: string;
  generatedByAi: boolean;
};

/**
 * `demoMode` keeps the brief builder usable without a database: publishing
 * shows the structured brief the brand just assembled instead of POSTing it.
 */
export function BriefBuilder({ demoMode = false }: { demoMode?: boolean } = {}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<BriefDraft>({
    campaign_goal: "",
    audience: "",
    content_type: "motion",
    style: "",
    deliverable_count: 1,
    platforms: ["instagram"],
    aspect_ratios: ["16:9"],
    budget: 50000,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    license_and_usage: "",
    revision_requirements: "",
    preferred_tools: [],
  });
  const [source, setSource] = useState<"ai" | "template" | "manual">("manual");
  const [aiWarning, setAiWarning] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedPreview, setPublishedPreview] = useState<PublishedPreview | null>(null);

  const step = STEPS[stepIndex];

  function update<K extends keyof BriefDraft>(key: K, value: BriefDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function toggleIn<K extends "platforms" | "aspect_ratios" | "preferred_tools">(key: K, value: BriefDraft[K][number]) {
    setDraft((d) => {
      const current = d[key] as string[];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...d, [key]: next } as BriefDraft;
    });
  }

  function stepValid(name: StepName): string | null {
    switch (name) {
      case "Goal":
        return draft.campaign_goal.trim().length >= 8 ? null : "Describe the campaign goal (min 8 characters).";
      case "Audience":
        return draft.audience.trim().length >= 5 ? null : "Describe the audience (min 5 characters).";
      case "Content":
        return null;
      case "Platform":
        return draft.platforms.length > 0 ? null : "Pick at least one platform.";
      case "Budget":
        return draft.budget >= 1000 ? null : "Budget must be at least 1000 minor units.";
      case "License":
        return draft.license_and_usage.trim().length >= 10 ? null : "Describe licensing/usage (min 10 characters).";
      case "Review":
        return null;
    }
  }

  async function generateWithAi() {
    setAiLoading(true);
    setAiWarning(null);
    setBuildError(null);
    try {
      const res = await fetch("/api/ai/brief-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_goal: draft.campaign_goal || "Introduce the brand with compelling creative content",
          audience: draft.audience || "General adult audience",
          content_type: draft.content_type,
          deliverable_count: draft.deliverable_count,
          platforms: draft.platforms,
          aspect_ratios: draft.aspect_ratios,
          budget: draft.budget,
          deadline: draft.deadline,
          license_and_usage: draft.license_and_usage || undefined,
          revision_requirements: draft.revision_requirements || undefined,
          preferred_tools: draft.preferred_tools,
          style: draft.style || undefined,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        brief?: BriefDraft;
        source?: "ai" | "template";
        warning?: string | null;
        error?: string;
      };
      if (!res.ok || !body.brief) {
        throw new Error(body.error ?? "AI builder failed");
      }
      setDraft(body.brief);
      setSource(body.source ?? "template");
      setAiWarning(body.warning ?? null);
      setStepIndex(0); // restart review from the top with generated content
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : "AI builder failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function publish() {
    setPublishing(true);
    setPublishError(null);
    try {
      // Client-side final validation before submission.
      BriefDraftSchema.parse(draft);

      const payload: PublishedPreview = {
        title: draft.campaign_goal.slice(0, 80),
        objective:
          draft.audience.length >= 40
            ? draft.audience
            : `${draft.audience} — ${draft.campaign_goal}`,
        targetAudience: draft.audience,
        style: draft.style,
        content_type: draft.content_type,
        deliverablesCount: draft.deliverable_count,
        platforms: draft.platforms,
        aspectRatios: draft.aspect_ratios,
        budget: draft.budget,
        deadline: new Date(draft.deadline),
        licenseNotes: draft.license_and_usage,
        revisionCount: parseInt(draft.revision_requirements, 10) || 0,
        preferredTools: draft.preferred_tools,
        usageRights: ["social", "paid_ads"],
        status: "published",
        generatedByAi: source === "ai",
      };

      if (demoMode) {
        setPublishedPreview(payload);
        return;
      }

      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; redirectTo?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to publish brief");
      }
      window.location.href = body.redirectTo ?? "/brand/briefs";
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish brief");
    } finally {
      setPublishing(false);
    }
  }

  const canContinue = stepValid(step) === null;

  if (publishedPreview) {
    const fields: [string, string][] = [
      ["Title", publishedPreview.title],
      ["Objective", publishedPreview.objective],
      ["Target audience", publishedPreview.targetAudience],
      ["Content type", publishedPreview.content_type],
      ["Style", publishedPreview.style || "—"],
      ["Deliverables", String(publishedPreview.deliverablesCount)],
      ["Platforms", publishedPreview.platforms.join(", ")],
      ["Aspect ratios", publishedPreview.aspectRatios.join(", ")],
      ["Budget", `₹${(publishedPreview.budget / 100).toLocaleString("en-IN")}`],
      ["Deadline", publishedPreview.deadline.toISOString().slice(0, 10)],
      ["Licence & usage", publishedPreview.licenseNotes],
      ["Revisions", String(publishedPreview.revisionCount)],
      ["Usage rights", publishedPreview.usageRights.join(", ")],
      ["Preferred tools", publishedPreview.preferredTools.join(", ") || "—"],
      ["Draft origin", publishedPreview.generatedByAi ? "AI-assisted" : "Manual"],
    ];

    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-900/20">
          <h1 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Brief ready</h1>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            Demo mode — no database is connected, so this structured brief was not saved. In
            production it publishes straight to the brand dashboard and is matched to creators.
          </p>
        </div>

        <dl className="mt-6 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white px-6 dark:divide-gray-800 dark:border-gray-800 dark:bg-neutral-900">
          {fields.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="shrink-0 font-medium text-gray-500 dark:text-gray-400">{k}</dt>
              <dd className="text-right text-gray-900 dark:text-gray-100">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPublishedPreview(null)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Edit again
          </button>
          <a
            href="/briefs"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            View published briefs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brief Builder</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Seven short steps. Optionally let the AI draft a brief for you to edit — it is a starting point, not a mandate.
          {source === "ai" && <span className="ml-1 font-medium text-violet-600">Draft generated by AI.</span>}
          {source === "template" && <span className="ml-1 font-medium text-amber-600">Draft built from a local template.</span>}
        </p>
      </div>

      {aiWarning && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{aiWarning}</span>
        </div>
      )}
      {buildError && (
        <div role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {buildError}
        </div>
      )}

      {/* Progress */}
      <ol className="mb-8 flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => i <= stepIndex && setStepIndex(i)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                i === stepIndex
                  ? "bg-violet-600 text-white"
                  : i < stepIndex
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    : "bg-gray-100 text-gray-400 dark:bg-neutral-800"
              }`}
            >
              <span>{i + 1}</span> {s}
            </button>
          </li>
        ))}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (stepIndex < STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
          } else {
            void publish();
          }
        }}
        noValidate
      >
        {step === "Goal" && (
          <div className="space-y-3">
            <label htmlFor="goal" className={labelClass}>What is the campaign goal?</label>
            <textarea
              id="goal"
              rows={4}
              value={draft.campaign_goal}
              onChange={(e) => update("campaign_goal", e.target.value)}
              placeholder="e.g. Launch our new product line with a 45-second brand film for Instagram and YouTube"
              className={inputClass}
            />
          </div>
        )}

        {step === "Audience" && (
          <div className="space-y-3">
            <label htmlFor="audience" className={labelClass}>Who is it for?</label>
            <textarea
              id="audience"
              rows={3}
              value={draft.audience}
              onChange={(e) => update("audience", e.target.value)}
              placeholder="e.g. Design-conscious adults 25-40 in metro cities"
              className={inputClass}
            />
          </div>
        )}

        {step === "Content" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="contentType" className={labelClass}>Content type</label>
              <select id="contentType" value={draft.content_type} onChange={(e) => update("content_type", e.target.value as BriefDraft["content_type"])} className={inputClass}>
                {CONTENT_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="style" className={labelClass}>Style (optional)</label>
              <input id="style" value={draft.style} onChange={(e) => update("style", e.target.value)} placeholder="e.g. clean, cinematic, playful" className={inputClass} />
            </div>
            <div>
              <label htmlFor="deliverables" className={labelClass}>Number of deliverables</label>
              <input
                id="deliverables"
                type="number"
                min={1}
                max={20}
                value={draft.deliverable_count}
                onChange={(e) => update("deliverable_count", Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {step === "Platform" && (
          <div className="space-y-4">
            <span className={labelClass}>Platforms (at least one)</span>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_VALUES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => toggleIn("platforms", p)}
                  aria-pressed={draft.platforms.includes(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    draft.platforms.includes(p)
                      ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>
            <span className={labelClass}>Aspect ratios</span>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIO_VALUES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggleIn("aspect_ratios", r)}
                  aria-pressed={draft.aspect_ratios.includes(r)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    draft.aspect_ratios.includes(r)
                      ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "Budget" && (
          <div className="space-y-3">
            <label htmlFor="budget" className={labelClass}>Budget (minor units; 100000 = ₹1,000)</label>
            <input
              id="budget"
              type="range"
              min={1000}
              max={2000000}
              step={5000}
              value={draft.budget}
              onChange={(e) => update("budget", Number(e.target.value))}
              className="w-full"
              aria-describedby="budget-value"
            />
            <p id="budget-value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ₹{(draft.budget / 100).toLocaleString("en-IN")}
            </p>
            <label htmlFor="deadline" className={labelClass}>Deadline</label>
            <input id="deadline" type="date" value={draft.deadline.slice(0, 10)} onChange={(e) => update("deadline", e.target.value)} className={inputClass} />
          </div>
        )}

        {step === "License" && (
          <div className="space-y-3">
            <label htmlFor="license" className={labelClass}>Licensing &amp; usage</label>
            <textarea
              id="license"
              rows={3}
              value={draft.license_and_usage}
              onChange={(e) => update("license_and_usage", e.target.value)}
              placeholder="e.g. Paid ads and organic social, worldwide, 12 months"
              className={inputClass}
            />
            <label htmlFor="revisions" className={labelClass}>Revision expectations</label>
            <input
              id="revisions"
              value={draft.revision_requirements}
              onChange={(e) => update("revision_requirements", e.target.value)}
              placeholder="e.g. Include two revision rounds on final deliverables"
              className={inputClass}
            />
            <span className={labelClass}>Preferred tools (optional)</span>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((tool) => (
                <button
                  type="button"
                  key={tool}
                  onClick={() => toggleIn("preferred_tools", tool)}
                  aria-pressed={draft.preferred_tools.includes(tool)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    draft.preferred_tools.includes(tool)
                      ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "Review" && (
          <div className="space-y-3 text-sm">
            <dl className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                ["Goal", draft.campaign_goal],
                ["Audience", draft.audience],
                ["Content type", draft.content_type],
                ["Style", draft.style || "—"],
                ["Deliverables", String(draft.deliverable_count)],
                ["Platforms", draft.platforms.join(", ")],
                ["Aspect ratios", draft.aspect_ratios.join(", ")],
                ["Budget", `₹${(draft.budget / 100).toLocaleString("en-IN")}`],
                ["Deadline", draft.deadline],
                ["License", draft.license_and_usage],
                ["Revisions", draft.revision_requirements || "—"],
                ["Tools", draft.preferred_tools.join(", ") || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                  <dt className="shrink-0 font-medium text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="text-right text-gray-900 dark:text-gray-100">{v}</dd>
                </div>
              ))}
            </dl>
            {publishError && (
              <div role="alert" className="rounded-md bg-rose-50 p-3 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                {publishError}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <div>
            {step === "Goal" && (
              <button
                type="button"
                onClick={() => void generateWithAi()}
                disabled={aiLoading}
                className="flex items-center gap-2 rounded-lg border border-violet-600 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:text-violet-300"
              >
                {aiLoading ? <Wand2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiLoading ? "Drafting…" : "Generate draft with AI"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex(stepIndex - 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            {stepIndex < STEPS.length - 1 ? (
              <button
                type="submit"
                disabled={!canContinue}
                className="flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={publishing || briefDraftInvalid(draft)}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {publishing ? "Publishing…" : "Publish brief"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function briefDraftInvalid(draft: BriefDraft): boolean {
  try {
    BriefDraftSchema.parse(draft);
    return false;
  } catch {
    return true;
  }
}
