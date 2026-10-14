/**
 * src/lib/ai/catalog.ts
 * ---------------------------------------------------------------------------
 * The connectable-integration catalogue behind /ai-studio.
 *
 * Pure data — no env access, no secrets, safe for client and server. The page
 * computes `connected` flags server-side and passes plain booleans plus
 * variable *names* (never values) into the UI.
 *
 * Rule for entries: a real first-party API, and the note says what it unlocks
 * inside Proofreel rather than merely what the vendor sells.
 */

export const AI_CAPABILITIES = [
  { id: "brief", label: "Brief intelligence", blurb: "Turn a rough idea into a structured, priced brief." },
  { id: "visual", label: "Visual generation", blurb: "Stills, illustration, product and brand imagery." },
  { id: "motion", label: "Motion generation", blurb: "Text-to-video, image-to-video, animated sequences." },
  { id: "audio", label: "Audio & voice", blurb: "Voiceover, music beds, dubbing and transcription." },
  { id: "pipeline", label: "Pipeline & delivery", blurb: "Rendering, hosting, transcoding and delivery." },
  { id: "proof", label: "Proof feeds", blurb: "Signal sources behind a creator's evidence layers." },
] as const;

export type AiCapabilityId = (typeof AI_CAPABILITIES)[number]["id"];

export type Capability = (typeof AI_CAPABILITIES)[number];

export type Integration = {
  slug: string;
  name: string;
  capability: AiCapabilityId;
  /** What the vendor provides. */
  summary: string;
  /** What switching it on does inside Proofreel. */
  unlocks: string;
  /** Server-side variable names. Names are public; values are not. */
  envVars: string[];
  docsUrl: string;
};

