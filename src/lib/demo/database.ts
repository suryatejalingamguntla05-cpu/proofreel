/**
 * src/lib/demo/database.ts
 * ---------------------------------------------------------------------------
 * Central DEMO DATABASE for testing and client demonstrations.
 *
 * This module is intentionally self-contained: it bundles clearly-labeled
 * sample records (creators, brands, portfolio, tools, briefs) so the public
 * marketplace surfaces render with rich content WITHOUT a live Supabase
 * connection.
 *
 * Usage:
 *   import { DEMO_MODE, listDemoBriefs, getDemoCreatorByUsername } from "@/lib/demo/database";
 *
 * Rules:
 *   * This data is DUMMY. It must never be written back to a real database.
 *   * Pages query live data first and only fall back here when the database is
 *     unavailable or unseeded, so the app always demos cleanly.
 */

// ---------------------------------------------------------------------------
// Mode flag
// ---------------------------------------------------------------------------
/** True when the app should prefer the bundled demo records. */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === undefined
    ? true // default ON so an unconfigured checkout still demos
    : process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export const DEMO_LABEL = "Demo data";

// ---------------------------------------------------------------------------
// Stable timestamps (avoid churn between renders)
// ---------------------------------------------------------------------------
const NOW = "2026-10-01T09:00:00.000Z";
const inDays = (days: number) => {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
};

// ---------------------------------------------------------------------------
// Types (mirror the shapes the pages consume)
// ---------------------------------------------------------------------------
export type DemoCreator = {
  id: string;
  profile_id: string;
  portfolio_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  art_form: string[];
  skills: string[];
  models: string[];
  specialty: string | null;
  experience_years: number | null;
  availability: string | null;
  hourly_rate_minor: number;
  min_project_size_minor: number;
  is_profile_verified: boolean;
  workflow: { title: string; description: string }[];
  profiles: {
    display_name: string;
    username: string;
    bio: string | null;
    location: string | null;
    languages: string[];
    avatar_url: string | null;
  };
};

export type DemoPortfolioItem = {
  id: string;
  title: string;
  category: string;
  content_type: string;
  image_url: string | null;
  url: string | null;
  is_public: boolean;
  is_owned_by_creator: boolean;
};

export type DemoTool = { tool_name: string; workflow_step: string };

export type DemoBrand = {
  id: string;
  company_name: string;
  username: string;
  industry: string | null;
  avatar_url: string | null;
};

export type DemoBrief = {
  id: string;
  title: string;
  objective: string;
  content_type: string;
  deliverables_count: number;
  platforms: string[];
  aspect_ratios: string[];
  total_budget_minor: number;
  deadline_at: string;
  revision_count: number;
  usage_rights: string[];
  license_notes: string;
  preferred_tools: string[];
  status: string;
  brand_profile_id: string;
  brand_profiles: {
    company_name: string | null;
    profiles: { display_name: string | null; username: string | null; avatar_url: string | null };
  };
};

