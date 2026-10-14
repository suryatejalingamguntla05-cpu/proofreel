"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { DEMO_SKILL_OPTIONS, DEMO_TOOL_OPTIONS } from "@/lib/demo/database";

const CONTENT_TYPE_OPTIONS = ["motion", "still", "3d", "ui", "audio", "writing"] as const;

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "bn", label: "Bengali" },
  { value: "ur", label: "Urdu" },
];

type FilterState = {
  q: string;
  content_type: string;
  budget_min: string;
  budget_max: string;
  language: string;
  availability: string;
  skills: string[];
  tools: string[];
  verified: boolean;
};

const toList = (value?: string) => (value ? value.split(",").map((v) => v.trim()).filter(Boolean) : []);

export function CreatorFiltersClient({ initial }: { initial: { searchParams: Record<string, string | undefined> } }) {
  const router = useRouter();
  const [state, setState] = useState<FilterState>({
    q: initial.searchParams.q ?? "",
    content_type: initial.searchParams.content_type ?? "",
    budget_min: initial.searchParams.budget_min ?? "",
    budget_max: initial.searchParams.budget_max ?? "",
    language: initial.searchParams.language ?? "",
    availability: initial.searchParams.availability ?? "",
    skills: toList(initial.searchParams.skill),
    tools: toList(initial.searchParams.tools),
    verified: initial.searchParams.verified === "1",
  });

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleList(key: "skills" | "tools", value: string) {
    setState((s) => {
      const current = s[key];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...s, [key]: next };
    });
  }

  function apply() {
    const params = new URLSearchParams();
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.content_type) params.set("content_type", state.content_type);
    if (state.skills.length) params.set("skill", state.skills.join(","));
    if (state.tools.length) params.set("tools", state.tools.join(","));
    if (state.budget_min) params.set("budget_min", state.budget_min);
    if (state.budget_max) params.set("budget_max", state.budget_max);
    if (state.language) params.set("language", state.language);
    if (state.availability.trim()) params.set("availability", state.availability.trim());
    if (state.verified) params.set("verified", "1");
    const qs = params.toString();
    router.push(qs ? `/creators?${qs}` : "/creators");
  }

  function clear() {
    setState({
      q: "",
      content_type: "",
      budget_min: "",
      budget_max: "",
      language: "",
      availability: "",
      skills: [],
      tools: [],
      verified: false,
    });
    router.push("/creators");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800";
  const chipClass = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11px] font-medium ${
      active
        ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
        : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
    }`;

  const activeCount =
    state.skills.length +
    state.tools.length +
    (state.q ? 1 : 0) +
    (state.content_type ? 1 : 0) +
    (state.language ? 1 : 0) +
    (state.availability ? 1 : 0) +
    (state.budget_min ? 1 : 0) +
    (state.budget_max ? 1 : 0) +
    (state.verified ? 1 : 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-neutral-900">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <SlidersHorizontal className="h-4 w-4" /> Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {activeCount}
          </span>
        )}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        className="space-y-4"
        noValidate
      >
        <input
          type="search"
          placeholder="Search name or bio…"
          value={state.q}
          onChange={(e) => update("q", e.target.value)}
          aria-label="Search creators"
          className={inputClass}
        />

        <div>
          <span className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Skills / specialization
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                aria-pressed={state.skills.includes(skill)}
                onClick={() => toggleList("skills", skill)}
                className={chipClass(state.skills.includes(skill))}
              >
                {skill.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Tools / AI models
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_TOOL_OPTIONS.map((tool) => (
              <button
                key={tool}
                type="button"
                aria-pressed={state.tools.includes(tool)}
                onClick={() => toggleList("tools", tool)}
                className={chipClass(state.tools.includes(tool))}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <select
          value={state.content_type}
          onChange={(e) => update("content_type", e.target.value)}
          aria-label="Content type"
          className={inputClass}
        >
          <option value="">All content types</option>
          {CONTENT_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min ₹ (minor)"
            value={state.budget_min}
            onChange={(e) => update("budget_min", e.target.value)}
            aria-label="Minimum budget in minor units"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            placeholder="Max ₹ (minor)"
            value={state.budget_max}
            onChange={(e) => update("budget_max", e.target.value)}
            aria-label="Maximum budget in minor units"
            className={inputClass}
          />
        </div>

        <select
          value={state.language}
          onChange={(e) => update("language", e.target.value)}
          aria-label="Language"
          className={inputClass}
        >
          <option value="">Any language</option>
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <input
          placeholder="Availability keyword…"
          value={state.availability}
          onChange={(e) => update("availability", e.target.value)}
          aria-label="Availability keyword"
          className={inputClass}
        />

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={state.verified}
            onChange={(e) => update("verified", e.target.checked)}
            className="accent-violet-600"
          />
          Verified creators only
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </form>
    </div>
  );
}
