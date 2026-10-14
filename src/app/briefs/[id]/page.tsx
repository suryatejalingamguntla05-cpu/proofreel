import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Layers,
  Wallet,
  ShieldCheck,
  RotateCcw,
  Wrench,
  Scale,
  Monitor,
  Crop,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getDemoBriefById, type DemoBrief } from "@/lib/demo/database";
import { formatMinorUnits, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: { id: string } };

type BriefDetail = {
  id: string;
  title: string;
  objective: string;
  target_audience: string | null;
  style: string | null;
  content_type: string;
  deliverables_count: number;
  platforms: string[];
  aspect_ratios: string[];
  total_budget_minor: number;
  deadline_at: string;
  license_notes: string | null;
  revision_count: number;
  preferred_tools: string[];
  usage_rights: string[];
  status: string;
  brand_name: string | null;
  brand_username: string | null;
};

async function loadBrief(id: string): Promise<{ brief: BriefDetail; usingDemo: boolean } | null> {
  try {
    const { data, error } = await supabase
      .from("briefs")
      .select(
        `
        *,
        brand_profile: brand_profiles!brand_profile_id (
          company_name,
          profiles ( display_name, username )
        )
      `
      )
      .eq("id", id)
      .single();
    if (error || !data) throw error ?? new Error("brief not found");

    const row = data as Record<string, unknown> & {
      brand_profile?: { company_name?: string | null; profiles?: { username?: string | null } };
    };
    return {
      brief: {
        id: String(row.id),
        title: String(row.title),
        objective: String(row.objective ?? ""),
        target_audience: (row.target_audience as string) ?? null,
        style: (row.style as string) ?? null,
        content_type: String(row.content_type ?? ""),
        deliverables_count: Number(row.deliverables_count ?? 0),
        platforms: (row.platforms as string[]) ?? [],
        aspect_ratios: (row.aspect_ratios as string[]) ?? [],
        total_budget_minor: Number(row.total_budget_minor ?? 0),
        deadline_at: String(row.deadline_at ?? ""),
        license_notes: (row.license_notes as string) ?? null,
        revision_count: Number(row.revision_count ?? 0),
        preferred_tools: (row.preferred_tools as string[]) ?? [],
        usage_rights: (row.usage_rights as string[]) ?? [],
        status: String(row.status ?? "published"),
        brand_name: row.brand_profile?.company_name ?? null,
        brand_username: row.brand_profile?.profiles?.username ?? null,
      },
      usingDemo: false,
    };
  } catch {
    const demo = getDemoBriefById(id);
    if (!demo) return null;
    return { brief: fromDemo(demo), usingDemo: true };
  }
}

function fromDemo(b: DemoBrief): BriefDetail {
  return {
    id: b.id,
    title: b.title,
    objective: b.objective,
    target_audience: null,
    style: null,
    content_type: b.content_type,
    deliverables_count: b.deliverables_count,
    platforms: b.platforms,
    aspect_ratios: b.aspect_ratios,
    total_budget_minor: b.total_budget_minor,
    deadline_at: b.deadline_at,
    license_notes: b.license_notes,
    revision_count: b.revision_count,
    preferred_tools: b.preferred_tools,
    usage_rights: b.usage_rights,
    status: b.status,
    brand_name: b.brand_profiles.company_name,
    brand_username: b.brand_profiles.profiles.username,
  };
}

export default async function BriefDetailPage({ params }: PageProps) {
  const loaded = await loadBrief(params.id);
  if (!loaded) notFound();

  const { brief, usingDemo } = loaded;
  const due = new Date(brief.deadline_at);
  const isPast = !Number.isNaN(due.getTime()) && due.getTime() < Date.now();

  const specs: [string, string][] = [
    ["Content type", brief.content_type],
    ["Deliverables", `${brief.deliverables_count}`],
    ["Platforms", brief.platforms.join(", ") || "—"],
    ["Aspect ratios", brief.aspect_ratios.join(", ") || "—"],
    ["Budget", formatMinorUnits(brief.total_budget_minor)],
    ["Deadline", formatDate(brief.deadline_at)],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/briefs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> All briefs
      </Link>

      {usingDemo && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Demo brief — bundled sample data. No live database connected.
        </p>
      )}

      <header className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {brief.content_type}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-medium ${
              isPast
                ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            }`}
          >
            {isPast ? "Closed" : "Open"}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
            {brief.status}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{brief.title}</h1>
        {(brief.brand_name || brief.brand_username) && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {brief.brand_name}
            {brief.brand_username ? ` · @${brief.brand_username}` : ""}
          </p>
        )}

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{brief.objective}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {specs.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-neutral-800">
              <p className="text-[11px] text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <Wallet className="h-4 w-4 text-violet-500" /> Commercial use
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Scale className="h-3.5 w-3.5" /> Usage rights
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {brief.usage_rights.length > 0 ? (
                  brief.usage_rights.map((u) => (
                    <span
                      key={u}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-neutral-800 dark:text-gray-400"
                    >
                      {u.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Licence &amp; usage notes</dt>
              <dd className="mt-1 text-gray-700 dark:text-gray-300">
                {brief.license_notes ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <RotateCcw className="h-3.5 w-3.5" /> Revision rounds included
              </dt>
              <dd className="mt-1 flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {brief.revision_count}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <Wrench className="h-4 w-4 text-violet-500" /> Preferred tools
          </h2>
          {brief.preferred_tools.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {brief.preferred_tools.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">No tool preference stated.</p>
          )}

          <div className="mt-5 space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <p className="flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5" /> Platforms: {brief.platforms.join(", ") || "—"}
            </p>
            <p className="flex items-center gap-1.5">
              <Crop className="h-3.5 w-3.5" /> Formats: {brief.aspect_ratios.join(", ") || "—"}
            </p>
            <p className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> {brief.deliverables_count} deliverable
              {brief.deliverables_count === 1 ? "" : "s"}
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Due {formatDate(brief.deadline_at)}
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/creators"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Find matching creators
        </Link>
        <Link
          href="/briefs/new"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Build another brief
        </Link>
      </div>
    </div>
  );
}
