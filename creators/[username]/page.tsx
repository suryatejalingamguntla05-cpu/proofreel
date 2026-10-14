import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Languages, ExternalLink, Sparkles, Instagram, Youtube, Globe, Cpu, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { computeProofPassportScore } from "@/lib/services/creator-service";
import { getDemoCreatorByUsername, getDemoPortfolio, getDemoTools } from "@/lib/demo/database";
import { formatMinorUnits } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: { username: string } };

type CreatorDetail = {
  id: string;
  profile_id: string;
  portfolio_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  art_form: string[] | null;
  specialty: string | null;
  experience_years: number | null;
  availability: string | null;
  hourly_rate_minor: number;
  min_project_size_minor: number;
  is_profile_verified: boolean;
  /** AI models/services behind the tools (demo data); may be absent for live rows. */
  models?: string[];
  profiles: {
    display_name: string;
    username: string;
    bio: string | null;
    location: string | null;
    languages: string[];
    avatar_url: string | null;
  };
};

type PublicPortfolioItem = {
  id: string;
  title: string;
  category: string;
  content_type: string;
  image_url: string | null;
  url: string | null;
  is_public: boolean;
  is_owned_by_creator: boolean;
};

type LoadedCreator = {
  creator: CreatorDetail;
  portfolio: PublicPortfolioItem[];
  tools: Array<{ tool_name: string; workflow_step: string }>;
  workflow: Array<{ title: string; description: string | null }>;
  usingDemo: boolean;
};

/**
 * Load a public creator profile from the live database, falling back to the
 * bundled demo database when Supabase is unavailable or unseeded. Returns null
 * only when the username exists in neither source (→ 404).
 */
async function loadCreator(username: string): Promise<LoadedCreator | null> {
  try {
    // Public profile: only is_public creators are readable here (also RLS-enforced).
    const { data, error } = await supabase
      .from("creator_profiles")
      .select(
        `
      id, profile_id, portfolio_url, website_url, instagram_url, youtube_url,
      art_form, specialty, experience_years, availability,
      hourly_rate_minor, min_project_size_minor, is_profile_verified,
      profiles!inner (display_name, username, bio, location, languages, avatar_url, is_public, role)
    `
      )
      .eq("profiles.username", username)
      .eq("profiles.is_public", true)
      .eq("profiles.role", "creator")
      .maybeSingle();

    if (error || !data) throw error ?? new Error("creator not found");

    const creator = data as unknown as CreatorDetail;

    // Load visible proof signals: portfolio, documented tools, and workflow.
    const [portfolioResult, toolsResult, workflowResult] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("id, title, category, content_type, image_url, url, is_public, is_owned_by_creator")
        .eq("creator_profile_id", creator.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("creator_tools")
        .select("tool_name, workflow_step")
        .eq("creator_profile_id", creator.id),
      supabase
        .from("creator_workflow")
        .select("title, description, step_order")
        .eq("creator_profile_id", creator.id)
        .order("step_order", { ascending: true }),
    ]);

    return {
      creator,
      portfolio: (portfolioResult.data ?? []) as unknown as PublicPortfolioItem[],
      tools: (toolsResult.data ?? []) as unknown as Array<{ tool_name: string; workflow_step: string }>,
      workflow: (workflowResult.data ?? []) as unknown as Array<{ title: string; description: string | null }>,
      usingDemo: false,
    };
  } catch {
    // Live database unavailable or unseeded — serve the bundled demo record.
    const demo = getDemoCreatorByUsername(username);
    if (!demo) return null;
    return {
      creator: demo as unknown as CreatorDetail,
      portfolio: getDemoPortfolio(demo.id),
      tools: getDemoTools(demo.id),
      workflow: demo.workflow.map((w) => ({ title: w.title, description: w.description })),
      usingDemo: true,
    };
  }
}