const avatar = (seed: string) => `https://i.pravatar.cc/200?u=${encodeURIComponent(seed)}`;
const shot = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/400`;

// ---------------------------------------------------------------------------
// Creators (full detail records keyed by username)
// ---------------------------------------------------------------------------
type CreatorSeed = {
  username: string;
  display_name: string;
  bio: string;
  location: string;
  languages: string[];
  art_form: string[];
  specialty: string;
  experience_years: number;
  availability: string;
  hourly_rate_minor: number;
  min_project_size_minor: number;
  tools: string[];
  portfolio: { title: string; category: string; content_type: string }[];
};

const CREATOR_SEEDS: CreatorSeed[] = [
  {
    username: "aaraav_filmworks",
    display_name: "Aarav Mehta",
    bio: "AI filmmaker crafting cinematic brand promos. Text-to-shot, color-graded and tempo-mixed end to end.",
    location: "Mumbai, India",
    languages: ["en", "hi"],
    art_form: ["motion", "animation"],
    specialty: "AI-generated cinematic trailers",
    experience_years: 6,
    availability: "Weekdays 10:00–18:00 IST",
    hourly_rate_minor: 18000,
    min_project_size_minor: 30000,
    tools: ["Runway", "Pika", "ElevenLabs", "DaVinci Resolve", "Midjourney"],
    portfolio: [
      { title: "Neon Avenue", category: "motion", content_type: "video" },
      { title: "Virtual Dancer", category: "animation", content_type: "video" },
      { title: "Product Reveal", category: "3d", content_type: "animation" },
    ],
  },
  {
    username: "priya_onscreen",
    display_name: "Priya Sharma",
    bio: "Generative artist and 3D animator creating interactive visual experiences and algorithm-driven stills.",
    location: "Bengaluru, India",
    languages: ["en", "ta"],
    art_form: ["3d", "still"],
    specialty: "Generative art, 3D storytelling",
    experience_years: 5,
    availability: "Turnaround within 3 business days",
    hourly_rate_minor: 22000,
    min_project_size_minor: 45000,
    tools: ["Blender", "TouchDesigner", "Python", "Houdini"],
    portfolio: [
      { title: "Rain City", category: "3d", content_type: "animation" },
      { title: "Digital Florals", category: "still", content_type: "image" },
    ],
  },
  {
    username: "daniel_3dstudio",
    display_name: "Daniel Okafor",
    bio: "3D animation studio specializing in product visualization and architectural walkthroughs.",
    location: "Lagos, Nigeria",
    languages: ["en"],
    art_form: ["3d"],
    specialty: "Product visualization, architectural walkthroughs",
    experience_years: 8,
    availability: "Weekend sprints available",
    hourly_rate_minor: 15000,
    min_project_size_minor: 25000,
    tools: ["Blender", "KeyShot", "Rhinoceros", "Redshift"],
    portfolio: [
      { title: "Aura Watch", category: "3d", content_type: "animation" },
      { title: "Skyline Walk", category: "3d", content_type: "animation" },
    ],
  },
  {
    username: "mina_icons",
    display_name: "Mina Patel",
    bio: "UI/UX and icon designer using AI-driven icon pipelines and systematic design kits.",
    location: "London, UK",
    languages: ["en"],
    art_form: ["ui"],
    specialty: "Icon systems, brand identity, UI kits",
    experience_years: 4,
    availability: "Open to freelance projects",
    hourly_rate_minor: 12000,
    min_project_size_minor: 20000,
    tools: ["Figma", "Illustrator", "Midjourney", "Photoshop"],
    portfolio: [
      { title: "Flow UI Kit", category: "ui", content_type: "image" },
      { title: "Travel Icons", category: "ui", content_type: "image" },
    ],
  },
  {
    username: "liam_animation",
    display_name: "Liam Chen",
    bio: "Character animator and motion designer working in AI-assisted pipelines for indie clients.",
    location: "Toronto, Canada",
    languages: ["en", "zh"],
    art_form: ["animation", "motion"],
    specialty: "Character animation, motion design",
    experience_years: 7,
    availability: "Weekdays 10:00–18:00 EST",
    hourly_rate_minor: 14000,
    min_project_size_minor: 22000,
    tools: ["After Effects", "Blender", "Runway", "Premiere Pro"],
    portfolio: [
      { title: "Cosmic Rover", category: "animation", content_type: "video" },
      { title: "Logo Launch", category: "motion", content_type: "video" },
    ],
  },
  {
    username: "sofia_visuals",
    display_name: "Sofia Rossi",
    bio: "AI visual effects artist and concept designer for film and advertising campaigns.",
    location: "Milan, Italy",
    languages: ["it", "en"],
    art_form: ["still", "motion"],
    specialty: "VFX, concept art, AI-assisted imagery",
    experience_years: 6,
    availability: "Flexible schedule",
    hourly_rate_minor: 17500,
    min_project_size_minor: 35000,
    tools: ["Photoshop", "After Effects", "Blender", "Stable Diffusion"],
    portfolio: [
      { title: "Coral Reef", category: "still", content_type: "image" },
      { title: "Neon Hero", category: "still", content_type: "image" },
    ],
  },
  {
    username: "noah_motionlab",
    display_name: "Noah Williams",
    bio: "Motion designer and AI integration specialist focused on workflow automation.",
    location: "London, UK",
    languages: ["en"],
    art_form: ["motion"],
    specialty: "AI-assisted motion design, workflow automation",
    experience_years: 5,
    availability: "Remote, flexible hours",
    hourly_rate_minor: 13000,
    min_project_size_minor: 18000,
    tools: ["After Effects", "Runway", "Zapier", "Make"],
    portfolio: [
      { title: "Data Wave", category: "motion", content_type: "video" },
      { title: "Brand Motion", category: "motion", content_type: "video" },
    ],
  },
  {
    username: "zara_animation",
    display_name: "Zara Ahmed",
    bio: "AI animator specializing in stylized shorts and music visuals.",
    location: "Karachi, Pakistan",
    languages: ["ur", "en"],
    art_form: ["animation", "audio"],
    specialty: "AI animation, music visualizers, stylized shorts",
    experience_years: 4,
    availability: "Flexible schedule",
    hourly_rate_minor: 15500,
    min_project_size_minor: 28000,
    tools: ["Blender", "Runway", "TouchDesigner"],
    portfolio: [
      { title: "Pulse", category: "animation", content_type: "video" },
      { title: "Void Rain", category: "animation", content_type: "video" },
    ],
  },
  {
    username: "ethan_studio",
    display_name: "Ethan Brooks",
    bio: "Design-led 2D animation studio creating character-driven series for content creators.",
    location: "New York, USA",
    languages: ["en"],
    art_form: ["animation"],
    specialty: "Character animation, series production",
    experience_years: 9,
    availability: "Within 2 weeks",
    hourly_rate_minor: 16500,
    min_project_size_minor: 30000,
    tools: ["TVPaint", "After Effects", "Clip Studio Paint"],
    portfolio: [
      { title: "Fable Farm", category: "animation", content_type: "video" },
      { title: "Adventure Log", category: "animation", content_type: "video" },
    ],
  },
  {
    username: "hana_graphics",
    display_name: "Hana Kim",
    bio: "Motion graphics designer specializing in scientific and medical explainers.",
    location: "Seoul, South Korea",
    languages: ["ko", "en"],
    art_form: ["motion", "animation"],
    specialty: "Scientific explainers, medical animation",
    experience_years: 6,
    availability: "Open to opportunities",
    hourly_rate_minor: 13500,
    min_project_size_minor: 22000,
    tools: ["After Effects", "Blender", "Unity", "Unreal Engine"],
    portfolio: [
      { title: "Cell Division", category: "animation", content_type: "video" },
      { title: "Climate Graph", category: "motion", content_type: "video" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Derived demo creators
// ---------------------------------------------------------------------------

/** Map a production tool to the AI models/services it represents. */
const MODEL_BY_TOOL: Record<string, string> = {
  Runway: "Runway Gen-3 Alpha",
  Pika: "Pika 1.5",
  ElevenLabs: "ElevenLabs v2",
  Midjourney: "Midjourney v6",
  "Stable Diffusion": "SDXL / Stable Diffusion",
  Blender: "Blender + Cycles",
  TouchDesigner: "TouchDesigner",
  Python: "Custom Python generators",
  Houdini: "SideFX Houdini",
  KeyShot: "KeyShot",
  Rhinoceros: "Rhino 8",
  Redshift: "Redshift",
  Figma: "Figma + AI plugins",
  Illustrator: "Adobe Firefly",
  "Adobe Illustrator": "Adobe Firefly",
  Photoshop: "Adobe Firefly",
  "After Effects": "After Effects + Runway",
  TVPaint: "TVPaint",
  "Clip Studio Paint": "Clip Studio Paint",
  Unity: "Unity ML-Agents",
  "Unreal Engine": "Unreal Engine 5",
  "Premiere Pro": "Premiere Pro",
  "DaVinci Resolve": "DaVinci Resolve",
  Zapier: "Zapier",
  Make: "Make",
};

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

/** Derive searchable skill tags from the creator's art forms, tools and specialty. */
function deriveSkills(seed: CreatorSeed): string[] {
  const fromTools = seed.tools.map(slug);
  const fromArtForm = seed.art_form.map((a) => `${slug(a)}-${a === "motion" ? "design" : "production"}`);
  const fromSpecialty = seed.specialty
    .toLowerCase()
    .split(/[,&/]/)
    .map((s) => slug(s.trim()))
    .filter((s) => s.length > 2);
  return Array.from(new Set([...seed.art_form.map(slug), ...fromArtForm, ...fromTools, ...fromSpecialty]));
}

function deriveModels(seed: CreatorSeed): string[] {
  return Array.from(
    new Set(seed.tools.map((t) => MODEL_BY_TOOL[t]).filter((m): m is string => Boolean(m)))
  );
}

function deriveWorkflow(seed: CreatorSeed): { title: string; description: string }[] {
  return [
    {
      title: "Brief & direction",
      description: `Align on ${seed.art_form.join(" / ")} direction, references and success criteria.`,
    },
    {
      title: "AI generation",
      description: `Generate concepts with ${seed.tools.slice(0, 3).join(", ")}.`,
    },
    { title: "Edit & finish", description: "Assemble, grade, and refine the selected takes." },
    { title: "Delivery & revisions", description: "Share masters with source notes and revision rounds." },
  ];
}

export const DEMO_CREATORS: DemoCreator[] = CREATOR_SEEDS.map((seed, i) => ({
  id: `demo-creator-${i + 1}`,
  profile_id: `demo-profile-${i + 1}`,
  portfolio_url: `https://behance.net/${seed.username}`,
  website_url: `https://${seed.username.replace(/_/g, "-")}.example.com`,
  instagram_url: `https://instagram.com/${seed.username}`,
  youtube_url: `https://youtube.com/@${seed.username}`,
  art_form: seed.art_form,
  skills: deriveSkills(seed),
  models: deriveModels(seed),
  specialty: seed.specialty,
  experience_years: seed.experience_years,
  availability: seed.availability,
  hourly_rate_minor: seed.hourly_rate_minor,
  min_project_size_minor: seed.min_project_size_minor,
  is_profile_verified: i % 2 === 0,
  workflow: deriveWorkflow(seed),
  profiles: {
    display_name: seed.display_name,
    username: seed.username,
    bio: seed.bio,
    location: seed.location,
    languages: seed.languages,
    avatar_url: avatar(seed.username),
  },
}));

