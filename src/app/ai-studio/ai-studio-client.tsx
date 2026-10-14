"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleDashed, Key, MinusCircle, Search, Sparkles } from "lucide-react";
import { AI_CAPABILITIES, type AiCapabilityId, type Integration } from "@/lib/ai/catalog";
import { cn } from "@/lib/utils";

export type IntegrationView = Integration & { connected: boolean; partial: boolean };

const CAPABILITY_LABEL: Record<AiCapabilityId, string> = {
  brief: "Brief intelligence",
  visual: "Visual generation",
  motion: "Motion generation",
  audio: "Audio & voice",
  pipeline: "Pipeline & delivery",
  proof: "Proof feeds",
};

function StatusPill({ view }: { view: IntegrationView }) {
  if (view.connected) {
    return (
      <span className="chip-proof">
        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
      </span>
    );
  }
  if (view.partial) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
        <MinusCircle className="h-3.5 w-3.5" /> Partly set
      </span>
    );
  }
  return <span className="chip-meta">Available</span>;
}

function IntegrationCard({ view }: { view: IntegrationView }) {
  return (
    <article className="surface-raised flex flex-col gap-4 p-5 transition-colors hover:border-brand-400/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-white">{view.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-500">
            {CAPABILITY_LABEL[view.capability]}
          </p>
        </div>
        <StatusPill view={view} />
      </div>

      <p className="text-sm leading-relaxed text-ink-400">{view.summary}</p>

      <p className="rounded-xl border border-accent-400/20 bg-accent-400/[0.06] p-3 text-sm leading-relaxed text-accent-100">
        <Sparkles className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px text-accent-300" />
        {view.unlocks}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Key className="h-3.5 w-3.5 text-ink-500" />
        {view.envVars.map((name) => (
          <code
            key={name}
            className="rounded-md border border-white/10 bg-ink-950/70 px-1.5 py-0.5 font-mono text-[11px] text-ink-300"
          >
            {name}
          </code>
        ))}
      </div>

      <a
        href={view.docsUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200"
      >
        Read the API docs <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}

export function AiStudioClient({ integrations }: { integrations: IntegrationView[] }) {
  const [capability, setCapability] = useState<AiCapabilityId | "all">("all");
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: integrations.length };
    for (const cap of AI_CAPABILITIES) {
      map[cap.id] = integrations.filter((i) => i.capability === cap.id).length;
    }
    return map;
  }, [integrations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return integrations.filter((i) => {
      if (capability !== "all" && i.capability !== capability) return false;
      if (onlyAvailable && i.connected) return false;
      if (!q) return true;
      return [i.name, i.summary, i.unlocks, ...i.envVars].join(" ").toLowerCase().includes(q);
    });
  }, [integrations, capability, onlyAvailable, query]);

  const activeCapability =
    capability === "all" ? null : AI_CAPABILITIES.find((c) => c.id === capability) ?? null;

  const reset = () => {
    setCapability("all");
    setQuery("");
    setOnlyAvailable(false);
  };

  return (
    <div>
      {/* Controls */}
      <div className="surface sticky top-16 z-30 mt-10 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Capability">
            <button
              role="tab"
              aria-selected={capability === "all"}
              onClick={() => setCapability("all")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                capability === "all"
                  ? "bg-brand-600 text-white"
                  : "border border-white/10 text-ink-300 hover:bg-white/5 hover:text-white"
              )}
            >
              All <span className="text-xs opacity-70">{counts.all}</span>
            </button>
            {AI_CAPABILITIES.map((cap) => (
              <button
                key={cap.id}
                role="tab"
                aria-selected={capability === cap.id}
                onClick={() => setCapability(cap.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  capability === cap.id
                    ? "bg-brand-600 text-white"
                    : "border border-white/10 text-ink-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {cap.label} <span className="text-xs opacity-70">{counts[cap.id]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/60 px-2.5 py-2">
              <Search className="h-4 w-4 text-ink-500" />
              <span className="sr-only">Search integrations</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models or variables…"
                className="w-44 bg-transparent text-sm text-white placeholder:text-ink-500 focus:outline-none sm:w-56"
              />
            </label>
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-ink-300">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-ink-950 accent-brand-500"
              />
              Not connected
            </label>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <p className="mt-6 text-sm text-ink-400">
        Showing <span className="font-semibold text-white">{filtered.length}</span> of {integrations.length}{" "}
        integrations
        {activeCapability ? ` in ${activeCapability.label}` : ""}
        {onlyAvailable ? " · not yet connected" : ""}
        {query.trim() ? ` · matching “${query.trim()}”` : ""}.
        {activeCapability ? <span className="ml-1 text-ink-500">{activeCapability.blurb}</span> : null}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="surface mt-6 p-10 text-center">
          <CircleDashed className="mx-auto h-8 w-8 text-ink-500" />
          <h3 className="mt-4 font-display text-lg font-semibold text-white">No integration matches</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            Nothing matched
            {activeCapability ? ` ${activeCapability.label}` : " any capability"}
            {onlyAvailable ? " · not connected" : ""}
            {query.trim() ? ` · “${query.trim()}”` : ""}. The catalogue has {integrations.length} entries.
          </p>
          <button onClick={reset} className="btn-ghost mt-5">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((view) => (
            <IntegrationCard key={view.slug} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}
