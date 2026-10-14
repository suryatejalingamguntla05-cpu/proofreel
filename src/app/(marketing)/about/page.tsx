import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, Fingerprint, FileCheck, Sparkles, XCircle, CheckCircle2, BadgeCheck } from "lucide-react";
import { BRAND, PROOF_PILLARS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Why Proofreel — the evidence-first creator marketplace",
  description:
    "Why we built a marketplace that separates identity, craft and deal evidence instead of handing out one meaningless verification badge.",
};

const PILLAR_ICONS = { Fingerprint, Sparkles, FileCheck } as const;

/** The failure modes this product exists to answer. */
const BROKEN = [
  {
    title: "Portfolios without provenance",
    body: "A reel looks stunning and nobody can tell which model, which prompt, how many iterations, or how much of it was a stock pack. The buyer finds out after the invoice.",
  },
  {
    title: "One badge for everything",
    body: "A single tick claims email, identity, brand deals and reach all at once. When it turns out one of those is thin, the whole signal is worthless.",
  },
  {
    title: "Terms that live in a DM",
    body: "Usage rights, exclusivity, revision counts and deadlines get agreed in chat and remembered differently by each side three weeks later.",
  },
];

/** Non-negotiables. Written as refusals because that is what they actually are. */
const REFUSALS = [
  "No global verified badge. Ever.",
  "No invented metrics — every number carries a source and a timestamp.",
  "No reselling model access or marking up someone else's API.",
  "No API key in the browser bundle, in a log, or in a screenshot.",
  "No fake empty states that pretend a filter is a bug. An empty result names the filter that caused it.",
];

/** Honest build status. A pitch that hides its gaps is not evidence-based. */
const SHIPPED = [
  "Discovery with skills, tools/models, content type, budget, language and availability filters",
  "Creator profiles with tools & AI models, production workflow and verification state",
  "Structured briefs: scope, platforms, ratios, budget, deadline, usage rights, revisions",
  "Seven-step AI Brief Builder with a deterministic fallback when no key is configured",
  "A connectable AI model catalogue with per-vendor server variable names",
];

const NOT_SHIPPED = [
  "The signed-in dashboard (creator, brand, messages, settings) is scaffolded but not implemented",
  "No live database in this build — the catalogue is bundled static demo data",
  "Registration and sign-in need a real Supabase project and a genuine service-role key",
  "Discovery filtering runs client-side; there is no pagination or server-side search",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="eyebrow">Why {BRAND.name}</p>
        <h1 className="heading-xl mt-6">
          The market filled up with
          <br />
          <span className="bg-iris-sweep bg-clip-text text-transparent">creators nobody can verify.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-300">
          Generative tools made output cheap. They did not make authorship easier to prove — they made it harder.{" "}
          {BRAND.name} exists to make the proof the product, not the marketing.
        </p>
      </section>

      {/* What's broken */}
      <section className="mt-20">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
          <AlertTriangle className="h-6 w-6 text-amber-300" /> Three things that keep breaking
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {BROKEN.map((item) => (
            <article key={item.title} className="surface p-6">
              <h3 className="font-display text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Evidence layers */}
      <section id="evidence" className="mt-24 scroll-mt-24">
        <div className="max-w-2xl">
          <p className="eyebrow">The fix</p>
          <h2 className="heading-lg mt-5">Separate evidence into layers you can inspect one at a time.</h2>
          <p className="mt-4 text-ink-300">
            A buyer should be able to trust the craft without betting on the reach claim, and trust the deal terms
            without auditing the person&apos;s identity. So we never merge them.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PROOF_PILLARS.map((pillar, index) => {
            const Icon = PILLAR_ICONS[pillar.icon as keyof typeof PILLAR_ICONS] ?? BadgeCheck;
            return (
              <article key={pillar.id} className="surface-raised p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent-400/25 bg-accent-400/10">
                    <Icon className="h-5 w-5 text-accent-300" />
                  </span>
                  <span className="font-display text-3xl font-bold text-white/10">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-1 text-sm font-medium text-accent-300">{pillar.claim}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-400">{pillar.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Refusals */}
      <section className="mt-24">
        <div className="surface p-8">
          <h2 className="font-display text-2xl font-bold text-white">What we refuse to do</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {REFUSALS.map((rule) => (
              <li key={rule} className="flex gap-3 text-sm leading-relaxed text-ink-300">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Honest status */}
      <section className="mt-24 grid gap-5 lg:grid-cols-2">
        <div className="surface-raised p-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <CheckCircle2 className="h-5 w-5 text-accent-400" /> Working in this build
          </h2>
          <ul className="mt-5 space-y-3">
            {SHIPPED.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-400/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface p-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <AlertTriangle className="h-5 w-5 text-amber-300" /> Not built yet
          </h2>
          <ul className="mt-5 space-y-3">
            {NOT_SHIPPED.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-400">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-ink-500">
            Published deliberately: a marketplace about evidence cannot ship a page that overstates itself.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center">
        <h2 className="heading-lg">Start with the evidence you already have.</h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/creators" className="btn-primary">
            Browse the catalogue <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/about#evidence" className="btn-ghost">
            Review the evidence layers
          </Link>
        </div>
      </section>
    </div>
  );
}