export const INTEGRATIONS: Integration[] = [
  // ---------------------------------------------------------------- brief
  {
    slug: "google-gemini",
    name: "Google Gemini",
    capability: "brief",
    summary: "Multimodal LLM with a generous free tier and a clean JSON response mode.",
    unlocks: "Wired in. Powers the AI Brief Builder: a rough idea becomes goals, deliverables, platforms, budget and usage rights.",
    envVars: ["GEMINI_API_KEY"],
    docsUrl: "https://ai.google.dev/gemini-api/docs",
  },
  {
    slug: "openai",
    name: "OpenAI",
    capability: "brief",
    summary: "GPT-class models for drafting, plus Whisper for transcription and Sora for video.",
    unlocks: "Alternative drafting brain, plus speech-to-text so a voice note can seed a brief.",
    envVars: ["OPENAI_API_KEY"],
    docsUrl: "https://platform.openai.com/docs/overview",
  },
  {
    slug: "anthropic",
    name: "Anthropic Claude",
    capability: "brief",
    summary: "Long-context models that are strong at following strict output schemas.",
    unlocks: "Alternative drafting brain. Good fallback if a brief needs to digest a long brand guide.",
    envVars: ["ANTHROPIC_API_KEY"],
    docsUrl: "https://docs.anthropic.com/en/docs/overview",
  },
  {
    slug: "groq",
    name: "Groq",
    capability: "brief",
    summary: "Very low-latency inference on open models.",
    unlocks: "Near-instant brief drafts — useful when the builder should feel like autocomplete.",
    envVars: ["GROQ_API_KEY"],
    docsUrl: "https://console.groq.com/docs/overview",
  },
  {
    slug: "mistral",
    name: "Mistral AI",
    capability: "brief",
    summary: "Efficient European-hosted open and commercial models.",
    unlocks: "Data-residency-friendly drafting for brands that cannot send briefs offshore.",
    envVars: ["MISTRAL_API_KEY"],
    docsUrl: "https://docs.mistral.ai/",
  },
  {
    slug: "cohere",
    name: "Cohere",
    capability: "brief",
    summary: "RAG-first LLM platform with embeddings and reranking.",
    unlocks: "Semantic creator search: match a brief against portfolios by meaning, not keywords.",
    envVars: ["COHERE_API_KEY"],
    docsUrl: "https://docs.cohere.com/",
  },

  // --------------------------------------------------------------- visual
  {
    slug: "black-forest-labs",
    name: "Black Forest Labs (FLUX)",
    capability: "visual",
    summary: "FLUX family of image models, strong at text rendering and prompt adherence.",
    unlocks: "Brand-accurate key art and typographic stills generated from a brief.",
    envVars: ["BFL_API_KEY"],
    docsUrl: "https://docs.bfl.ai/",
  },
  {
    slug: "stability-ai",
    name: "Stability AI",
    capability: "visual",
    summary: "Stable Diffusion, upscaling, inpainting and 3D (Stable Fast 3D).",
    unlocks: "Iterative concepting on-device-free: variations, clean-up and upscale in one pipeline.",
    envVars: ["STABILITY_API_KEY"],
    docsUrl: "https://platform.stability.ai/docs/api-reference",
  },
  {
    slug: "ideogram",
    name: "Ideogram",
    capability: "visual",
    summary: "Image generation that is unusually good at legible typography.",
    unlocks: "Poster, packaging and thumbnail concepts where the words have to be readable.",
    envVars: ["IDEOGRAM_API_KEY"],
    docsUrl: "https://developer.ideogram.ai/",
  },
  {
    slug: "leonardo-ai",
    name: "Leonardo AI",
    capability: "visual",
    summary: "Style-led image generation with fine-tuned community models.",
    unlocks: "Style exploration for a campaign before a creator is booked.",
    envVars: ["LEONARDO_API_KEY"],
    docsUrl: "https://docs.leonardo.ai/",
  },
  {
    slug: "recraft",
    name: "Recraft",
    capability: "visual",
    summary: "Vector-native generation — SVG output, not just pixels.",
    unlocks: "Editable logo and icon concepts that survive a design handoff.",
    envVars: ["RECRAFT_API_KEY"],
    docsUrl: "https://www.recraft.ai/docs",
  },
  {
    slug: "adobe-firefly",
    name: "Adobe Firefly",
    capability: "visual",
    summary: "Commercially indemnified image models inside the Adobe ecosystem.",
    unlocks: "Enterprise-safe generation where IP provenance matters more than novelty.",
    envVars: ["FIREFLY_CLIENT_ID", "FIREFLY_CLIENT_SECRET"],
    docsUrl: "https://developer.adobe.com/firefly-services/docs/",
  },

  // --------------------------------------------------------------- motion
  {
    slug: "runway",
    name: "Runway",
    capability: "motion",
    summary: "Gen-3/Gen-4 video models with image-to-video, camera control and lip sync.",
    unlocks: "Shot-level motion tests, so a brief can show a look before anyone is booked.",
    envVars: ["RUNWAYML_API_SECRET"],
    docsUrl: "https://docs.dev.runwayml.com/",
  },
  {
    slug: "luma-ai",
    name: "Luma AI (Dream Machine)",
    capability: "motion",
    summary: "Fast, naturalistic image-to-video and keyframe interpolation.",
    unlocks: "Turn an approved still into a moving reference in minutes.",
    envVars: ["LUMA_API_KEY"],
    docsUrl: "https://docs.lumalabs.ai/",
  },
  {
    slug: "fal-ai",
    name: "fal.ai",
    capability: "motion",
    summary: "Hosted inference for hundreds of image, video and audio models behind one key.",
    unlocks: "One key reaches many vendors — good default when you do not want to integrate five at once.",
    envVars: ["FAL_KEY"],
    docsUrl: "https://docs.fal.ai/",
  },
  {
    slug: "replicate",
    name: "Replicate",
    capability: "motion",
    summary: "Run open-source and commercial models with a single API and per-second billing.",
    unlocks: "Broadest model coverage with the least integration work; great for experimenting.",
    envVars: ["REPLICATE_API_TOKEN"],
    docsUrl: "https://replicate.com/docs",
  },
  {
    slug: "kling-ai",
    name: "Kling AI",
    capability: "motion",
    summary: "Strong human-motion and physics fidelity in generated video.",
    unlocks: "People-and-product shots where limb and cloth behaviour has to look believable.",
    envVars: ["KLING_ACCESS_KEY", "KLING_SECRET_KEY"],
    docsUrl: "https://app.klingai.com/global/dev/document-api",
  },
  {
    slug: "google-veo",
    name: "Google Veo",
    capability: "motion",
    summary: "Google's video generation models, reachable through the Gemini API key.",
    unlocks: "Adds video to the same key already used for brief drafting — cheapest thing to switch on first.",
    envVars: ["GEMINI_API_KEY"],
    docsUrl: "https://ai.google.dev/gemini-api/docs/video",
  },

  // ---------------------------------------------------------------- audio
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    capability: "audio",
    summary: "Industry-default text-to-speech, voice cloning, dubbing and sound effects.",
    unlocks: "Voiceover for a concept cut, plus multilingual versions of an approved script.",
    envVars: ["ELEVENLABS_API_KEY"],
    docsUrl: "https://elevenlabs.io/docs/api-reference",
  },
  {
    slug: "cartesia",
    name: "Cartesia (Sonic)",
    capability: "audio",
    summary: "Ultra-low-latency voice synthesis built for real-time use.",
    unlocks: "Live voice in a creator's demo or a talking-head prototype.",
    envVars: ["CARTESIA_API_KEY"],
    docsUrl: "https://docs.cartesia.ai/",
  },
  {
    slug: "deepgram",
    name: "Deepgram",
    capability: "audio",
    summary: "Fast, accurate speech-to-text with diarisation and captions.",
    unlocks: "Auto-captioning and searchable transcripts for creator showreels.",
    envVars: ["DEEPGRAM_API_KEY"],
    docsUrl: "https://developers.deepgram.com/docs",
  },
  {
    slug: "assemblyai",
    name: "AssemblyAI",
    capability: "audio",
    summary: "Transcription with summarisation, topic detection and moderation.",
    unlocks: "Screening submissions: what is actually said in a clip, at scale.",
    envVars: ["ASSEMBLYAI_API_KEY"],
    docsUrl: "https://www.assemblyai.com/docs",
  },
  {
    slug: "playht",
    name: "PlayHT",
    capability: "audio",
    summary: "Voice cloning and TTS with a large preset voice library.",
    unlocks: "Alternative voice bed, useful when the client's brand voice differs per market.",
    envVars: ["PLAYHT_API_KEY", "PLAYHT_USER_ID"],
    docsUrl: "https://docs.play.ht/",
  },

  // ------------------------------------------------------------- pipeline
  {
    slug: "openrouter",
    name: "OpenRouter",
    capability: "pipeline",
    summary: "One gateway key across hundreds of models with automatic fallback.",
    unlocks: "Swap drafting models per workspace without shipping new code or new keys.",
    envVars: ["OPENROUTER_API_KEY"],
    docsUrl: "https://openrouter.ai/docs",
  },
  {
    slug: "hugging-face",
    name: "Hugging Face",
    capability: "pipeline",
    summary: "Inference endpoints for open models, plus dataset and model hosting.",
    unlocks: "Self-hosted or dedicated endpoints when a brand requires private inference.",
    envVars: ["HUGGINGFACE_API_TOKEN"],
    docsUrl: "https://huggingface.co/docs/api-inference/index",
  },
  {
    slug: "shotstack",
    name: "Shotstack",
    capability: "pipeline",
    summary: "Render API that edits video from a JSON timeline.",
    unlocks: "Programmatic assembly of delivered cuts — the deliverable, not just the concept.",
    envVars: ["SHOTSTACK_API_KEY"],
    docsUrl: "https://shotstack.io/docs/api/",
  },
  {
    slug: "mux",
    name: "Mux",
    capability: "pipeline",
    summary: "Video hosting, transcoding and per-second playback analytics.",
    unlocks: "Stream delivered work in the player, with real watch-through numbers as proof.",
    envVars: ["MUX_TOKEN_ID", "MUX_TOKEN_SECRET"],
    docsUrl: "https://www.mux.com/docs",
  },
  {
    slug: "cloudinary",
    name: "Cloudinary",
    capability: "pipeline",
    summary: "Media storage, transformation and CDN delivery for images and video.",
    unlocks: "Serve portfolio thumbnails at the right size instead of shipping originals.",
    envVars: ["CLOUDINARY_URL"],
    docsUrl: "https://cloudinary.com/documentation",
  },

  // ---------------------------------------------------------------- proof
  {
    slug: "youtube-data-api",
    name: "YouTube Data API",
    capability: "proof",
    summary: "Channel, upload and engagement data for a linked account.",
    unlocks: "Feeds the identity and craft layers: real uploads, real dates, real counts.",
    envVars: ["YOUTUBE_API_KEY"],
    docsUrl: "https://developers.google.com/youtube/v3/docs",
  },
  {
    slug: "instagram-graph",
    name: "Instagram Graph API",
    capability: "proof",
    summary: "Professional-account media and insights via OAuth.",
    unlocks: "Verifies the portfolio a creator claims on Instagram instead of trusting a screenshot.",
    envVars: ["INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET"],
    docsUrl: "https://developers.facebook.com/docs/instagram-platform",
  },
  {
    slug: "facebook-graph",
    name: "Facebook Graph API",
    capability: "proof",
    summary: "Pages, posts and audience data via OAuth.",
    unlocks: "Cross-checks reach claims for page-based creators and agencies.",
    envVars: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
    docsUrl: "https://developers.facebook.com/docs/graph-api",
  },
];

/** Capabilities in display order, each with its providers attached. */
export function groupedIntegrations() {
  return AI_CAPABILITIES.map((capability) => ({
    capability,
    integrations: INTEGRATIONS.filter((i) => i.capability === capability.id),
  }));
}

/** Total number of distinct server variables the whole catalogue would need. */
export function totalEnvVars(): number {
  return new Set(INTEGRATIONS.flatMap((i) => i.envVars)).size;
}