const PORTFOLIO_BY_CREATOR: Record<string, DemoPortfolioItem[]> = {};
const TOOLS_BY_CREATOR: Record<string, DemoTool[]> = {};

CREATOR_SEEDS.forEach((seed, i) => {
  const creatorId = `demo-creator-${i + 1}`;
  PORTFOLIO_BY_CREATOR[creatorId] = seed.portfolio.map((item, j) => ({
    id: `${creatorId}-item-${j + 1}`,
    title: item.title,
    category: item.category,
    content_type: item.content_type,
    image_url: shot(`${seed.username}-${item.title}`),
    url: `https://example.com/${seed.username}/${item.title.toLowerCase().replace(/\s+/g, "-")}`,
    is_public: true,
    is_owned_by_creator: true,
  }));
  TOOLS_BY_CREATOR[creatorId] = seed.tools.map((tool_name) => ({
    tool_name,
    workflow_step: "production",
  }));
});

export function getDemoCreatorByUsername(username: string): DemoCreator | null {
  return DEMO_CREATORS.find((c) => c.profiles.username === username) ?? null;
}

export function getDemoPortfolio(creatorId: string): DemoPortfolioItem[] {
  return PORTFOLIO_BY_CREATOR[creatorId] ?? [];
}

export function getDemoTools(creatorId: string): DemoTool[] {
  return TOOLS_BY_CREATOR[creatorId] ?? [];
}

