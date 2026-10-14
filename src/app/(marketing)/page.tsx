import Link from "next/link";
import {
  BadgeCheck,
  Fingerprint,
  FileCheck,
  Sparkles,
  Compass,
  PenLine,
} from "lucide-react";
import { BRAND, MARKET_STATS, PROOF_PILLARS, WORKFLOW_STEPS } from "@/lib/brand";

/** PROOF_PILLARS carries icon names as strings so brand.ts stays JSX-free. */
const PILLAR_ICONS = { Fingerprint, Sparkles, FileCheck } as const;

/** Illustrative evidence card in the hero — shows the product, not a screenshot. */
const DEMO_CARD = {
  name: "Aaraav Filmworks",
  role: "Motion & film · Bengaluru",
  proof: [
    { label: "Identity", value: "Email + handle confirmed" },
    { label: "Craft", value: "Runway Gen-3 Alpha · DaVinci" },
    { label: "Deal", value: "Usage rights: 12-month paid social" },
  ],
  skills: ["Storyboarding", "Motion design", "Colour"],
};

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.35]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-slide-up">
            <p className="eyebrow">
              <BadgeCheck className="h-3.5 w-3.5 text-accent-300" />
              Evidence-backed AI creator marketplace
            </p>
            <h1 className="heading-xl mt-6">
              {BRAND.tagline.split(",")[0]},
              <br />
              <span className="bg-iris-sweep bg-clip-text text-transparent">
                not promises.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
              {BRAND.oneLiner} Every profile separates identity, craft and deal evidence — so your shortlist survives
              the question <em className="not-italic text-white">“who actually made this?”</em>
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/creators" className="btn-primary">
                <Compass className="h-4 w-4" /> Discover creators
              </Link>
              <Link href="/briefs/new" className="btn-ghost">
                <PenLine className="h-4 w-4" /> Draft a brief
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
              {MARKET_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-bold text-white">{stat.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-ink-400">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Evidence card */}
          <div className="relative animate-float-slow lg:justify-self-end">
            <div className="surface-raised w-full max-w-md p-6 shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-white">{DEMO_CARD.name}</p>
                  <p className="mt-0.5 text-sm text-ink-400">{DEMO_CARD.role}</p>
                </div>
                <span className="chip-proof">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {DEMO_CARD.proof.map((row) => (
                  <li key={row.label} className="rounded-xl border border-white/10 bg-ink-950/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-300">{row.label}</p>
                    <p className="mt-1 text-sm text-ink-200">{row.value}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {DEMO_CARD.skills.map((skill) => (
                  <span key={skill} className="chip-meta">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-ink-500">
              Illustrative profile from the bundled demo catalogue
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- pillars */}
      <section id="evidence" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Three layers</p>
            <h2 className="heading-lg mt-5">“Verified” means nothing. Layered evidence means something.</h2>
            <p className="mt-4 text-ink-300">
              One badge hides everything it cannot prove. Proofreel keeps the layers apart, so you always know which
              claim is backed and which one is just loud.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PROOF_PILLARS.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon as keyof typeof PILLAR_ICONS] ?? BadgeCheck;
              return (
                <article key={pillar.id} className="surface p-7 transition-colors hover:border-brand-400/30">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand-400/30 bg-brand-600/20">
                    <Icon className="h-5 w-5 text-brand-200" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-1 text-sm font-medium text-accent-300">{pillar.claim}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-400">{pillar.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- workflow */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <p className="eyebrow">How a brief travels</p>
            <h2 className="heading-lg mt-5">From a rough sentence to signed terms.</h2>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.title} className="surface relative p-6">
                <span className="font-display text-4xl font-bold text-white/10">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="heading-lg">Post the brief. Get evidence back.</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            Publish a structured brief in minutes, or build a profile that shows the tools and workflow behind your
            work.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary">
              Create an account
            </Link>
            <Link href="/briefs" className="btn-ghost">
              See live briefs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
