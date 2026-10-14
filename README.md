# Proofreel

Proofreel is a demo-first marketplace concept connecting AI creators with brands and agencies. The demo includes a bundled creator and brief catalogue, creator discovery, public profiles, and a structured brief builder.

## Get started

Requirements: Node.js 18.17 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is already occupied, Next.js will start on another available port and print its URL in the terminal.

The public marketplace and demo sign-in can be explored without setting up a database. The main entry points are:

- `/creators` — browse and filter the sample creator catalogue.
- `/briefs` — browse sample brand and agency briefs.
- `/briefs/new` — try the brief builder.
- `/login` or `/register` — enter as a demo creator or brand.

On the login page, use any email containing `brand` to enter the brand/agency experience; other email addresses enter as a creator. Registration also lets you choose a role. Demo session information is stored in the browser, and sample content is not persisted to a backend.

## Configuration

No environment file is required for the core demo. Demo catalogue mode is enabled by default. Set `NEXT_PUBLIC_DEMO_MODE=false` to disable the preference for bundled demo data.

The brief builder can use Gemini when configured; without an API key it uses its local deterministic fallback:

```env
GEMINI_API_KEY=your-gemini-api-key
# Optional; defaults to the configured provider model.
GEMINI_MODEL=gemini-2.0-flash
```

Copy `.env.example` to `.env.local` only if you need optional integrations. Never commit secrets or `.env.local`.

## Deploy to Vercel

1. Import this GitHub repository in Vercel and keep the detected **Next.js** framework preset.
2. Use the default install/build settings (`npm install` and `npm run build`); no custom output directory or `vercel.json` is needed.
3. No environment variables are required for the demo. Vercel's deployment URL is used automatically for metadata and auth callback URLs; `NEXT_PUBLIC_APP_URL` can optionally override it with the canonical site URL.
4. `GEMINI_API_KEY` is optional. Without it, the brief builder uses its local deterministic fallback.
5. Deploy. The creator/brand demo workspaces and bundled marketplace data work without Supabase.

Demo sessions and submissions are not production authentication or durable storage. Brief creation and Creative Fit Report API calls return a clear `503` response when no Supabase database is configured; public creator and brief discovery APIs return bundled sample data instead. Configure Supabase only if using the legacy database-backed account and write flows, and do not use demo sessions to protect real user data.

## Demo workspaces

- `/creator` — creator workspace with sample profile and project discovery.
- `/brand` — brand/agency workspace with brief creation and creator discovery.
- `/creators` and `/briefs` — public sample marketplaces.
- `/briefs/new` — interactive brief builder; submissions are not saved in demo mode.

## Useful commands

```bash
npm run dev        # Start the development server
npm run build      # Create a production build
npm run start      # Serve the production build
npm run typecheck  # Run the TypeScript check
npm run lint       # Run Next.js linting
npm test           # Run unit tests
npm run test:e2e   # Run Playwright end-to-end tests
```

For the first end-to-end test run on a machine, install Playwright's Chromium browser with `npx playwright install chromium`.

## Tech stack

- Next.js 14 with the App Router
- React 18 and TypeScript
- Tailwind CSS
- Vitest and Playwright

## Demo data

The bundled sample catalogue and demo mode flag live in [`src/lib/demo/database.ts`](src/lib/demo/database.ts). Browser demo-session state is handled in [`src/lib/demo/session.ts`](src/lib/demo/session.ts). Sample data is illustrative and should not be treated as real creator, brand, or campaign information.