// ---------------------------------------------------------------------------
// Filter option aggregates (drive the discovery sidebar)
// ---------------------------------------------------------------------------
const uniqueSorted = (values: string[]) => Array.from(new Set(values)).sort();

/** Most frequently used skills first, so the sidebar stays short and every
 *  option is guaranteed to match at least one creator. */
function topByFrequency(values: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([v]) => v)
    .sort();
}

export const DEMO_SKILL_OPTIONS: string[] = topByFrequency(
  DEMO_CREATORS.flatMap((c) => c.skills),
  16
);
export const DEMO_TOOL_OPTIONS: string[] = topByFrequency(
  DEMO_CREATORS.flatMap((c) => c.models.map((m) => m.split(/[+/]/)[0].trim())),
  18
);
export const DEMO_SPECIALTY_OPTIONS: string[] = uniqueSorted(
  DEMO_CREATORS.map((c) => c.specialty).filter((s): s is string => Boolean(s))
);
export const DEMO_LANGUAGE_OPTIONS: string[] = uniqueSorted(DEMO_CREATORS.flatMap((c) => c.profiles.languages));

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------
export const DEMO_BRANDS: DemoBrand[] = [
  {
    id: "demo-brand-1",
    company_name: "Aurelia Studios",
    username: "aurelia_studios",
    industry: "Marketing & Communications",
    avatar_url: avatar("aurelia_studios"),
  },
  {
    id: "demo-brand-2",
    company_name: "NeoLaunch",
    username: "neolaunch",
    industry: "Fintech",
    avatar_url: avatar("neolaunch"),
  },
  {
    id: "demo-brand-3",
    company_name: "Bark & Co.",
    username: "bark_and_co",
    industry: "E-commerce (Pets)",
    avatar_url: avatar("bark_and_co"),
  },
];

