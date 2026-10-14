import Link from "next/link";
import { Clock, Tag, Wallet } from "lucide-react";
import { formatDate, formatMinorUnits } from "@/lib/utils";
import type { brief } from "@/types/database";

type BriefCardProps = {
  brief: brief;
};

export function BriefCard({ brief }: BriefCardProps) {
  const due = new Date(brief.deadline_at ?? "");
  const isPast = due < new Date();

  return (
    <Link
      href={`/briefs/${brief.id}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          {brief.content_type}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {brief.platforms?.join(", ") || "social"}
        </span>
        {isPast && (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            Due {formatDate(brief.deadline_at)}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400">
        {brief.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{brief.objective}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" /> {brief.deliverables_count} deliverable(s)
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Wallet className="w-3.5 h-3.5" /> {formatMinorUnits(brief.total_budget_minor)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-400 dark:border-gray-800">
        <span className="flex items-center gap-1">
          <Tag className="w-4 h-4" /> {brief.revision_count} revision(s) included
        </span>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
          {brief.status}
        </span>
      </div>
    </Link>
  );
}