export default async function CreatorPublicProfilePage({ params }: PageProps) {
  const loaded = await loadCreator(params.username);
  if (!loaded) {
    notFound();
  }

  const { creator, portfolio, tools, workflow, usingDemo } = loaded;

  const passport = computeProofPassportScore(
    {
      bio: creator.profiles.bio,
      location: creator.profiles.location,
      is_profile_verified: creator.is_profile_verified,
      availability: creator.availability,
      hourly_rate_minor: creator.hourly_rate_minor,
      min_project_size_minor: creator.min_project_size_minor,
      art_form: creator.art_form ?? undefined,
    },
    { portfolioCount: portfolio.length, toolsCount: tools.length }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {usingDemo && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Demo profile — bundled sample data. No live database connected.
        </p>
      )}

      {/* Header */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-neutral-900">
            {creator.profiles.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.profiles.avatar_url} alt={creator.profiles.display_name} className="mx-auto h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-3xl font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {creator.profiles.display_name.charAt(0)}
              </div>
            )}
            <h1 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">{creator.profiles.display_name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{creator.profiles.username}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
              {creator.is_profile_verified ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">Verified tools &amp; workflow</span>
                </>
              ) : (
                <span className="text-gray-400">Verification pending</span>
              )}
            </p>
            {creator.profiles.location && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3" /> {creator.profiles.location}
              </p>
            )}
            {creator.availability && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Clock className="h-3 w-3" /> {creator.availability}
              </p>
            )}
            {(creator.profiles.languages ?? []).length > 0 && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
                <Languages className="h-3 w-3" /> {creator.profiles.languages.join(", ")}
              </p>
            )}

            <div className="mt-4 flex justify-center gap-2">
              {creator.website_url && (
                <a href={creator.website_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 p-2 text-gray-400 hover:text-gray-600 dark:border-gray-700" aria-label="Website">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {creator.instagram_url && (
                <a href={creator.instagram_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 p-2 text-gray-400 hover:text-gray-600 dark:border-gray-700" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {creator.youtube_url && (
                <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 p-2 text-gray-400 hover:text-gray-600 dark:border-gray-700" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>

            {creator.hourly_rate_minor > 0 && (
              <p className="mt-4 text-sm">
                <span className="text-xs text-gray-400">From </span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatMinorUnits(creator.min_project_size_minor > 0 ? creator.min_project_size_minor : creator.hourly_rate_minor)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Bio & specialty */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About</h2>
            {creator.profiles.bio ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{creator.profiles.bio}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-400">The creator has not written a bio yet.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {(creator.art_form ?? []).length > 0 ? (
                creator.art_form!.map((s) => (
                  <span key={s} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    {s.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No art forms listed yet.</span>
              )}
            </div>
            {creator.specialty && (
              <p className="mt-3 text-xs text-gray-400">
                <Sparkles className="mr-1 inline h-3 w-3" />
                {creator.specialty}
                {creator.experience_years ? ` — ${creator.experience_years} yrs experience` : ""}
              </p>
            )}
          </section>

          {/* Proof passport */}
          <ProofPassportSection passport={passport} verified={creator.is_profile_verified} />

          {/* Tools & AI models — the "how was this made" signal brands need */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tools &amp; AI models</h2>
            {tools.length === 0 && (creator.models ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">No tools documented yet.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {tools.map((t) => (
                  <span
                    key={t.tool_name}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-neutral-800 dark:text-gray-300"
                  >
                    {t.tool_name}
                  </span>
                ))}
              </div>
            )}
            {(creator.models ?? []).length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  AI models / services used
                </p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {creator.models!.map((m) => (
                    <li key={m} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <Cpu className="h-3.5 w-3.5 text-violet-500" /> {m}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* Workflow — evidence of an AI-native process */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Production workflow</h2>
            {workflow.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">No workflow documented yet.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {workflow.map((step, i) => (
                  <li key={`${step.title}-${i}`} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
                      {step.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Portfolio */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Portfolio ({portfolio.length})</h2>
            {portfolio.length === 0 ? (
              <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-neutral-900">
                No public portfolio items yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {portfolio.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-neutral-900">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-gray-100 text-xs text-gray-400 dark:bg-neutral-800">
                        No preview
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="mt-1 text-xs text-gray-400">{item.category} · {item.content_type}</p>
                      <p className="mt-2 text-[11px] text-gray-400">
                        {item.is_owned_by_creator ? "Creator asserts ownership" : "Ownership not asserted"}
                      </p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-500">
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Report link (platform moderation, not public abuse) */}
      <p className="mt-10 text-center text-xs text-gray-400">
        {usingDemo ? "Demo view" : "Live view"} ·{" "}
        <Link href="/creators" className="underline hover:text-gray-600">
          back to discovery
        </Link>
      </p>
    </div>
  );
}

function ProofPassportSection({ passport, verified }: { passport: ReturnType<typeof computeProofPassportScore>; verified: boolean }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Proof Passport</h2>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          {passport.score}/100
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Object.entries(passport.factors).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-neutral-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">{key.replace(/_/g, " ")}</span>
            <span
              className={`text-xs font-semibold ${
                value === "strong" || value === "reviewed"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : value === "partial"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-400"
              }`}
            >
              {value === "reviewed" && verified ? "reviewed" : value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-gray-400">
        Scores reflect on-platform data only. Signals labeled “pending” or “empty” have not been reviewed by admins.
      </p>
    </section>
  );
}