const brandRef = (id: string) => {
  const b = DEMO_BRANDS.find((x) => x.id === id) ?? DEMO_BRANDS[0];
  return {
    company_name: b.company_name,
    profiles: {
      display_name: b.company_name,
      username: b.username,
      avatar_url: b.avatar_url,
    },
  };
};

// ---------------------------------------------------------------------------
// Briefs
// ---------------------------------------------------------------------------
export const DEMO_BRIEFS: DemoBrief[] = [
  {
    id: "demo-brief-1",
    title: "Lunar Launch — Brand Film",
    objective: "Announce the new product line with a cinematic 60-second brand film.",
    content_type: "motion",
    deliverables_count: 3,
    platforms: ["youtube", "instagram"],
    aspect_ratios: ["16:9", "9:16"],
    total_budget_minor: 250000,
    deadline_at: inDays(30),
    revision_count: 2,
    usage_rights: ["paid_ads", "website", "streaming"],
    license_notes: "Worldwide paid ads, website and streaming for 12 months. Resale and merch excluded.",
    preferred_tools: ["Runway", "After Effects"],
    status: "published",
    brand_profile_id: "demo-brand-1",
    brand_profiles: brandRef("demo-brand-1"),
  },
  {
    id: "demo-brief-2",
    title: "Fintech Explainer",
    objective: "A 60-second explainer introducing a new savings product.",
    content_type: "motion",
    deliverables_count: 2,
    platforms: ["youtube", "tiktok"],
    aspect_ratios: ["16:9", "9:16"],
    total_budget_minor: 120000,
    deadline_at: inDays(21),
    revision_count: 3,
    usage_rights: ["social", "paid_ads"],
    license_notes: "Social and paid ads only, 6 months. Excludes broadcast and resale.",
    preferred_tools: ["Blender"],
    status: "published",
    brand_profile_id: "demo-brand-2",
    brand_profiles: brandRef("demo-brand-2"),
  },
  {
    id: "demo-brief-3",
    title: "Pet Product Launch",
    objective: "Launch a new dog treat flavour with playful 3D product animation.",
    content_type: "3d",
    deliverables_count: 2,
    platforms: ["tiktok", "instagram", "youtube"],
    aspect_ratios: ["9:16", "1:1", "16:9"],
    total_budget_minor: 80000,
    deadline_at: inDays(10),
    revision_count: 2,
    usage_rights: ["social", "paid_ads", "merch"],
    license_notes: "Full buyout including merch and resale rights, worldwide, perpetual.",
    preferred_tools: ["Blender", "KeyShot"],
    status: "published",
    brand_profile_id: "demo-brand-3",
    brand_profiles: brandRef("demo-brand-3"),
  },
  {
    id: "demo-brief-4",
    title: "AI Visuals Case Study",
    objective: "Demonstrate a creative AI pipeline with before/after stills.",
    content_type: "still",
    deliverables_count: 5,
    platforms: ["instagram", "behance"],
    aspect_ratios: ["1:1", "4:5"],
    total_budget_minor: 45000,
    deadline_at: inDays(15),
    revision_count: 1,
    usage_rights: ["portfolio"],
    license_notes: "Portfolio and case-study use only; no commercial licence granted.",
    preferred_tools: ["Midjourney", "Photoshop"],
    status: "published",
    brand_profile_id: "demo-brand-1",
    brand_profiles: brandRef("demo-brand-1"),
  },
  {
    id: "demo-brief-5",
    title: "Wellness App Onboarding",
    objective: "Animated onboarding video for a meditation app.",
    content_type: "animation",
    deliverables_count: 1,
    platforms: ["app_store", "youtube"],
    aspect_ratios: ["16:9", "9:16"],
    total_budget_minor: 95000,
    deadline_at: inDays(25),
    revision_count: 2,
    usage_rights: ["social", "app_store", "paid_ads"],
    license_notes: "App store distribution and paid social for 12 months, worldwide.",
    preferred_tools: ["After Effects", "Blender"],
    status: "published",
    brand_profile_id: "demo-brand-2",
    brand_profiles: brandRef("demo-brand-2"),
  },
  {
    id: "demo-brief-6",
    title: "Fashion Drop Teaser",
    objective: "Short-form vertical teasers for a seasonal fashion drop.",
    content_type: "motion",
    deliverables_count: 4,
    platforms: ["instagram", "tiktok"],
    aspect_ratios: ["9:16"],
    total_budget_minor: 140000,
    deadline_at: inDays(18),
    revision_count: 2,
    usage_rights: ["social", "paid_ads"],
    license_notes: "Paid social and organic social, 9 months, India and GCC territories.",
    preferred_tools: ["Runway", "Pika"],
    status: "published",
    brand_profile_id: "demo-brand-1",
    brand_profiles: brandRef("demo-brand-1"),
  },
];

/** Filter demo briefs the same way the /briefs page does. */
export function listDemoBriefs(filters?: { q?: string; content_type?: string }) {
  let rows = DEMO_BRIEFS.filter((b) => b.status === "published");
  const q = filters?.q?.toLowerCase().trim();
  if (q) {
    rows = rows.filter(
      (b) => b.title.toLowerCase().includes(q) || b.objective.toLowerCase().includes(q)
    );
  }
  if (filters?.content_type) {
    rows = rows.filter((b) => b.content_type === filters.content_type);
  }
  return rows;
}

export function getDemoBriefById(id: string): DemoBrief | null {
  return DEMO_BRIEFS.find((b) => b.id === id) ?? null;
}
