# Proofreel — Demo Walkthrough (≈4 minutes)

Runs with **no database and no API keys**: public surfaces serve bundled demo
data, and the AI brief builder falls back to a deterministic local template.

Start the app, then follow the steps below. Base URL:
`http://localhost:59698` (or whatever `npm run start -- -p <port>` binds).

---

## Step 1 — Creator discovery & filtering  · *Discovery & Filtering (25%)*

Open **`/creators`**.

1. Click **`animation`** under *Skills / specialization* and **`Runway Gen-3 Alpha`**
   under *Tools / AI models*. Press **Apply**.
   → 5 creators remain; the summary line states which filters are active and how
   many of them are verified.
2. Add content type **`audio`**.
   → The empty state names the exact filters that removed every match and offers
   **Clear all filters** — no dead end. *(Rubric explicitly asks for sensible
   empty-result handling.)*
3. Tick **Verified creators only** to show the verification filter.

**What to say:** filtering is multi-dimensional — free text, skills, tools/models,
content type, budget range, language, availability and verification — and the
result count plus active-filter list stays visible so a brand always knows why
it is seeing what it sees.

## Step 2 — AI creator profile  · *Creator Profiles & AI Portfolios (30%)*

From the grid open any card, e.g. **Aarav Mehta** → `/creators/aaraav_filmworks`.

Point out, top to bottom:
- **Verification badge** — "Verified tools & workflow" vs "Verification pending".
- **Proof Passport** — per-factor breakdown (profile, portfolio, tools, workflow,
  social, metrics, verification) rather than one opaque score.
- **Tools & AI models** — the tools *and* the concrete models behind them
  (`Runway` → `Runway Gen-3 Alpha`, `Midjourney v6`, `SDXL`, …).
- **Production workflow** — the numbered AI-native process, i.e. evidence of
  *how* the work is made, not just that it exists.
- **Portfolio** — items with category, content type and an ownership assertion.

**What to say:** the rubric asks for tools/models, skills, specialization and
workflow; all four are visible on one screen, backed by a per-factor trust score.

## Step 3 — Brief definition  · *Brief Definition (20%)*

Open **`/briefs`** → click **Lunar Launch — Brand Film** (`/briefs/demo-brief-1`).

Walk through the spec grid — **content type, deliverables, platforms, aspect
ratios, budget, deadline** — then the two panels:
- **Commercial use** — usage rights as enum chips (`paid ads`, `website`,
  `streaming`), plain-language licence notes, and revision rounds included.
- **Preferred tools** — tool preferences plus formats and delivery summary.

**What to say:** style, format/aspect ratio and commercial-use are first-class
required fields, validated against closed vocabularies, not free text.

## Step 4 — AI-Assisted Brief Builder  · *Bonus → Brief Definition*

Open **`/briefs/new`**.

1. Type a rough idea, e.g. *"Launch our new sustainable sneaker line with a
   45-second cinematic brand film for Instagram and YouTube"*.
2. Click **Generate draft with AI** → the draft comes back filled in (a note says
   whether it was AI-generated or built from the local template, so the origin is
   never ambiguous).
3. Click through the seven steps (**Goal → Audience → Content → Platform →
   Budget → License → Review**), setting content type, platforms, aspect ratios,
   budget and licence/usage along the way.
4. On **Review**, press **Publish brief**.

**What to say:** a rough idea becomes a complete, structured, commercial-ready
brief. In demo mode the final screen shows the structured brief instead of
writing to a database — the same payload the production API persists.

---

## Rubric map

| Criterion | Where | Evidence |
|---|---|---|
| Creator Profiles & AI Portfolios (30%) | `/creators/[username]` | Art forms, skills, specialty, tools **and models**, numbered workflow, portfolio with ownership, Proof Passport |
| Verification signals (bonus) | Profile header + Passport | Verified / pending badge, per-factor trust breakdown, admin-reviewed request status |
| Brief Definition (20%) | `/briefs`, `/briefs/[id]`, `/briefs/new` | Content type, style, aspect ratio, platforms, deliverables, budget, deadline, usage-rights enum, licence notes, revisions |
| AI Brief Builder (bonus) | `/briefs/new` | Rough idea → structured brief across 7 steps, with provenance labelling |
| Discovery & Filtering (25%) | `/creators` | Skills, tools/models, content type, budget, language, availability, verified-only + explicit empty state |
| User Experience (15%) | All public routes | No database required to demo, clear badges, labelled demo data, one-click filter reset |
| Presentation & Demo (10%) | This document | Timed walkthrough mapped to the rubric |

---

## Known gaps (state honestly if asked)

- Dashboard routes behind sign-in (`/creator`, `/brand`, `/settings`, `/messages`)
  are not built; the demo covers the public marketplace, brief and discovery flows.
- The demo dataset is bundled static data — it does not write to a database.
- Live auth needs a real Supabase project plus a valid service-role key.
