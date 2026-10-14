# Proofreel — Profile & Brief Data Model

This note explains the two core records a brand cares about: **what a creator
can do** (profile) and **what a brand is buying** (brief). Field names match the
SQL in [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
and the TypeScript mirrors in [`src/types/database.ts`](../src/types/database.ts).

For the working demo, the same shapes are served from
[`src/lib/demo/database.ts`](../src/lib/demo/database.ts) when no live database
is connected.

---

## 1. Creator profile

Split into a shared identity row plus a creator-specific row, so brands and
creators share one auth/identity model.

### `profiles` — shared identity
| Field | Type | Purpose |
|---|---|---|
| `auth_id` | uuid (unique) | Links to the auth user |
| `display_name`, `username` | text | Public identity and `/creators/[username]` route |
| `bio`, `location`, `languages[]` | text | Discovery text and language filtering |
| `role` | enum `creator \| brand \| admin` | Server-decided; never trusted from the browser |
| `is_public` | boolean | Gate for public discovery |
| `is_onboarding_complete` | boolean | Drives the onboarding flow |

### `creator_profiles` — the AI-capability record
| Field | Type | Why it matters |
|---|---|---|
| `art_form[]` | text array | Broad discipline: `motion`, `still`, `3d`, `ui`, `audio`, `writing` |
| `specialty` | text | One-line positioning ("AI-generated cinematic trailers") |
| `experience_years` | int | Seniority filter |
| `availability` | text | Free-text capacity signal surfaced on cards |
| `hourly_rate_minor`, `min_project_size_minor` | int | Rates in **minor units** (100 = ₹1). Enables budget filtering without float drift |
| `is_profile_verified` | boolean | Drives the verification badge |
| portal URLs (`portfolio_url`, `website_url`, `instagram_url`, `youtube_url`, `behance_url`, `twitter_url`) | text | Outbound proof of work |

### `creator_tools` — the "how was this made" signal
| Field | Type | Purpose |
|---|---|---|
| `tool_name` | text | e.g. `Runway`, `Blender`, `Figma` |
| `tool_description` | text | What the tool is used for |
| `workflow_step` | text | Which stage the tool belongs to |

In the demo layer each tool maps to a concrete model via `MODEL_BY_TOOL`
(e.g. `Runway` → `Runway Gen-3 Alpha`), which is what the profile page shows as
**AI models / services used**.

### `creator_workflow` — documented process
| Field | Type | Purpose |
|---|---|---|
| `title`, `description` | text | Ordered production steps |
| `step_order` | int | Preserves sequence |
| `is_public` | boolean | Owner controls disclosure |

### `portfolio_items` — the AI portfolio
| Field | Type | Purpose |
|---|---|---|
| `title`, `description`, `category`, `content_type` | text | What the piece is |
| `url`, `image_url` | text | Preview + outbound link |
| `is_public` | boolean | Owner controls visibility |
| `is_owned_by_creator`, `ownership_note` | bool/text | Ownership assertion shown on the card |

### Supporting evidence tables
- `social_accounts` — connected/claimed profiles (`platform`, `handle`, `is_connected`, `last_synced_at`).
- `social_metric_snapshots` — time-stamped metrics with `source_type` (`manual` / `imported` / `api`) so a number is never shown without provenance.
- `creator_verification_requests` — `status` (`pending`/`under_review`/`reviewed`/`rejected`), `evidence_urls[]`, reviewer fields. Feeds the **Proof Passport**, which scores profile completeness, portfolio, tools, workflow, socials, metrics and verification separately (never one opaque global badge).

---

## 2. Brief

### `briefs`
| Group | Fields |
|---|---|
| Identity | `id`, `brand_profile_id`, `creator_profile_id` (nullable until matched), `title`, `objective` |
| Creative direction | `target_audience`, `style`, `content_type`, `deliverables_count` |
| **Format** | `platforms[]`, `aspect_ratios[]` — enum-validated so a brief can never request an unsupported shape |
| **Commercial use** | `license_notes`, `usage_rights[]`, `revision_count` |
| Commercials | `total_budget_minor`, `deadline_at` |
| AI provenance | `generated_by_ai`, `ai_model_used`, `ai_prompt_record` — an AI-drafted brief is always attributable |
| Lifecycle | `status` (`draft`/`published`/`archived`/`closed`) |

### Controlled vocabularies
Defined once in [`src/lib/constants.ts`](../src/lib/constants.ts) and enforced by
[`src/lib/validations/brief.ts`](../src/lib/validations/brief.ts):

- **Content type** — `motion`, `still`, `3d`, `ui`, `audio`, `writing`
- **Platforms** — `youtube`, `instagram`, `facebook`, `tiktok`, `linkedin`, `twitter`, `web`, `app_store`
- **Aspect ratios** — `16:9`, `9:16`, `1:1`, `4:5`, `21:9`
- **Usage rights (commercial-use enum)** — `social`, `paid_ads`, `website`, `streaming`, `merch`, `theatrical`, `app_store`, `portfolio`

### `brief_skills` — bridge table
Many-to-many between briefs and the skills/tools a brand wants, so discovery can
match creator skills against brief requirements rather than doing string search.

---

## 3. Why minor units

Every money field is stored in minor units and formatted at the edge
(`formatMinorUnits`). Search, sorting and range filters therefore run on
integers — no rounding drift, no locale parsing in the database.
