/**
 * src/lib/services/matching-service.ts
 * ---------------------------------------------------------------------------
 * Deterministic creative-fit scoring between a published brief and a creator.
 *
 * Weights (sum to 100):
 *   - Required skills match:                     30
 *   - Portfolio formats & style match:           25
 *   - Budget compatibility:                       20
 *   - Tools & workflow match:                     10
 *   - Evidence / completed platform work:         10
 *   - Availability:                                5
 *
 * Missing information NEVER earns full points — partial data yields partial
 * or zero score, and the report states exactly why.
 *
 * This score is an INTERNAL recommendation. It is not a guarantee of project
 * success, quality, or ownership claims.
 */

import type { brief, creatorProfile, portfolioItem, creatorTool } from "@/types/database";

/** Extended creator context used for scoring (joined by the caller). */
export type CreatorScoringContext = {
  creatorProfile: creatorProfile;
  publicPortfolio: portfolioItem[];
  tools: creatorTool[];
  latestMetricCount: number;
  completedCollaborations: number;
};

export type FitComponent = {
  label: string;
  weight: number;
  /** Points earned out of `weight`. */
  earned: number;
  detail: string;
};

export type FitReport = {
  /** 0-100, whole number. */
  overallScore: number;
  components: FitComponent[];
  matchingSkills: string[];
  relevantPortfolio: Array<{
    id: string;
    title: string;
    category: string;
    content_type: string;
    image_url: string | null;
    is_owned_by_creator: boolean;
  }>;
  isRecommendable: boolean;
  missingRequirements: string[];
  potentialConflicts: string[];
  reasons: string[];
};

const WEIGHTS = {
  skills: 30,
  portfolio: 25,
  budget: 20,
  tools: 10,
  evidence: 10,
  availability: 5,
} as const;

function norm(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((v) => v.toLowerCase().trim()).filter(Boolean);
}

function exactOverlap(requested: string[], offered: string[]): { common: string[]; ratio: number } {
  const offeredSet = new Set(offered);
  const common = requested.filter((s) => offeredSet.has(s));
  const denom = Math.max(requested.length, 1);
  return { common, ratio: common.length / denom };
}

/** Fuzzy partial overlap: fraction of requested tokens that appear as substrings. */
function partialOverlap(requested: string[], offered: string[]): number {
  if (requested.length === 0) return 0;
  const offeredText = offered.join(" ");
  let hits = 0;
  for (const token of requested) {
    if (offeredText.includes(token)) hits += 1;
  }
  return hits / requested.length;
}

function budgetCompatibility(briefBudgetMinor: number, hourlyMinor: number, minProjectMinor: number): { score: number; detail: string } {
  if (briefBudgetMinor <= 0) {
    return { score: 0, detail: "Brief has no budget set — cannot evaluate cost fit." };
  }
  const hasRate = hourlyMinor > 0;
  const hasMin = minProjectMinor > 0;
  if (!hasRate && !hasMin) {
    return { score: 0, detail: "Creator has not published rates or a minimum project size yet." };
  }

  // A deliverable-based estimate: min-projects floor, or hourly * ~20h fallback.
  const estimatedFloor = hasMin ? minProjectMinor : Math.round(hourlyMinor * 20);
  if (briefBudgetMinor >= estimatedFloor) {
    return {
      score: 1,
      detail: `Brief budget covers the creator's estimated minimum (${estimatedFloor} minor units).`,
    };
  }
  const deficit = Math.round(((estimatedFloor - briefBudgetMinor) / estimatedFloor) * 100);
  return {
    score: deficit <= 25 ? 0.5 : 0,
    detail: `Budget is ~${deficit}% below the creator's estimated minimum (${estimatedFloor} minor units).`,
  };
}

