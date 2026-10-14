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

Copy `.env.example` to `.env.local` only if you need optional integrations. Never commit secrets or `.env.local`. Some legacy API and integration routes still contain Supabase-backed behavior; the demo sign-in is not production authentication, and demo session data is not suitable for protecting real user data.

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

## Tech stack

- Next.js 14 with the App Router
- React 18 and TypeScript
- Tailwind CSS
- Vitest and Playwright

## Demo data

The bundled sample catalogue and demo mode flag live in [`src/lib/demo/database.ts`](src/lib/demo/database.ts). Browser demo-session state is handled in [`src/lib/demo/session.ts`](src/lib/demo/session.ts). Sample data is illustrative and should not be treated as real creator, brand, or campaign information.
