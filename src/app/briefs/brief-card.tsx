import Link from "next/link";
import { CalendarClock, Layers, Wallet, ShieldCheck } from "lucide-react";
import { formatMinorUnits, formatDate } from "@/lib/utils";

type BriefCardData = {
  id: string;
  title: string;
  objective: string;
  content_type: string;
  deliverables_count: number;
  platforms: string[];
  aspect_ratios: string[];
  total_budget_minor: number;
  deadline_at: string;
  revision_count: number;
  usage_rights: string[];
  status: string;
  brand_profiles?: { company_name: string | null; profiles?: { display_name: string | null; username: string | null; avatar_url: string | null } };
};

export function BriefCard({ brief }: { brief: BriefCardData }) {
  const due = new Date(brief.deadline_at);
  const isPast = !Number.isNaN(due.getTime()) && due.getTime() < Date.now();

  return (
    <Link
      href={`/briefs/${brief.id}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          {brief.content_type}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
          {brief.platforms?.length ? brief.platforms.slice(0, 2).join(" · ") : "social"}
        </span>
        {isPast && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            Closed
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-400">
        {brief.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{brief.objective}</p>

      {brief.brand_profiles?.company_name && (
        <p className="mt-3 text-xs text-gray-400">
          {brief.brand_profiles.company_name} · @{brief.brand_profiles.profiles?.username ?? "brand"}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5" /> {formatMinorUnits(brief.total_budget_minor)}
        </span>
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> {brief.deliverables_count} deliverable{brief.deliverables_count === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" /> Due {formatDate(brief.deadline_at)}
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> {brief.revision_count} revisions
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {brief.usage_rights.slice(0, 3).map((u) => (
          <span key={u} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
            {u.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </Link>
  );
}