export function computeFitScore(
  briefData: brief,
  briefSkills: string[],
  context: CreatorScoringContext
): FitReport {
  const { creatorProfile, publicPortfolio, tools, latestMetricCount, completedCollaborations } = context;
  const missing: string[] = [];
  const conflicts: string[] = [];
  const reasons: string[] = [];
  const components: FitComponent[] = [];

  // --- 1. Required skills / content-type match (30) ---
  const requestedSkills = norm(briefSkills);
  const offeredSkills = norm(creatorProfile.art_form);
  const offeredCategories = norm(publicPortfolio.map((p) => p.category));
  const { common: skillCommon, ratio: skillExact } = exactOverlap(requestedSkills, offeredSkills);
  const skillPartial = partialOverlap(requestedSkills, [...offeredSkills, ...offeredCategories]);
  if (requestedSkills.length === 0) {
    missing.push("Brief does not list required skills, so skill fit cannot be evaluated.");
  } else if (skillCommon.length === 0) {
    missing.push("No required skills match the creator's listed art forms or portfolio categories.");
  }
  const skillScore = requestedSkills.length === 0 ? 0 : 0.6 * skillExact + 0.4 * skillPartial;
  const skillEarned = Math.round(skillScore * WEIGHTS.skills);
  components.push({
    label: "Required skills match",
    weight: WEIGHTS.skills,
    earned: skillEarned,
    detail:
      requestedSkills.length === 0
        ? "No skills specified in brief"
        : `${skillCommon.length}/${requestedSkills.length} skills listed by the creator match directly`,
  });
  reasons.push(
    requestedSkills.length === 0
      ? "Brief lists no required skills"
      : skillCommon.length > 0
        ? `Matched skills: ${skillCommon.join(", ")}`
        : "No direct skill matches"
  );

  // --- 2. Portfolio formats & style match (25) ---
  const contentType = (briefData.content_type ?? "").toLowerCase().trim();
  const styleTokens = norm(
    (briefData.style ? briefData.style.split(/[,\s]+/) : []).concat(
      briefData.target_audience ? briefData.target_audience.split(/[,\s]+/) : []
    )
  );
  const creatorStyleText = [
    creatorProfile.specialty ?? "",
    ...norm(publicPortfolio.map((p) => p.category)),
    ...norm(publicPortfolio.map((p) => p.content_type)),
  ]
    .join(" ")
    .toLowerCase();
  const styleHits = partialOverlap(styleTokens, [creatorStyleText]);

  let portfolioScore = 0;
  let portfolioDetail = "";
  if (publicPortfolio.length === 0) {
    portfolioDetail = "No public portfolio items to review.";
    missing.push("Creator has no public portfolio items that can be evaluated.");
  } else {
    const matchingItems = contentType
      ? publicPortfolio.filter(
          (p) => p.category === contentType || p.content_type === contentType
        )
      : [];
    const typeRatio = matchingItems.length / Math.max(publicPortfolio.length, 1);
    portfolioScore = 0.7 * (contentType ? typeRatio : 0) + 0.3 * styleHits;
    portfolioDetail = `${matchingItems.length} of ${publicPortfolio.length} public items match the brief's content type; style-language overlap ${(styleHits * 100).toFixed(0)}%.`;
    if (contentType && matchingItems.length === 0) {
      missing.push(`No public portfolio items in the "${contentType}" content type.`);
    }
  }
  const portfolioEarned = Math.round(portfolioScore * WEIGHTS.portfolio);
  components.push({
    label: "Portfolio formats & style match",
    weight: WEIGHTS.portfolio,
    earned: portfolioEarned,
    detail: portfolioDetail,
  });

  const relevant = (contentType
    ? publicPortfolio.filter((p) => p.category === contentType || p.content_type === contentType)
    : publicPortfolio.slice(0, 3)
  ).slice(0, 6);

  // --- 3. Budget compatibility (20) ---
  const budget = budgetCompatibility(
    briefData.total_budget_minor ?? 0,
    creatorProfile.hourly_rate_minor ?? 0,
    creatorProfile.min_project_size_minor ?? 0
  );
  const budgetEarned = Math.round(budget.score * WEIGHTS.budget);
  components.push({
    label: "Budget compatibility",
    weight: WEIGHTS.budget,
    earned: budgetEarned,
    detail: budget.detail,
  });

  // --- 4. Tools & workflow match (10) ---
  const requestedTools = norm(briefData.preferred_tools ?? []);
  const offeredTools = norm(tools.map((t) => t.tool_name));
  const toolExact = exactOverlap(requestedTools, offeredTools).ratio;
  const toolPartial = partialOverlap(requestedTools, offeredTools);
  if (offeredTools.length === 0) {
    missing.push("Creator has not documented any tools yet.");
  }
  const toolScore =
    requestedTools.length === 0
      ? 0.3 // some partial credit: tools unspecified by brief, cannot penalize fully
      : 0.5 * toolExact + 0.5 * toolPartial;
  const toolEarned = Math.round(toolScore * WEIGHTS.tools);
  components.push({
    label: "Tools & workflow match",
    weight: WEIGHTS.tools,
    earned: toolEarned,
    detail:
      requestedTools.length === 0
        ? "Brief lists no preferred tools; score is partial by design."
        : offeredTools.length === 0
          ? "Creator's tools are not documented."
          : `${requestedTools.filter((t) => offeredTools.includes(t)).length}/${requestedTools.length} preferred tools are documented by the creator.`,
  });

  // --- 5. Evidence & completed platform work (10) ---
  let evidenceScore = 0;
  const evidenceParts: string[] = [];
  if (latestMetricCount > 0) {
    evidenceScore += 0.4;
    evidenceParts.push(`${latestMetricCount} latest social metric snapshot(s)`);
  } else {
    missing.push("No social metric evidence recorded yet.");
  }
  if (completedCollaborations > 0) {
    evidenceScore += 0.6;
    evidenceParts.push(`${completedCollaborations} completed platform collaboration(s)`);
  } else {
    missing.push("No completed collaborations recorded on the platform yet.");
  }
  const evidenceEarned = Math.round(evidenceScore * WEIGHTS.evidence);
  components.push({
    label: "Evidence & completed platform work",
    weight: WEIGHTS.evidence,
    earned: evidenceEarned,
    detail: evidenceParts.length > 0 ? evidenceParts.join("; ") : "No evidence on record.",
  });

  // --- 6. Availability (5) ---
  const availability = creatorProfile.availability;
  const availabilityEarned = availability ? WEIGHTS.availability : 0;
  components.push({
    label: "Availability",
    weight: WEIGHTS.availability,
    earned: availabilityEarned,
    detail: availability ? `Stated: ${availability}` : "Availability not stated.",
  });
  if (!availability) missing.push("Availability is not stated, so scheduling fit is unknown.");

  // --- Licensing conflicts / notes ---
  if (creatorProfile.is_profile_verified === false) {
    conflicts.push("Creator identity not yet reviewed by an admin — treat proof signals as self-reported.");
  }
  const ownershipUnclear = publicPortfolio.filter((p) => !p.is_owned_by_creator);
  if (ownershipUnclear.length > 0) {
    conflicts.push(
      `${ownershipUnclear.length} portfolio item(s) do not assert creator ownership — clarify rights before contracting.`
    );
  }
  const briefUsage = norm(briefData.usage_rights ?? []);
  if (briefUsage.includes("theatrical") && !norm(creatorProfile.art_form).length) {
    conflicts.push("Theatrical usage requested; confirm the creator can license accordingly.");
  }

  const overall = components.reduce((sum, c) => sum + c.earned, 0);
  const isRecommendable =
    (briefData.status ?? "draft") === "published" &&
    overall >= 40 &&
    publicPortfolio.length > 0;

  return {
    overallScore: Math.min(overall, 100),
    components,
    matchingSkills: skillCommon,
    relevantPortfolio: relevant.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      content_type: p.content_type,
      image_url: p.image_url,
      is_owned_by_creator: p.is_owned_by_creator,
    })),
    isRecommendable,
    missingRequirements: missing,
    potentialConflicts: conflicts,
    reasons,
  };
}

/** Human-readable disclaimer attached to any rendered fit report. */
export const FIT_REPORT_DISCLAIMER =
  "This is an internal recommendation computed from on-platform data only. It is not a guarantee of quality, delivery, licensing status, or project success.";
