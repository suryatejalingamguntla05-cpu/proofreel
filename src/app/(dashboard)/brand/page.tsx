import Link from "next/link";
import { ArrowRight, FilePlus2, Users } from "lucide-react";
import { DEMO_BRIEFS } from "@/lib/demo/database";
import { getDemoSessionFromServer } from "@/lib/demo/session";

export const metadata = { title: "Brand workspace — Proofreel" };

export default async function BrandWorkspacePage() {
  const session = await getDemoSessionFromServer();
  const briefs = DEMO_BRIEFS.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          Brand & agency workspace · demo
        </p>
        <h1 className="mt-2 text-3xl font-bold">{session?.companyName || session?.displayName || "Welcome"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Find the right creative partner, shape a clear brief, and explore how a campaign could come together.
          Demo activity stays in this browser and is not submitted to a backend.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/briefs/new" className="group rounded-2xl border border-violet-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-violet-900 dark:bg-neutral-900">
          <FilePlus2 className="h-6 w-6 text-violet-600 dark:text-violet-300" />
          <h2 className="mt-4 text-lg font-semibold">Build a creative brief</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Outline deliverables, budget, timing, and usage rights.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Open brief builder <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
        <Link href="/creators" className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-neutral-900">
          <Users className="h-6 w-6 text-violet-600 dark:text-violet-300" />
          <h2 className="mt-4 text-lg font-semibold">Explore creators</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Browse sample profiles, portfolios, skills, and rates.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Find a creative partner <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Sample briefs</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A preview of the kind of work shared on Proofreel.</p>
          </div>
          <Link href="/briefs" className="text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300">Browse all</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {briefs.map((brief) => (
            <article key={brief.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-neutral-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">{brief.content_type}</p>
              <h3 className="mt-2 font-semibold">{brief.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{brief.objective}</p>
              <p className="mt-4 text-sm font-medium">₹{(brief.total_budget_minor / 100).toLocaleString("en-IN")} budget</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
