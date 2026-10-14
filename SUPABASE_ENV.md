Supabase environment variables and Vercel mapping

This project already uses NEXT_PUBLIC_* names for client access and SUPABASE_SERVICE_ROLE_KEY for server-only operations. Vercel and some Supabase server libraries sometimes reference alternative names (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, etc.). To make deployments robust, add both sets of env var names in Vercel.

Required (minimum for frontend-only run)
- NEXT_PUBLIC_APP_URL (public) — e.g. https://proofreels.vercel.app
- NEXT_PUBLIC_SUPABASE_URL (public) — e.g. https://<project-ref>.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY (public)

Recommended server env vars (set as Secret in Vercel, server-only)
- SUPABASE_SERVICE_ROLE_KEY (server-only) — service role key used only on server; DO NOT expose to client
- SUPABASE_URL — canonical Supabase URL (useful for server libs expecting this name)
- SUPABASE_PUBLISHABLE_KEY — equivalent to the anon/publishable key
- SUPABASE_SECRET_KEY — service-role key (equivalent to SUPABASE_SERVICE_ROLE_KEY)
- SUPABASE_JWKS_URL — https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json (used for JWT verification in some runtimes)

Notes and mapping
- Code in this repo reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for client usage and uses SUPABASE_SERVICE_ROLE_KEY for server-only actions (see src/lib/env.ts and src/lib/supabase/client.ts).
- Adding SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY in Vercel helps any server middleware, Edge Functions, or third-party libraries that expect those names.
- Always mark service-role/secret keys as `Environment Variable (Secret)` in Vercel and only set them for Production (or Preview if you trust the environment).

How to add in Vercel
1. Go to your Project → Settings → Environment Variables.
2. Add the variables above. For each secret (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY) set the `Environment Variable Type` to `Secret`.
3. Add the vars to the Environment scopes you need (Preview, Production, Development).

Quick local testing
- Copy .env.example to .env.local and add at least the NEXT_PUBLIC_* values and NEXT_PUBLIC_APP_URL.
- For server-local testing, set SUPABASE_SERVICE_ROLE_KEY in .env.local but NEVER commit .env.local to git.

Why we include both sets
- The repo's code uses NEXT_PUBLIC_* for browser-safe values and SUPABASE_SERVICE_ROLE_KEY on server.
- Some deployment/tooling (or examples from Vercel) refer to SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY; providing both ensures compatibility and reduces surprises during deployment.

If you want, I can:
- Add these env names to DEPLOYMENT.md (or update .env.example) — I can push the change.
- Verify server code expecting different names and add a small shim that reads either name (e.g., prefer NEXT_PUBLIC_* but fallback to SUPABASE_*), so the code works regardless of which names you set in Vercel.
