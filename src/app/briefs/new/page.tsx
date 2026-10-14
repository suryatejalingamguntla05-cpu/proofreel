import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BriefBuilder } from "@/components/briefs/brief-builder";

export const metadata = {
  title: "Brief Builder — Proofreel",
  description: "Turn a rough idea into a complete, structured creative brief.",
};

export default function NewBriefPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/briefs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> All briefs
      </Link>

      <p className="mb-6 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
        Demo mode — the AI-assisted builder runs end to end; publishing shows the structured brief
        instead of writing to a database.
      </p>

      <BriefBuilder demoMode />
    </div>
  );
}
