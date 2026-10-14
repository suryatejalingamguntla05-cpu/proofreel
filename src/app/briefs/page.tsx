import Link from "next/link";
import { BriefCard } from "./brief-card";
import { supabase } from "@/lib/supabase/client";
import { listDemoBriefs } from "@/lib/demo/database";
import type { brief } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creative briefs — Proofreel",
  description: "Browse published briefs from brands and agencies.",
};

type PageProps = { searchParams: { q?: string; content_type?: string; page?: string } };

export default async function BriefsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  type BriefRow = brief & {
    brand_profiles?: {
      company_name: string | null;
      profiles?: { display_name: string | null; username: string | null; avatar_url: string | null };
    };
  };

  let briefs: BriefRow[] = [];
  let total = 0;
  let usingDemo = false;

  try {
    let query = supabase
      .from("briefs")
      .select(
        `
      *,
      brand_profiles ( company_name, profiles ( display_name, username, avatar_url ) )
    `,
        { count: "exact" }
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (searchParams.q) {
      query = query.or(`title.ilike.%${searchParams.q}%,objective.ilike.%${searchParams.q}%`);
    }
    if (searchParams.content_type) {
      query = query.eq("content_type", searchParams.content_type);
    }

    const { data, error: queryError, count } = await query;
    if (queryError) throw queryError;
    briefs = (data ?? []) as unknown as BriefRow[];
    total = count ?? briefs.length;
  } catch {
    // Live database unavailable or unseeded — fall back to the bundled demo
    // records so the marketplace always renders for testing and demos.
    usingDemo = true;
  }

  if (usingDemo || briefs.length === 0) {
    usingDemo = true;
    const demoRows = listDemoBriefs({
      q: searchParams.q,
      content_type: searchParams.content_type,
    });
    total = demoRows.length;
    briefs = demoRows.slice(from, to) as unknown as BriefRow[];
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creative briefs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Published briefs from brands and agencies seeking AI creative work.
          </p>
          {usingDemo && (
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Showing bundled demo briefs — no live database connected.
            </p>
          )}
        </div>
        <Link
          href="/briefs/new"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + New brief
        </Link>
      </header>

      <form action="/briefs" method="GET" className="mb-6 flex gap-2" role="search">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search briefs…"
          aria-label="Search briefs"
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
        />
        <select
          name="content_type"
          defaultValue={searchParams.content_type ?? ""}
          aria-label="Content type"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-neutral-800"
        >
          <option value="">All types</option>
          {["motion", "still", "3d", "ui", "audio", "writing"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          Search
        </button>
      </form>

      {briefs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-neutral-900">
          <p className="text-base font-medium text-gray-900 dark:text-white">
            No published briefs found
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try clearing the search filters, or publish the first brief from a brand dashboard.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {briefs.map((b) => (
              <BriefCard key={b.id} brief={b} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              {page > 1 && (
                <Link href={`/briefs?page=${page - 1}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ""}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  Previous
                </Link>
              )}
              <span className="text-gray-500">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={`/briefs?page=${page + 1}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ""}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
