// ---------------------------------------------------------------------------
// Brief authoring
// ---------------------------------------------------------------------------
export type BriefField = "campaign_goal" | "audience" | "content_type" | "style" | "deliverable_count"
  | "platforms" | "aspect_ratios" | "budget" | "deadline" | "license_and_usage"
  | "revision_requirements" | "preferred_tools";

export type BriefInput = {
  campaign_goal: string;
  audience: string;
  content_type: string;
  style: string;
  deliverable_count: number;
  platforms: string[];
  aspect_ratios: string[];
  budget: number; // in minor units
  deadline: string;
  license_and_usage: string;
  revision_requirements: string;
  preferred_tools: string[];
};

export type AIGeneratedBrief = BriefInput & {
  source: "ai" | "template";
  ai_model?: string;
  ai_prompt?: string;
  confidence?: number; // only present when AI-generated
};
