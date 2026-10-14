"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, SearchX, ShieldCheck } from "lucide-react";
import { CreatorCard } from "./creator-card";
import type { creatorDiscoveryRow } from "@/types/database";
import { DEMO_CREATORS, getDemoPortfolio } from "@/lib/demo/database";

/**
 * Demo discovery catalog. Built from the central demo database so the demo
 * records, the filters and the creator profiles never drift apart.
 */
type DemoRow = creatorDiscoveryRow & { skills: string[]; models: string[]; verified: boolean };

const DEMO_ROWS: DemoRow[] = DEMO_CREATORS.map((c) => ({
  creator_profile_id: c.id,
  display_name: c.profiles.display_name,
  username: c.profiles.username,
  bio: c.profiles.bio,
  location: c.profiles.location,
  languages: c.profiles.languages,
  avatar_url: c.profiles.avatar_url,
  portfolio_items_public: 0,
  portfolio_items_total: 0,
  hourly_rate_minor: c.hourly_rate_minor,
  min_project_size_minor: c.min_project_size_minor,
  verification_status: c.is_profile_verified ? "Verified" : "Pending review",
  availability: c.availability,
  skills: c.skills,
  models: c.models,
  verified: c.is_profile_verified,
}));

/** Portfolio counts come from the demo portfolio builder. */
DEMO_ROWS.forEach((row, i) => {
  const items = getDemoPortfolio(DEMO_CREATORS[i].id);
  row.portfolio_items_public = items.length;
  row.portfolio_items_total = items.length;
});

const PAGE_SIZE = 6;

type Props = {
  q?: string;
  skills?: string[];
  contentType?: string;
  tools?: string[];
  budgetMin?: number;
  budgetMax?: number;
  languages?: string[];
  availability?: string;
  verifiedOnly?: boolean;
};

export function CreatorGridClient(props: Props = {}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [
    props.q,
    props.skills,
    props.contentType,
    props.tools,
    props.budgetMin,
    props.budgetMax,
    props.availability,
    props.verifiedOnly,
  ]);

  const { filtered, appliedFilters } = useMemo(() => {
    let rows = DEMO_ROWS;
    const applied: string[] = [];

    const q = props.q?.toLowerCase().trim();
    if (q) {
      rows = rows.filter((c) =>
        `${c.display_name} ${c.username} ${c.bio ?? ""} ${c.location ?? ""}`
          .toLowerCase()
          .includes(q)
      );
      applied.push(`matching “${props.q}”`);
    }

    // Skills: match the creator's skill tags (which include art forms).
    // A creator may match ANY of the selected skills, which is how a brand
    // looks for "motion OR 3d" talent.
    if (props.skills?.length) {
      rows = rows.filter((c) => props.skills!.some((s) => c.skills.includes(s)));
      applied.push(`skills: ${props.skills.join(", ")}`);
    }

    // Tools / models: match the base tool name (e.g. "Runway Gen-3 Alpha" → "Runway").
    if (props.tools?.length) {
      rows = rows.filter((c) =>
        props.tools!.some((t) => c.models.some((m) => m.toLowerCase().includes(t.toLowerCase())))
      );
      applied.push(`tools: ${props.tools.join(", ")}`);
    }

    // Content type is the portfolio category the creator has published in.
    if (props.contentType) {
      rows = rows.filter((c) => {
        const items = getDemoPortfolio(c.creator_profile_id);
        return items.some((item) => item.category === props.contentType);
      });
      applied.push(`content type: ${props.contentType}`);
    }

    const budgetMin = props.budgetMin ?? 0;
    const budgetMax = props.budgetMax ?? Number.MAX_SAFE_INTEGER;
    rows = rows.filter((c) => c.hourly_rate_minor >= budgetMin && c.hourly_rate_minor <= budgetMax);
    if (props.budgetMin || props.budgetMax) applied.push("budget range");

    if (props.languages?.length) {
      rows = rows.filter((c) => c.languages.some((l) => props.languages!.includes(l)));
      applied.push(`languages: ${props.languages.join(", ")}`);
    }

    if (props.availability) {
      const av = props.availability.toLowerCase();
      rows = rows.filter((c) => (c.availability ?? "").toLowerCase().includes(av));
      applied.push(`availability: ${props.availability}`);
    }

    if (props.verifiedOnly) {
      rows = rows.filter((c) => c.verified);
      applied.push("verified only");
    }

    return { filtered: rows, appliedFilters: applied };
  }, [
    props.q,
    props.skills,
    props.contentType,
    props.tools,
    props.languages,
    props.availability,
    props.budgetMin,
    props.budgetMax,
    props.verifiedOnly,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Sensible empty state: say exactly which filters removed every match and
  // give the brand a one-click way back to the full catalog.
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-neutral-900">
        <SearchX className="h-8 w-8 text-gray-400" />
        <p className="mt-3 text-base font-medium text-gray-900 dark:text-white">
          No creators match your filters
        </p>
        <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {appliedFilters.length > 0
            ? `Nothing matched ${appliedFilters.join(" · ")}. Try removing a filter — the demo catalog has ${DEMO_ROWS.length} creators.`
            : `The demo catalog has ${DEMO_ROWS.length} creators; none matched this combination.`}
        </p>
        <a
          href="/creators"
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Clear all filters
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>
          <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> demo
          creators
          {appliedFilters.length > 0 ? ` · ${appliedFilters.join(" · ")}` : ""}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <ShieldCheck className="h-3 w-3" /> {filtered.filter((c) => c.verified).length} verified
        </span>
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((creator) => (
          <CreatorCard key={creator.creator_profile_id} creator={creator} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
