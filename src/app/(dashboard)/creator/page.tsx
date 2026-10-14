import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Compass } from "lucide-react";
import { DEMO_CREATORS } from "@/lib/demo/database";
import { getDemoSessionFromServer } from "@/lib/demo/session";

export const metadata = { title: "Creator workspace — Proofreel" };

export default async function CreatorWorkspacePage() {
  const session = await getDemoSessionFromServer();
  const profile = DEMO_CREATORS.find((creator) => creator.profiles.username === session?.username) ?? DEMO_CREATORS[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          Creator workspace · demo
        </p>
        <h1 className="mt-2 text-3xl font-bold">Good to see you, {session?.displayName || profile.profiles.display_name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Discover opportunities, sharpen your profile, and see how your creative work can be presented to brands.
          This demo doesn’t publish changes or store applications.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/briefs" className="group rounded-2xl border border-violet-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-violet-900 dark:bg-neutral-900">
          <BriefcaseBusiness className="h-6 w-6 text-violet-600 dark:text-violet-300" />
          <h2 className="mt-4 text-lg font-semibold">Find your next brief</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Explore sample projects from brands and agencies.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Browse briefs <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
        <Link href="/creators" className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-neutral-900">
          <Compass className="h-6 w-6 text-violet-600 dark:text-violet-300" />
          <h2 className="mt-4 text-lg font-semibold">Explore the community</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">See how other creators present their skills and work.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Discover creators <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sample creator profile</p>
            <h2 className="mt-2 text-xl font-bold">{profile.profiles.display_name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{profile.specialty} · {profile.profiles.location}</p>
          </div>
          <Link href={`/creators/${profile.profiles.username}`} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            View profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-gray-600 dark:text-gray-300">{profile.profiles.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.art_form.map((skill) => (
            <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300">{skill}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
