import { CreatorFiltersClient } from "./creator-filters-client";
import { CreatorGridClient } from "./creator-grid-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creators — Proofreel",
  description: "Discover AI creators with portfolios and evidence-backed proof signals.",
};

type SearchParams = {
  q?: string;
  content_type?: string;
  budget_min?: string;
  budget_max?: string;
  language?: string;
  availability?: string;
  skill?: string;
  tools?: string;
  verified?: string;
};

const toList = (value?: string) =>
  value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];

export default async function CreatorsPage({ searchParams }: { searchParams: SearchParams }) {
  const languages = toList(searchParams.language);
  const skills = toList(searchParams.skill);
  const tools = toList(searchParams.tools);

  return (
    <div className="bg-gray-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creator discovery</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Browse AI creators with portfolios, documented tools, and evidence-backed proof signals.
          </p>
        </header>

        {(searchParams.q ||
          searchParams.content_type ||
          searchParams.availability ||
          skills.length > 0 ||
          tools.length > 0) && (
          <p className="mb-4 text-xs text-gray-400">
            Filters applied to the bundled demo catalog below.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <CreatorFiltersClient initial={{ searchParams }} />
            </div>
          </aside>
          <div className="lg:col-span-3">
            <CreatorGridClient
              q={searchParams.q}
              skills={skills}
              tools={tools}
              contentType={searchParams.content_type}
              budgetMin={searchParams.budget_min ? Number(searchParams.budget_min) : undefined}
              budgetMax={searchParams.budget_max ? Number(searchParams.budget_max) : undefined}
              languages={languages}
              availability={searchParams.availability}
              verifiedOnly={searchParams.verified === "1"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 0;
