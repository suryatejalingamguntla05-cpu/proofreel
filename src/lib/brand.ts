/**
 * src/lib/brand.ts
 * ---------------------------------------------------------------------------
 * Single source of truth for the product identity.
 *
 * Why this file exists: the brand name, tagline and proof vocabulary were
 * previously inlined in a dozen components, so a rename meant a dozen edits and
 * the wording drifted between pages. Import from here instead.
 */

export const BRAND = {
  /** Public product name. */
  name: "Proofreel",
  /** Short form used in tight spaces (logo lockup, mobile). */
  shortName: "Proofreel",
  /** Legal / footer entity. */
  legalName: "Proofreel Labs",
  /** Package-style identifier, kept in sync with package.json. */
  slug: "proofreel",
  /** Two-character monogram fallback when SVG can't render. */
  monogram: "PR",
  tagline: "Proof, not promises.",
  /** One-line positioning statement. */
  oneLiner: "The evidence-backed marketplace for AI creators.",
  /** Longer description for metadata and the footer. */
  description:
    "Proofreel connects brands with AI creators whose portfolios, tools and workflows are documented rather than claimed — so every shortlist is defensible.",
  domain: "proofreel.app",
} as const;

/** Primary navigation. Order is deliberate: discover, then define, then ship. */
export const PRIMARY_NAV = [
  { href: "/creators", label: "Discover" },
  { href: "/briefs", label: "Briefs" },
  { href: "/about", label: "Why Proofreel" },
] as const;

/**
 * The three evidence layers Proofreel separates. Kept together (rather than in
 * individual pages) so the marketplace, profiles and About page never disagree
 * about what "verified" means.
 */
export const PROOF_PILLARS = [
  {
    id: "identity",
    title: "Identity proof",
    claim: "A real person, once.",
    detail:
      "Email, handle and account age are checked individually. There is no single global badge that hides which of them is missing.",
    icon: "Fingerprint",
  },
  {
    id: "craft",
    title: "Craft proof",
    claim: "The work is theirs.",
    detail:
      "Every deliverable carries the tools and models used to make it, plus the workflow that produced it. Judge the process, not the caption.",
    icon: "Sparkles",
  },
  {
    id: "deal",
    title: "Deal proof",
    claim: "The price is real.",
    detail:
      "Budgets, usage rights, revisions and deadlines are structured data on the brief — not buried in a DM you have to screenshot later.",
    icon: "FileCheck",
  },
] as const;

/** Headline numbers shown on the marketing page (demo catalogue, labelled as such). */
export const MARKET_STATS = [
  { value: "10", label: "Creators in the demo catalogue" },
  { value: "3", label: "Evidence layers on every profile" },
  { value: "7", label: "Steps in the AI brief builder" },
  { value: "0", label: "Fake verification badges" },
] as const;

/** How a brief travels from idea to delivery. */
export const WORKFLOW_STEPS = [
  {
    title: "Draft in the Brief Builder",
    body: "Drop in a rough idea. The builder expands it into deliverables, platforms, aspect ratios, budget and usage rights — and you can edit every field.",
  },
  {
    title: "Filter on what actually matters",
    body: "Screen by skill, tool or model, content type, budget, language and availability. Combine them freely; the empty state tells you which filter removed the last match.",
  },
  {
    title: "Shortlist with evidence",
    body: "Each candidate shows the models behind their work, their workflow and their verification state. Compare like an engineer, not a fan.",
  },
  {
    title: "Agree the terms in writing",
    body: "Usage rights, licence notes and revision counts are pinned to the brief, so the commercial terms survive the handoff to production.",
  },
] as const;
