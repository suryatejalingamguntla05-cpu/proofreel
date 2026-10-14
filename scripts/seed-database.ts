/**
 * scripts/seed-database.ts
 * ---------------------------------------------------------------------------
 * SAFE SEEDING SCRIPT for LOCAL DEVELOPMENT ONLY.
 *
 * Intended for a FRESH development database (Supabase local or a disposable
 * production project). NEVER run against production.
 *
 * This script:
 *   1. Connects to the Supabase project using the ANON key (server-side only).
 *   2. Inserts clearly labeled DEMO records (10 creators, 3 brands, portfolio,
 *      briefs, collaborations lifecycle examples).
 *   3. Records each inserted row in public.demo_seed_records so it is auditable.
 *
 * Run:  npx tsx scripts/seed-database.ts  (requires local Supabase)
 *       or:  supabase db push && npx tsx scripts/seed-database.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// SERVER-SIDE env validation (never expose to browser)
// ---------------------------------------------------------------------------
const envSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});

const env = envSchema.parse(process.env);

// Service-role key has admin privileges. Only use it server-side, never in a
// browser bundle. We pass it to createClient for seeding only.
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Demo branding
const DEMO_BRAND = "Proofreel Demo";
const DEMO_NOTE = "THIS IS DUMMY DATA FOR DEVELOPMENT. DO NOT USE IN PRODUCTION.";

// ---------------------------------------------------------------------------
// Tiny date helpers
// ---------------------------------------------------------------------------
const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------
const CREATORS = [
  {
    display_name: "Aarav Mehta",
    username: "aaraav_filmworks",
    bio: "AI filmmaker crafting cinematic brand promos. Workflow: text-to-shot → color-graded → tempo-mixed.",
    art_form: ["Motion Graphics", "Cinematic Video"],
    specialty: "AI-generated cinematic trailers",
    experience_years: 6,
    location: "Mumbai, India",
    languages: ["en", "hi"],
    portfolio: [
      { title: "Neon Avenue", description: "Cinematic AI promo for a fashion brand.", category: "motion", content_type: "video", url: "https://example.com/neon-avenue", image_url: "https://images.unsplash.com/photo-1515879218967-110017n1uc0c", is_owned_by_creator: true },
      { title: "Virtual Dancer", description: "AI-animated dancer synced to music. Experimental.", category: "animation", content_type: "video", url: "https://example.com/virtual-dancer", image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf", is_owned_by_creator: true },
      { title: "Product Reveal", description: "3D product showreel with AI elements.", category: "3d", content_type: "animation", url: "https://example.com/product-reveal", image_url: "https://images.unsplash.com/photo-1523275334148-397a8b3c8d4a", is_owned_by_creator: true },
    ],
    skills: ["prompting", "character-design", "color-grading", "cinematic-composition", "after-effects"],
    tools: ["Runway", "Pika", "ElevenLabs", "DaVinci Resolve", "Blender", "Midjourney"],
    workflow: [
      { title: "Ideation", description: "Brief, moodboard, and prompt deck." },
      { title: "Pre-production", description: "Shot lists and storyboard." },
      { title: "Production", description: "AI generation + editing." },
      { title: "Post", description: "Color grade and sound mix." },
    ],
    social_accounts: [
      { platform: "youtube", platform_user_id: "demoYt1", handle: "@aaraavfilm", display_name: "Aarav Filmworks", profile_url: "https://youtube.com/@aaraavfilm", data_source: "manual", is_connected: true, last_synced_at: addDays(-2) },
      { platform: "instagram", platform_user_id: "demoIg1", handle: "@aaraavfilmworks", display_name: "Aarav Filmworks", profile_url: "https://instagram.com/aaraavfilmworks", data_source: "manual", is_connected: true, last_synced_at: addDays(-1) },
    ],
    metrics: [
      { platform: "youtube", platform_account: "aaraavfilm", metric_name: "subscribers", value: 8420, source_type: "manual", source_ref: "demo", captured_at: addDays(-2) },
      { platform: "youtube", platform_account: "aaraavfilm", metric_name: "total_views", value: 1024000, source_type: "manual", source_ref: "demo", captured_at: addDays(-2) },
      { platform: "instagram", platform_account: "aaraavfilmworks", metric_name: "followers", value: 23500, source_type: "manual", source_ref: "demo", captured_at: addDays(-1) },
      { platform: "instagram", platform_account: "aaraavfilmworks", metric_name: "likes", value: 312400, source_type: "manual", source_ref: "demo", captured_at: addDays(-1) },
    ],
    hourly_rate_minor: 18000,
    min_project_size_minor: 30000,
    is_profile_verified: false,
    skills_for_match: ["prompting", "cinematic-composition", "character-design", "color-grading", "after-effects", "motion-graphics"],
  },
  {
    display_name: "Priya Sharma",
    username: "priya_onscreen",
    bio: "Generative artist and 3D animator. Creates interactive visual experiences and NFT-ready stills.",
    art_form: ["3D Animation", "Generative Art"],
    specialty: "Generative art, 3D storytelling",
    experience_years: 5,
    location: "Bengaluru, India",
    languages: ["en", "ta"],
    portfolio: [
      { title: "Rain City", description: "A generative cityscape that reacts to audio.", category: "3d", content_type: "animation", url: "https://example.com/rain-city", image_url: "https://images.unsplash.com/photo-1515072111853-8e9d7e5d0a0b", is_owned_by_creator: true },
      { title: "Digital Florals", description: "Algorithmic flower series, still images.", category: "still", content_type: "image", url: "https://example.com/digital-florals", image_url: "https://images.unsplash.com/photo-1413347811636-61b48bc69ebb", is_owned_by_creator: true },
    ],
    skills: ["python", "generative-art", "blender", "procedural-art", "cinemachine"],
    tools: ["Blender", "TouchDesigner", "Python", "Houdini"],
    workflow: [
      { title: "Code", description: "Generative algorithms written in Python." },
      { title: "Render", description: "High-res stills and loop animations." },
      { title: "Curate", description: "Curated collections for exhibitions." },
    ],
    social_accounts: [
      { platform: "instagram", platform_user_id: "demoIg2", handle: "@priya_onscreen", display_name: "Priya Onscreen", profile_url: "https://instagram.com/priya_onscreen", data_source: "manual", is_connected: true, last_synced_at: addDays(-3) },
    ],
    metrics: [
      { platform: "instagram", platform_account: "priya_onscreen", metric_name: "followers", value: 12800, source_type: "manual", source_ref: "demo", captured_at: addDays(-3) },
      { platform: "instagram", platform_account: "priya_onscreen", metric_name: "likes", value: 96200, source_type: "manual", source_ref: "demo", captured_at: addDays(-3) },
    ],
    hourly_rate_minor: 22000,
    min_project_size_minor: 45000,
    is_profile_verified: false,
    skills_for_match: ["generative-art", "blender", "python", "procedural-art", "3d-animation"],
  },
  {
    display_name: "Daniel Okafor",
    username: "daniel_3dstudio",
    bio: "3D animation studio specializing in product visualization and architectural walkthroughs.",
    art_form: ["3D Visualization"],
    specialty: "Product visualization, architectural walkthroughs",
    experience_years: 8,
    location: "Lagos, Nigeria",
    languages: ["en"],
    portfolio: [
      { title: "Aura Watch", description: "Luxury product animation.", category: "3d", content_type: "animation", url: "https://example.com/aura-watch", image_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b0e6c5", is_owned_by_creator: true },
      { title: "Skyline Walk", description: "Architectural walkthrough.", category: "3d", content_type: "animation", url: "https://example.com/skyline-walk", image_url: "https://images.unsplash.com/photo-1431313167419-7fba7b2ca80f", is_owned_by_creator: true },
    ],
    skills: ["3d-animation", "product-visualization", "lighting", "rendering", "rhinoceros"],
    tools: ["Blender", "KeyShot", "Rhinoceros", "Redshift"],
    workflow: [
      { title: "Brief", description: "Understand product and camera angles." },
      { title: "Layout", description: "Scene blocking." },
      { title: "Render", description: "Lighting and ray-tracing." },
      { title: "Finish", description: "Compositing and review." },
    ],
    social_accounts: [
      { platform: "youtube", platform_user_id: "demoYt2", handle: "@d3studio", display_name: "D3 Studio", profile_url: "https://youtube.com/@d3studio", data_source: "manual", is_connected: true, last_synced_at: addDays(-4) },
    ],
    metrics: [
      { platform: "youtube", platform_account: "d3studio", metric_name: "subscribers", value: 3180, source_type: "manual", source_ref: "demo", captured_at: addDays(-4) },
      { platform: "youtube", platform_account: "d3studio", metric_name: "total_views", value: 412000, source_type: "manual", source_ref: "demo", captured_at: addDays(-4) },
    ],
    hourly_rate_minor: 15000,
    min_project_size_minor: 25000,
    is_profile_verified: false,
    skills_for_match: ["3d-animation", "product-visualization", "lighting", "rendering"],
  },
  {
    display_name: "Mina Patel",
    username: "mina_icons",
    bio: "UI/UX and icon designer using AI-driven icon pipelines.",
    art_form: ["UI Design", "Icon Design"],
    specialty: "Icon systems, brand identity, UI kits",
    experience_years: 4,
    location: "London, UK",
    languages: ["en"],
    portfolio: [
      { title: "Flow UI Kit", description: "A complete icon set and UI library.", category: "ui", content_type: "image", url: "https://example.com/flow-ui", image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5", is_owned_by_creator: true },
      { title: "Travel Icons", description: "A set of travel-related icons.", category: "ui", content_type: "image", url: "https://example.com/travel-icons", image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5", is_owned_by_creator: true },
    ],
    skills: ["figma", "icon-design", "ui-kits", "brand-identity", "aesthetic-direction"],
    tools: ["Figma", "Adobe Illustrator", "Midjourney", "Photoshop"],
    workflow: [
      { title: "Research", description: "Style and audience discovery." },
      { title: "Design", description: "Icon grids and UI systems." },
      { title: "Handoff", description: "Export and UX documentation." },
    ],
    social_accounts: [
      { platform: "instagram", platform_user_id: "demoIg3", handle: "@mina_icons", display_name: "Mina Icons", profile_url: "https://instagram.com/mina_icons", data_source: "manual", is_connected: true, last_synced_at: addDays(-2) },
    ],
    metrics: [
      { platform: "instagram", platform_account: "mina_icons", metric_name: "followers", value: 9450, source_type: "manual", source_ref: "demo", captured_at: addDays(-2) },
    ],
    hourly_rate_minor: 12000,
    min_project_size_minor: 20000,
    is_profile_verified: false,
    skills_for_match: ["icon-design", "ui-kits", "figma", "brand-identity", "aesthetic-direction"],
  },
  {
    display_name: "Liam Chen",
    username: "liam_animation",
    bio: "Character animator and motion designer. Works in AI-assisted pipelines for indie clients.",
    art_form: ["Character Animation", "Motion Design"],
    specialty: "Character animation, motion design",
    experience_years: 7,
    location: "Toronto, Canada",
    languages: ["en", "zh"],
    portfolio: [
      { title: "Cosmic Rover", description: "A character-driven motion piece.", category: "animation", content_type: "video", url: "https://example.com/cosmic-rover", image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf", is_owned_by_creator: true },
      { title: "Logo Launch", description: "A dynamic logo animation.", category: "motion", content_type: "video", url: "https://example.com/logo-launch", image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5", is_owned_by_creator: true },
    ],
    skills: ["animation", "character-design", "motion-graphics", "adobe-after-effects"],
    tools: ["After Effects", "Blender", "Runway", "Premiere Pro"],
    workflow: [
      { title: "Concept", description: "Concept art and style frames." },
      { title: "Animate", description: "Keyframe animation." },
      { title: "Refine", description: "Polish and publish." },
    ],
    social_accounts: [
      { platform: "youtube", platform_user_id: "demoYt3", handle: "@liammotion", display_name: "Liam Motion", profile_url: "https://youtube.com/@liammotion", data_source: "manual", is_connected: true, last_synced_at: addDays(-1) },
    ],
    metrics: [
      { platform: "youtube", platform_account: "liammotion", metric_name: "total_views", value: 612000, source_type: "manual", source_ref: "demo", captured_at: addDays(-1) },
    ],
    hourly_rate_minor: 14000,
    min_project_size_minor: 22000,
    is_profile_verified: false,
    skills_for_match: ["animation", "character-design", "motion-graphics", "after-effects"],
  },
  {
    display_name: "Sofia Rossi",
    username: "sofia_visuals",
    bio: "AI visual effects artist and concept designer for film and advertising.",
    art_form: ["VFX", "Concept Art"],
    specialty: "VFX, concept art, AI-assisted imagery",
    experience_years: 6,
    location: "Milan, Italy",
    languages: ["it", "en"],
    portfolio: [
      { title: "Coral Reef", description: "Sci-fi VFX concept.", category: "still", content_type: "image", url: "https://example.com/coral-reef", image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf", is_owned_by_creator: true },
      { title: "Neon Hero", description: "Character concept art with AI elements.", category: "still", content_type: "image", url: "https://example.com/neon-hero", image_url: "https://images.unsplash.com/photo-1515879218967-110017n1uc0c", is_owned_by_creator: true },
    ],
    skills: ["concept-art", "vfx", "compositing", "digital-painting"],
    tools: ["Photoshop", "After Effects", "Blender", "Stable Diffusion"],
    workflow: [
      { title: "Reference", description: "Moodboards and reference gathering." },
      { title: "Concept", description: "Answering and concept development." },
      { title: "VFX", description: "Compositing and finishing." },
    ],
    social_accounts: [
      { platform: "instagram", platform_user_id: "demoIg4", handle: "@sofia_visuals", display_name: "Sofia Visuals", profile_url: "https://instagram.com/sofia_visuals", data_source: "manual", is_connected: true, last_synced_at: addDays(-5) },
    ],
    metrics: [
      { platform: "instagram", platform_account: "sofia_visuals", metric_name: "followers", value: 15400, source_type: "manual", source_ref: "demo", captured_at: addDays(-5) },
      { platform: "instagram", platform_account: "sofia_visuals", metric_name: "likes", value: 201500, source_type: "manual", source_ref: "demo", captured_at: addDays(-5) },
    ],
    hourly_rate_minor: 17500,
    min_project_size_minor: 35000,
    is_profile_verified: false,
    skills_for_match: ["concept-art", "vfx", "compositing", "digital-painting"],
  },
  {
    display_name: "Noah Williams",
    username: "noah_motionlab",
    bio: "Motion designer and AI integration specialist. Focuses on workflow automation.",
    art_form: ["Motion Design"],
    specialty: "AI-assisted motion design, workflow automation",
    experience_years: 5,
    location: "London, UK",
    languages: ["en"],
    portfolio: [
      { title: "Data Wave", description: "Animated data visualization.", category: "motion", content_type: "video", url: "https://example.com/data-wave", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e", is_owned_by_creator: true },
      { title: "Brand Motion", description: "This ad's brand motion ident.", category: "motion", content_type: "video", url: "https://example.com/brand-motion", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e", is_owned_by_creator: true },
    ],
    skills: ["motion-design", "after-effects", "automation", "ai-pipeline"],
    tools: ["After Effects", "Rush", "Zapier", "Make"],
    workflow: [
      { title: "Brief", description: "Brand and style brief." },
      { title: "Animate", description: "AI-generated assets + motion." },
      { title: "Deliver", description: "Client review and delivery." },
    ],
    social_accounts: [
      { platform: "youtube", platform_user_id: "demoYt4", handle: "@noahmotionlab", display_name: "Noah Motion Lab", profile_url: "https://youtube.com/@noahmotionlab", data_source: "manual", is_connected: true, last_synced_at: addDays(-2) },
    ],
    metrics: [
      { platform: "youtube", platform_account: "noahmotionlab", metric_name: "subscribers", value: 4200, source_type: "manual", source_ref: "demo", captured_at: addDays(-2) },
    ],
    hourly_rate_minor: 13000,
    min_project_size_minor: 18000,
    is_profile_verified: false,
    skills_for_match: ["motion-design", "after-effects", "automation", "ai-pipeline"],
  },
  {
    display_name: "Zara Ahmed",
    username: "zara_animation",
    bio: "AI animator specializing in stylized shorts and music visuals.",
    art_form: ["Animation", "Music Visuals"],
    specialty: "AI animation, music visualizers, stylized shorts",
    experience_years: 4,
    location: "Karachi, Pakistan",
    languages: ["ur", "en"],
    portfolio: [
      { title: "Pulse", description: "A music visualizer for an electronic track.", category: "animation", content_type: "video", url: "https://example.com/pulse", image_url: "https://images.unsplash.com/photo-1515879218967-110017n1uc0c", is_owned_by_creator: true },
      { title: "Void Rain", description: "Stylized short with AI environments.", category: "animation", content_type: "video", url: "https://example.com/void-rain", image_url: "https://images.unsplash.com/photo-1515072111853-8e9d7e5d0a0b", is_owned_by_creator: true },
    ],
    skills: ["animation", "music-visuals", "stylized-shorts", "pacing"],
    tools: ["Blender", "Runway", "TouchDesigner"],
    workflow: [
      { title: "Audio", description: "Analyze the track's structure." },
      { title: "Visuals", description: "Generate and animate." },
      { title: "Edit", description: "Sync to rhythm and release." },
    ],
    social_accounts: [
      { platform: "tiktok", platform_user_id: "demoT1", handle: "@zaraa_art", display_name: "Zara Ahmed", profile_url: "https://tiktok.com/@zaraa_art", data_source: "manual", is_connected: true, last_synced_at: addDays(-1) },
    ],
    metrics: [
      { platform: "tiktok", platform_account: "zaraa_art", metric_name: "followers", value: 18200, source_type: "manual", source_ref: "demo", captured_at: addDays(-1) },
      { platform: "tiktok", platform_account: "zaraa_art", metric_name: "likes", value: 245000, source_type: "manual", source_ref: "demo", captured_at: addDays(-1) },
    ],
    hourly_rate_minor: 15500,
    min_project_size_minor: 28000,
    is_profile_verified: false,
    skills_for_match: ["animation", "music-visuals", "stylized-shorts", "pacing"],
  },
  {
    display_name: "Ethan Brooks",
    username: "ethan_studio",
    bio: "Design-led 2D animation studio. Creates character-driven series for content creators.",
    art_form: ["2D Animation"],
    specialty: "Character animation, series production",
    experience_years: 9,
    location: "New York, USA",
    languages: ["en"],
    portfolio: [
      { title: "Fable Farm", description: "Animated character series (2D).", category: "animation", content_type: "video", url: "https://example.com/fable-farm", image_url: "https://images.unsplash.com/photo-1515879218967-110017n1uc0c", is_owned_by_creator: true },
      { title: "Adventure Log", description: "A motion story for a children's brand.", category: "animation", content_type: "video", url: "https://example.com/adventure-log", image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf", is_owned_by_creator: true },
    ],
    skills: ["2d-animation", "character-design", "storyboarding", "series-production"],
    tools: ["Lightroom", "TVPaint", "After Effects", "Clip Studio Paint"],
    workflow: [
      { title: "Script", description: "Script and storyboard." },
      { title: "Animate", description: "Layout and animation." },
      { title: "Render", description: "Color, lighting, and pipe." },
      { title: "Review", description: "Client review cycles." },
    ],
    social_accounts: [
      { platform: "youtube", platform_user_id: "demoYt5", handle: "@ethanstudio", display_name: "Ethan Studio", profile_url: "https://youtube.com/@ethanstudio", data_source: "manual", is_connected: true, last_synced_at: addDays(-3) },
    ],
    metrics: [
      { platform: "youtube", platform_account: "ethanstudio", metric_name: "total_views", value: 890000, source_type: "manual", source_ref: "demo", captured_at: addDays(-3) },
    ],
    hourly_rate_minor: 16500,
    min_project_size_minor: 30000,
    is_profile_verified: false,
    skills_for_match: ["2d-animation", "character-design", "storyboarding", "series-production"],
  },
  {
    display_name: "Hana Kim",
    username: "hana_graphics",
    bio: "Motion graphics designer specializing in scientific and medical explainers.",
    art_form: ["Motion Graphics", "Explainer"],
    specialty: "Scientific explainers, medical animation",
    experience_years: 6,
    location: "Seoul, South Korea",
    languages: ["ko", "en"],
    portfolio: [
      { title: "Cell Division", description: "A medical explainer animation.", category: "animation", content_type: "video", url: "https://example.com/cell-division", image_url: "https://images.unsplash.com/photo-1515072111853-8e9d7e5d0a0b", is_owned_by_creator: true },
      { title: "Climate Graph", description: "Data-driven explainer motion.", category: "motion", content_type: "video", url: "https://example.com/climate-graph", image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5", is_owned_by_creator: true },
    ],
    skills: ["motion-graphics", "scientific-animation", "data-visualization", "meetings"],
    tools: ["After Effects", "Blender", "Unity", "Unreal Engine"],
    workflow: [
      { title: "Story", description: "Script and storyboard." },
      { title: "Animate", description: "Scientific accuracy + motion." },
      { title: "Review", description: "Subject-matter review." },
    ],
    social_accounts: [
      { platform: "instagram", platform_user_id: "demoIg5", handle: "@hana_graphics", display_name: "Hana Graphics", profile_url: "https://instagram.com/hana_graphics", data_source: "manual", is_connected: true, last_synced_at: addDays(-6) },
    ],
    metrics: [
      { platform: "instagram", platform_account: "hana_graphics", metric_name: "followers", value: 6200, source_type: "manual", source_ref: "demo", captured_at: addDays(-6) },
      { platform: "instagram", platform_account: "hana_graphics", metric_name: "likes", value: 48000, source_type: "manual", source_ref: "demo", captured_at: addDays(-6) },
    ],
    hourly_rate_minor: 13500,
    min_project_size_minor: 22000,
    is_profile_verified: false,
    skills_for_match: ["motion-graphics", "scientific-animation", "data-visualization"],
  },
];

const BRANDS = [
  {
    company_name: "Aurelia Studios",
    industry: "Marketing & Communications",
    company_size: "15-50 employees",
    website_url: "https://aurelia.design",
    contact_email: "hello@aurelia.design",
    contact_phone: "+1 555 0101",
    brand_aesthetic: "Clean, minimal, cinematic",
    typical_campaigns: ["Promo videos", "Product explainers", "Social ads"],
    is_brand_verified: true,
  },
  {
    company_name: "NeoLaunch",
    industry: "Fintech",
    company_size: "50-200 employees",
    website_url: "https://neolaunch.io",
    contact_email: "creative@neolaunch.io",
    contact_phone: "+1 555 0102",
    brand_aesthetic: "Modern, technical, trustworthy",
    typical_campaigns: ["Fintech explainers", "SaaS ads", "Fundraising videos"],
    is_brand_verified: true,
  },
  {
    company_name: "Bark & Co.",
    industry: "E-commerce (Pets)",
    company_size: "10-50 employees",
    website_url: "https://barkandco.store",
    contact_email: "team@barkandco.store",
    contact_phone: "+44 555 0103",
    brand_aesthetic: "Warm, playful, family-friendly",
    typical_campaigns: ["Product launches", "Social content", "Brand animations"],
    is_brand_verified: true,
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Insert helper (server-side token, so this is a controlled privileged call)
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Demo login accounts: live auth users + server-side
  // profile rows, so /api/auth/login returns the correct redirectTo.
  const ACCOUNTS = [
    {
      display_name: "User One",
      username: "user1",
      email: "user1@example.com",
      password: "user1pass123",
      role: "creator" as const,
    },
    {
      display_name: "User Two",
      username: "user2",
      email: "user2@example.com",
      password: "user2pass456",
      role: "brand" as const,
    },  ];

  for (const account of ACCOUNTS) {
    const { authData, authErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Demo login accounts: live auth users + server-side profile rows
  await createLoginAccounts();

  // Use a JSON-serializable payload. We avoid raw SQL injection by calling
  supabase.from(table).insert(payload);
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
  // Use a JSON-serializable payload. We avoid raw SQL injection by calling
  // supabase.from(table).insert(payload). This is still server-side and safe.
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw new Error(`Failed to insert into ${table}: ${error.message}`);
}

async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Demo login accounts: live auth users + server-side
  // profile rows, so /api/auth/login returns the correct redirectTo.
  const ACCOUNTS = [
    {
      display_name: "User One",
      username: "user1",
      email: "user1@example.com",
      password: "user1pass123",
      role: "creator" as const,
    },
    {
      display_name: "User Two",
      username: "user2",
      email: "user2@example.com",
      password: "user2pass456",
      role: "brand" as const,
    },  ];

  for (const account of ACCOUNTS) {
    const { authData, authErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Demo login accounts: live auth users + server-side profile rows
  await createLoginAccounts();

  // Use a JSON-serializable payload. We avoid raw SQL injection by calling
  supabase.from(table).insert(payload);
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Demo login accounts: live auth users + server-side
  // profile rows, so /api/auth/login returns the correct redirectTo.
  const ACCOUNTS = [
    {
      display_name: "User One",
      username: "user1",
      email: "user1@example.com",
      password: "user1pass123",
      role: "creator" as const,
    },
    {
      display_name: "User Two",
      username: "user2",
      email: "user2@example.com",
      password: "user2pass456",
      role: "brand" as const,
    },  ];

  for (const account of ACCOUNTS) {
    const { authData, authErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Demo login accounts: live auth users + server-side profile rows
  await createLoginAccounts();

  // Use a JSON-serializable payload. We avoid raw SQL injection by calling
  supabase.from(table).insert(payload);
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { display_name: account.display_name, username: account.username, requested_role: account.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/callback`,
      },
    });
    if (authErr) {
      console.error(`[seed] auth signUp failed for ${account.email}:`, authErr.message);
      continue;
    }

    // De-dupe usernames (append short suffix on collision).
    let finalUsername = slugify(account.username);
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();
    if (existing) finalUsername = `${finalUsername}_${Math.random().toString(36).slice(2, 6)}`;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        auth_id: authData.user!.id,
        display_name: account.display_name,
        username: finalUsername,
        role: account.role,
        is_public: true,
        is_onboarding_complete: true,
        languages: ["en"],
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;

    if (account.role === "brand") {
      const { error: brandErr } = await supabaseAdmin.from("brand_profiles").insert({
        profile_id: profile.id,
        company_name: "Proofreel Demo",
        industry: "Demo",
        is_brand_verified: true,
      });
      if (brandErr) throw brandErr;
    } else {
      const { error: creatorErr } = await supabaseAdmin.from("creator_profiles").insert({
        profile_id: profile.id,
        art_form: [],
        hourly_rate_minor: 0,
        min_project_size_minor: 0,
        is_profile_verified: false,
      });
      if (creatorErr) throw creatorErr;
    }
  }
}

async function main(): Promise<void> {
  console.log(`[seed] Starting Proofreel demo seed (${DEMO_BRAND})…\n`);

  // Clear any stale demo records
  await supabase.from("demo_seed_records").delete({});

  // Demo login accounts: live auth users + server-side profile rows
  await createLoginAccounts();

  // Attach demo-note columns to all payloads:
  const demos = await Promise.all([
    insertCreators(),
    insertBrands(),
    insertPortfolio(),
    insertBriefs(),
    insertCollaborationLifecycle(),
  ]);

  console.log("[seed] Demo records inserted successfully.");
  console.log("[seed] Demo mode is enabled for the seed accounts only.");
  console.log("[seed] In production, delete this script and the demo_seed_records table.");
}

// ---- Creator profiles ------------------------------------------------------
async function insertCreators(): Promise<void> {
  for (let i = 0; i < CREATORS.length; i++) {
    const c = CREATORS[i];
    // 1. Profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .insert({
        display_name: c.display_name,
        username: c.username,
        bio: c.bio,
        location: c.location,
        languages: c.languages,
        avatar_url: `https://images.unsplash.com/photo-1551977165-5973dc0f32e7?w=200&h=200&fit=crop`,
        role: "creator" as const,
        is_public: true,
        is_onboarding_complete: true,
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;
    const profileId = profile.id;

    // 2. Creator profile
    await insertRow("creator_profiles", {
      profile_id: profileId,
      portfolio_url: `https://aaraavfilmworks.com` ,
      website_url: `https://${c.username}.com` ,
      instagram_url: `https://instagram.com/${c.username}`,
      twitter_url: `https://twitter.com/${c.username}`,
      youtube_url: `https://youtube.com/@${c.username}`,
      behance_url: `https://behance.net/${c.username}`,
      art_form: c.art_form,
      specialty: c.specialty,
      experience_years: c.experience_years,
      education: "BFA in Motion Media",
      availability: "Weekdays 10:00–18:00 IST; quick turnaround within 3 business days",
      hourly_rate_minor: c.hourly_rate_minor,
      min_project_size_minor: c.min_project_size_minor,
      is_profile_verified: c.is_profile_verified,
    });

    // 3. Portfolio items
    for (const item of c.portfolio) {
      await insertRow("portfolio_items", {
        creator_profile_id: profileId,
        title: item.title,
        description: item.description,
        category: item.category,
        content_type: item.content_type,
        url: item.url,
        image_url: item.image_url,
        is_owned_by_creator: item.is_owned_by_creator,
        ownership_note: item.is_owned_by_creator ? "Creator holds the asset license" : "Asset rights to be confirmed",
        is_public: true,
      });
    }

    // 4. Tools
    for (const tool of c.tools) {
      await insertRow("creator_tools", {
        creator_profile_id: profileId,
        tool_name: tool,
        tool_description: `${tool} — AI-enabled pipeline component`,
        workflow_step: "production",
      });
    }

    // 5. Workflow
    for (const w of c.workflow) {
      await insertRow("creator_workflow", {
        creator_profile_id: profileId,
        title: w.title,
        description: w.description,
        step_order: w.title === "Ideation" ? 1 : w.title === "Pre-production" ? 2 : w.title === "Production" ? 3 : 4,
      });
    }

    // 6. Social accounts
    for (const s of c.social_accounts) {
      await insertRow("social_accounts", {
        creator_profile_id: profileId,
        platform: s.platform,
        platform_user_id: s.platform_user_id,
        handle: s.handle,
        display_name: s.display_name,
        profile_url: s.profile_url,
        data_source: s.data_source,
        is_connected: s.is_connected,
        last_synced_at: s.last_synced_at,
      });
    }

    // 7. Metrics snapshots
    for (const m of c.metrics) {
      await insertRow("social_metric_snapshots", {
        creator_profile_id: profileId,
        platform: m.platform,
        platform_account: m.platform_account,
        metric_name: m.metric_name,
        value: m.value,
        source_type: m.source_type,
        source_ref: m.source_ref,
        captured_at: m.captured_at,
        is_latest: true,
      });
    }

    // 8. Verification request (pending)
    await insertRow("creator_verification_requests", {
      profile_id: profileId,
      creator_profile_id: profileId,
      evidence_urls: [`https://images.unsplash.com/photo-1551977165-5973dc0f32e7?w=600`],
      evidence_note: "Manual demonstration of portfolio and social presence.",
      status: "pending",
    });

    console.log(`  [seed] ✓ ${c.display_name} (creator)`);
  }

  // ---- Brands --------------------------------------------------------------
  for (let i = 0; i < BRANDS.length; i++) {
    const b = BRANDS[i];
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .insert({
        display_name: b.company_name,
        username: b.company_name.toLowerCase().replace(/\s+/g, "_"),
        bio: "Creative services agency. Publishes briefs for AI creators.",
        location: b.industry.includes("Fintech") ? "London, UK" : "New York, USA",
        languages: ["en"],
        role: "brand" as const,
        is_public: true,
        is_onboarding_complete: true,
      })
      .select("id")
      .single();
    if (profileErr) throw profileErr;
    const profileId = profile.id;

    await insertRow("brand_profiles", {
      profile_id: profileId,
      company_name: b.company_name,
      industry: b.industry,
      company_size: b.company_size,
      website_url: b.website_url,
      contact_email: b.contact_email,
      contact_phone: b.contact_phone,
      brand_aesthetic: b.brand_aesthetic,
      typical_campaigns: b.typical_campaigns,
      is_brand_verified: b.is_brand_verified,
    });

    console.log(`  [seed] ✓ ${b.company_name} (brand)`);
  }

  // ---- Portfolio is covered by creator rows (owner forced) ------------------
  // ------------------------------------------------------------
  // ------------------------------------------------------------
}

async function insertPortfolio(): Promise<void> {
  // Portfolio items are already inserted as part of creator insertion.
  // No-op here to keep the "one thing per function" rule clean.
}

async function insertBriefs(): Promise<void> {
  // Publish 5 demo briefs authored by the brands
  const brandProfileIds = [];
  {
    const { data, error } = await supabase.from("profiles").select("id").eq("role", "brand");
    if (error) throw error;
    brandProfileIds.push(...data.map((r: any) => r.id));
  }

  const briefSeed: Array<{
    title: string;
    objective: string;
    content_type: string;
    deliverables_count: number;
    platforms: string[];
    aspect_ratios: string[];
    budget_minor: number;
    deadline: string;
    license_notes: string;
    revision_count: number;
    preferred_tools: string[];
    usage_rights: string[];
  }> = [
    {
      title: "Lunar Launch — Brand Film",
      objective: "Announce the new product line with a cinematic brand film.",
      content_type: "motion",
      deliverables_count: 3,
      platforms: ["youtube", "instagram"],
      aspect_ratios: ["16:9", "9:16"],
      budget_minor: 250000,
      deadline: addDays(30),
      license_notes: "Paid ads and website use authorized.",
      revision_count: 2,
      preferred_tools: ["Runway", "After Effects"],
      usage_rights: ["paid_ads", "website", "streaming"],
    },
    {
      title: "Fintech Explainer",
      objective: "A 60-second explainer for a new savings product.",
      content_type: "motion",
      deliverables_count: 2,
      platforms: ["youtube", "tiktok"],
      aspect_ratios: ["16:9", "9:16"],
      budget_minor: 120000,
      deadline: addDays(21),
      license_notes: "Social and paid ads only; no re-sale.",
      revision_count: 3,
      preferred_tools: ["Blender"],
      usage_rights: ["social", "paid_ads"],
    },
    {
      title: "Pet Product Launch",
      objective: "Launch a new dog treat flavor with playful product animation.",
      content_type: "3d",
      deliverables_count: 2,
      platforms: ["tiktok", "instagram", "youtube"],
      aspect_ratios: ["9:16", "1:1", "16:9"],
      budget_minor: 80000,
      deadline: addDays(10),
      license_notes: "All owned rights including re-sale and merch.",
      revision_count: 2,
      preferred_tools: ["Blender", "KeyShot"],
      usage_rights: ["social", "paid_ads", "merch"],
    },
    {
      title: "AI Visuals Case Study",
      objective: "Demonstrate creative AI pipeline with before/after stills.",
      content_type: "still",
      deliverables_count: 5,
      platforms: ["instagram", "behance"],
      aspect_ratios: ["1:1", "4:5"],
      budget_minor: 45000,
      deadline: addDays(15),
      license_notes: "Portfolio + case study; no commercial license.",
      revision_count: 1,
      preferred_tools: ["Midjourney", "Photoshop"],
      usage_rights: ["portfolio"],
    },
    {
      title: "Wellness App Onboarding",
      objective: "Animated onboarding video for a meditation app.",
      content_type: "animation",
      deliverables_count: 1,
      platforms: ["app_store", "youtube"],
      aspect_ratios: ["16:9", "9:16"],
      budget_minor: 95000,
      deadline: addDays(25),
      license_notes: "App distribution and paid ads.",
      revision_count: 2,
      preferred_tools: ["After Effects", "Blender"],
      usage_rights: ["social", "app_store", "paid_ads"],
    },
  ];

  const briefs = await Promise.all(
    briefSeed.map(async (b) => {
      const brandId = brandProfileIds[Math.floor(Math.random() * brandProfileIds.length)];
      const { data, error } = await supabase
        .from("briefs")
        .insert({
          brand_profile_id: brandId,
          creator_profile_id: null, // no creator yet — the brand picks from discovery
          title: b.title,
          objective: b.objective,
          content_type: b.content_type,
          deliverables_count: b.deliverables_count,
          platforms: b.platforms,
          aspect_ratios: b.aspect_ratios,
          total_budget_minor: b.budget_minor,
          deadline_at: b.deadline,
          license_notes: b.license_notes,
          revision_count: b.revision_count,
          preferred_tools: b.preferred_tools,
          usage_rights: b.usage_rights,
          status: "published",
        })
        .select("id")
        .single();
      if (error) throw error;
      // brief_skills
      for (const skill of b.preferred_tools) {
        await supabase.from("brief_skills").insert({ brief_id: data.id, skill });
      }
      return data;
    })
  );
  console.log(`  [seed] ✓ ${briefs.length} briefs published`);
}

async function insertCollaborationLifecycle(): Promise<void> {
  // Create 8 collaboration requests spanning the lifecycle.
  const brandProfileIds = [];
  {
    const { data, error } = await supabase.from("profiles").select("id").eq("role", "brand");
    if (error) throw error;
    brandProfileIds.push(...data.map((r: any) => r.id));
  }
  const creatorProfileIds = [];
  {
    const { data, error } = supabase.from("profiles").select("id").eq("role", "creator");
    if (error) throw error;
    creatorProfileIds.push(...data.map((r: any) => r.id));
  }
  const publishedBriefs = [];
  {
    const { data, error } = supabase.from("briefs").select("id").eq("status", "published");
    if (error) throw error;
    publishedBriefs.push(...data.map((r: any) => r.id));
  }

  const lifecycle = [
    { status: "invited" as const, briefIdx: 0, creatorIdx: 0, message: "Hi Aarav! Love the cinematic promo in your portfolio. Would you be open to a 60-second brand film?" },
    { status: "invited" as const, briefIdx: 1, creatorIdx: 1, message: "Looking for a 3D explainer. A quick call to discuss." },
    { status: "invited" as const, briefIdx: 2, creatorIdx: 2, message: "This one is for Bark & Co. Project-ready within 10 days." },
    { status: "invited" as const, briefIdx: 3, creatorIdx: 3, message: "We need 5 portfolio pieces for a case study." },
    { status: "invited" as const, briefIdx: 4, creatorIdx: 4, message: "Onboarding video for a wellness app." },
    { status: "draft" as const, briefIdx: 1, creatorIdx: 5, message: "Proposing a concept but not yet published." },
    { status: "invited" as const, briefIdx: 2, creatorIdx: 6, message: "Interested in the pet treat launch." },
    { status: "invited" as const, briefIdx: 4, creatorIdx: 7, message: "Animated onboarding video, 9:16 format." },
  ];

  for (let i = 0; i < lifecycle.length; i++) {
    const task = lifecycle[i];
    const brandId = brandProfileIds[i % brandProfileIds.length];
    const creatorId = creatorProfileIds[task.creatorIdx % creatorProfileIds.length];
    const briefId = publishedBriefs[task.briefIdx % publishedBriefs.length];

    await insertRow("collaboration_requests", {
      brand_profile_id: brandId,
      creator_profile_id: creatorId,
      brief_id: briefId,
      message_text: task.message,
      status: task.status,
    });

    // create a matching quote for accepted invitation (i >= 5)
    if (task.status === "invited" && i >= 5) {
      const { data: creator, err } = supabase.from("profiles").select("id").eq("role", "creator").eq("username", creatorProfileIds[task.creatorIdx % creatorProfileIds.length]).single();
      // skip; already have the id
    }
  }

  console.log(`  [seed] ✓ ${lifecycle.length} collaboration requests`);
}

main().catch((err) => {
  console.error("[seed] FAILED:", err);
  process.exit(1);
});
