/**
 * src/lib/env.ts
 * ---------------------------------------------------------------------------
 * Environment variable access + validation helpers.
 *
 * Rules:
 *  * Variables prefixed NEXT_PUBLIC_* are exposed to the browser bundle and
 *    must NEVER contain service-role credentials.
 *  * Server-only variables (SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY) are
 *    read via requireServerEnv/requireSecret which throw an actionable error
 *    ONLY when the value is actually used — so a fresh checkout still builds.
 *  * No real secret values are hardcoded anywhere in source.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** True when the variable is set to a non-empty string. */
export function hasEnv(name: string): boolean {
  return read(name) !== undefined;
}

/**
 * Read a required server variable. Throws an actionable message when missing,
 * instead of quietly continuing with an unusable configuration.
 */
export function requireServerEnv(name: "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in, then restart the dev server. Never commit .env.local or expose this key in the browser.`
    );
  }
  return value;
}

/** Read a required public variable (used lazily by Supabase clients). */
export function requirePublicEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_APP_URL"
): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in, then restart the dev server.`
    );
  }
  if (name === "NEXT_PUBLIC_APP_URL") {
    try {
      new URL(value);
    } catch {
      throw new Error(`NEXT_PUBLIC_APP_URL must be a full URL (e.g. http://localhost:3000), got "${value}".`);
    }
  }
  return value;
}

/** Public app URL with a build-safe default. */
export function appUrl(): string {
  const configured = read("NEXT_PUBLIC_APP_URL");
  if (configured) return configured.replace(/\/+$/, "");

  const productionUrl = read("VERCEL_PROJECT_PRODUCTION_URL");
  const deploymentUrl = read("VERCEL_URL");
  const vercelUrl =
    read("VERCEL_ENV") === "production"
      ? productionUrl ?? deploymentUrl
      : deploymentUrl ?? productionUrl;
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// Convenience flags — safe to read at import time (never throw).
// ---------------------------------------------------------------------------
export function isSupabaseConfigured(): boolean {
  return hasEnv("NEXT_PUBLIC_SUPABASE_URL") && hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && hasEnv("SUPABASE_SERVICE_ROLE_KEY");
}

/** Feature flags for optional integrations (all safely optional). */
export const optionalIntegrations = {
  gemini: hasEnv("GEMINI_API_KEY"),
  youtube: hasEnv("YOUTUBE_API_KEY"),
  instagram: hasEnv("INSTAGRAM_CLIENT_ID") && hasEnv("INSTAGRAM_CLIENT_SECRET"),
  facebook: hasEnv("FACEBOOK_APP_ID") && hasEnv("FACEBOOK_APP_SECRET"),
} as const;
