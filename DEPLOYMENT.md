# Vercel deployment guide

This file explains how to deploy the project to Vercel and run the frontend-only version so you can iterate without a full backend.

Steps

1. Connect the repository
   - Go to https://vercel.com and sign in.
   - Import Project → Select "From Git Repository" and pick `suryatejalingamguntla05-cpu/proofreel`.

2. Node version
   - This repository includes `.nvmrc` pinned to `18.17.0`. Vercel usually respects `.nvmrc` automatically; if your project settings require it, set Node.js version to `18.17.0` in Project Settings > General > Node.js Version.

3. Environment variables (minimum for frontend-only run)
   - In Project Settings > Environment Variables add at least:
     - NEXT_PUBLIC_APP_URL = https://<your-vercel-deploy-url> or http://localhost:3000 (for local testing)
   - For a cleaner startup you may add dummy public Supabase values (these are safe public values used only for client boot):
     - NEXT_PUBLIC_SUPABASE_URL = https://example.supabase.co
     - NEXT_PUBLIC_SUPABASE_ANON_KEY = example-anon-key
   - If you want full Supabase functionality, add the real values:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY (server-only; mark as a secret and do NOT expose as NEXT_PUBLIC_*)
   - Optional integrations (only if used): GEMINI_API_KEY, YOUTUBE_API_KEY, INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET

4. Build & Output
   - Vercel should auto-detect Next.js. Build command: `npm run build` (default). Output directory: leave blank (Next.js default).

5. Deploy
   - Trigger a new deployment from Vercel UI or push a commit to the repository.

Troubleshooting

- Build fails with missing env errors: make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. The repository contains safe proxies for missing Supabase config but some pages that reference Supabase on the server can throw when the service-role key is required.
- If you see Node version mismatch, set Node in Project Settings to `18.17.0`.
- If installation fails due to peer deps, you can temporarily change Install Command to `npm ci --legacy-peer-deps` (not recommended long-term).

Local quick-start

1. Clone and install
   - git clone https://github.com/suryatejalingamguntla05-cpu/proofreel
   - cd proofreel
   - cp .env.example .env.local
   - Edit `.env.local` and set at minimum `NEXT_PUBLIC_APP_URL`.
   - npm ci

2. Development server
   - npm run dev
   - Open http://localhost:3000

If you'd like, I can also add a minimal `vercel.json` or change the project to avoid server-only Supabase calls during build; tell me if you want me to commit more changes.
