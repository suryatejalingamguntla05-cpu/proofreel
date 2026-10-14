-- ============================================================================
-- Proofreel — Initial schema
-- Version: 001
--
-- Run with: supabase db push   (or supabase db migrate after recording a migration)
--
-- Notes:
--  * All currency amounts are stored in minor units (100 = 1 base currency, e.g. 1 INR).
--  * All timestamps are stored as UTC and displayed in the user's timezone.
--  * Public columns that are NULL may be hidden from non-owners.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

CREATE TYPE public."user_role" AS ENUM ('creator', 'brand', 'admin');

-- Brief lifecycle
CREATE TYPE public.brief_status AS ENUM (
  'draft', 'published', 'archived', 'closed'
);

-- Collaboration lifecycle
CREATE TYPE public.collaboration_status AS ENUM (
  'draft', 'invited', 'in_progress', 'on_hold', 'delivering', 'completed', 'archived'
);

-- Verification review status
CREATE TYPE public.verification_status AS ENUM (
  'pending', 'under_review', 'reviewed', 'rejected'
);

-- Quote status
CREATE TYPE public.quote_status AS ENUM ('draft', 'submitted', 'accepted', 'declined', 'expired');

-- Agreement status
CREATE TYPE public.agreement_status AS ENUM ('draft', 'signed', 'accepted', 'declined', 'expired');

-- Milestone status
CREATE TYPE public.milestone_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'blocked');

-- Deliverable status
CREATE TYPE public.deliverable_status AS ENUM ('todo', 'submitted', 'in_revision', 'approved', 'rejected', 'completed');

-- Revision status
CREATE TYPE public.revision_status AS ENUM ('pending', 'approved', 'rejected');

-- Conversation message read status
CREATE TYPE public.message_read_status AS ENUM ('read', 'unread', 'deleted');

-- ----------------------------------------------------------------------------
-- Profiles
-- ----------------------------------------------------------------------------

CREATE TABLE public.profiles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id            UUID NOT NULL UNIQUE,

    -- Core identity
    display_name       TEXT NOT NULL,
    username           TEXT NOT NULL,
    bio                TEXT,
    location           TEXT,
    languages          TEXT[],             -- e.g. ['en', 'hi', 'ta']
    avatar_url         TEXT,

    -- Onboarding flags
    is_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    role               public.user_role NOT NULL DEFAULT 'creator',

    -- Visibility
    is_public          BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT profiles_username_unique UNIQUE (username),
    CONSTRAINT profiles_auth_id_fkey FOREIGN KEY (auth_id)
        REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.profiles IS 'Stores display profiles for authenticated users. Type is "creator" or "brand".';

-- ----------------------------------------------------------------------------
-- Creator profiles
-- ----------------------------------------------------------------------------

CREATE TABLE public.creator_profiles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id         UUID NOT NULL UNIQUE,

    -- Portfolio / showreel
    portfolio_url      TEXT,
    website_url        TEXT,
    instagram_url      TEXT,
    twitter_url        TEXT,
    youtube_url        TEXT,
    behance_url        TEXT,
    dribbble_url       TEXT,
    artstation_url     TEXT,

    -- Identity of the creative
    art_form           TEXT[],
    specialty          TEXT,
    experience_years   INTEGER,
    education          TEXT,
    years_in_industry  INTEGER,

    -- Business details
    availability       TEXT,               -- free-text availability window
    hourly_rate_minor  INTEGER NOT NULL DEFAULT 0,
    min_project_size_minor INTEGER NOT NULL DEFAULT 0,

    -- Proof status
    is_profile_verified  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT creator_profiles_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.creator_profiles IS 'Extended business/creator details. A creator type has exactly one row.';

-- ----------------------------------------------------------------------------
-- Brand profiles
-- ----------------------------------------------------------------------------

CREATE TABLE public.brand_profiles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id         UUID NOT NULL UNIQUE,

    -- Business identity
    company_name       TEXT NOT NULL,
    industry           TEXT,
    company_size       TEXT,
    website_url        TEXT,
    contact_email      TEXT,
    contact_phone      TEXT,

    -- Brand voice / needs
    brand_aesthetic    TEXT,
    typical_campaigns  TEXT[],

    -- Verification
    is_brand_verified  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT brand_profiles_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.brand_profiles IS 'Extended business details for a brand/agency.';

-- ----------------------------------------------------------------------------
-- Portfolio items
-- ----------------------------------------------------------------------------

CREATE TABLE public.portfolio_items (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID NOT NULL,

    -- Content
    title              TEXT NOT NULL,
    description        TEXT,
    category           TEXT NOT NULL,       -- e.g. 'motion', 'still', '3d', 'ui', 'audio', 'writing'
    content_type       TEXT NOT NULL,       -- e.g. 'image', 'video', 'animation', 'audio', 'document', 'link'
    url                TEXT,                 -- hosted asset or Vimeo/YouTube link
    image_url          TEXT,                 -- thumbnail / preview

    -- Visibility
    is_public          BOOLEAN NOT NULL DEFAULT FALSE,

    -- Provenance metadata (so we never imply ownership wrongly)
    is_owned_by_creator BOOLEAN NOT NULL DEFAULT FALSE,
    ownership_note     TEXT,

    -- Audit
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT portfolio_items_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_portfolio_creator ON public.portfolio_items (creator_profile_id);
CREATE INDEX idx_portfolio_public ON public.portfolio_items (is_public) WHERE is_public = true;

COMMENT ON TABLE public.portfolio_items IS 'Published/visible portfolio work a creator showcases. Defaults to private.';

-- ----------------------------------------------------------------------------
-- Creator tools & workflow
-- ----------------------------------------------------------------------------

CREATE TABLE public.creator_tools (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID NOT NULL,

    tool_name          TEXT NOT NULL,
    tool_description   TEXT,
    workflow_step      TEXT NOT NULL,        -- e.g. 'ideation', 'preproduction', 'production', 'post'
    is_used            BOOLEAN NOT NULL DEFAULT TRUE,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT creator_tools_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_tools_creator ON public.creator_tools (creator_profile_id);

CREATE TABLE public.creator_workflow (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID NOT NULL,

    title              TEXT NOT NULL,
    description        TEXT,
    step_order         INTEGER NOT NULL DEFAULT 0,
    is_public          BOOLEAN NOT NULL DEFAULT TRUE,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT creator_workflow_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_workflow_creator ON public.creator_workflow (creator_profile_id);

-- ----------------------------------------------------------------------------
-- Social accounts
-- ----------------------------------------------------------------------------

CREATE TABLE public.social_accounts (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID NOT NULL,

    platform           TEXT NOT NULL,        -- 'youtube', 'instagram', 'facebook', 'twitter', 'tiktok', 'linkedin'
    platform_user_id   TEXT NOT NULL,        -- the platform's user id (opaque; never shown raw)
    handle             TEXT,
    display_name       TEXT,
    profile_url        TEXT,

    -- "How do we know this number is accurate?"
    data_source        TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'imported' | 'submitted'
    is_connected       BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at     TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT social_accounts_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    CONSTRAINT social_accounts_platform_unique UNIQUE (platform, platform_user_id)
);

CREATE INDEX idx_social_creator ON public.social_accounts (creator_profile_id);

COMMENT ON TABLE public.social_accounts IS 'Connectors or manually-entered social handles. "data_source" records how the figures were obtained.';

-- ----------------------------------------------------------------------------
-- Social metric snapshots (historical evidence, time-series)
-- ----------------------------------------------------------------------------

CREATE TABLE public.social_metric_snapshots (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID NOT NULL,

    platform           TEXT NOT NULL,
    platform_account   TEXT NOT NULL,
    metric_name        TEXT NOT NULL,        -- 'followers', 'likes', 'views', 'engagers', 'watch_hours', 'posts'
    value              BIGINT NOT NULL,      -- stored as integer (no float drift)
    unit               TEXT NOT NULL DEFAULT 'count',
    source_type        TEXT NOT NULL,        -- 'manual' | 'api' | 'user_submitted'
    source_ref         TEXT,                  -- opaque reference id from the source
    captured_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_latest          BOOLEAN NOT NULL DEFAULT FALSE,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT social_metric_snapshots_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_metrics_creator ON public.social_metric_snapshots (creator_profile_id, captured_at DESC);
CREATE INDEX idx_metrics_platform ON public.social_metric_snapshots (platform, captured_at DESC);

COMMENT ON TABLE public.social_metric_snapshots IS 'Historical snapshots of social metrics. Each row is one metric, one timestamp, one source.';

-- ----------------------------------------------------------------------------
-- Creator verification requests
-- ----------------------------------------------------------------------------

CREATE TABLE public.creator_verification_requests (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    creator_profile_id UUID NOT NULL UNIQUE,
    profile_id         UUID NOT NULL,

    -- Evidence uploaded with the request
    evidence_urls      TEXT[],
    evidence_note      TEXT,

    -- Decision
    status             public.verification_status NOT NULL DEFAULT 'pending',
    reviewed_by        UUID,
    decision_notes     TEXT,
    reviewed_at        TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT creator_verification_requests_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    CONSTRAINT creator_verification_requests_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_creator ON public.creator_verification_requests (creator_profile_id);

COMMENT ON TABLE public.creator_verification_requests IS 'Admin-driven verification requests. Only authorized admins can review.';

-- ----------------------------------------------------------------------------
-- Briefs (publishes by both creator & brand)
-- ----------------------------------------------------------------------------

CREATE TABLE public.briefs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID REFERENCES public.creator_profiles(id) ON DELETE SET NULL,
    brand_profile_id   UUID NOT NULL,

    -- Content
    title              TEXT NOT NULL,
    objective          TEXT NOT NULL,
    target_audience    TEXT,
    style              TEXT,
    content_type       TEXT NOT NULL,
    deliverables_count INTEGER NOT NULL DEFAULT 1,
    platforms          TEXT[],                -- e.g. ['instagram', 'tiktok', 'youtube']
    aspect_ratios      TEXT[],
    total_budget_minor INTEGER NOT NULL DEFAULT 0,
    deadline_at        TIMESTAMPTZ NOT NULL,

    -- Legal / licensing
    license_notes      TEXT,
    revision_count     INTEGER NOT NULL DEFAULT 0,
    preferred_tools    TEXT[],
    usage_rights       TEXT[],                -- e.g. 'paid_ads', 'social', 'website', 'streaming', 'theatrical'

    -- Workflow
    status             public.brief_status NOT NULL DEFAULT 'draft',
    expected_handoff   TEXT,
    generated_by_ai    BOOLEAN NOT NULL DEFAULT FALSE,
    ai_model_used      TEXT,
    ai_prompt_record   TEXT,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT briefs_brand_profile_id_fkey
        FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_briefs_brand ON public.briefs (brand_profile_id, created_at DESC);
CREATE INDEX idx_briefs_status ON public.briefs (status);

COMMENT ON TABLE public.briefs IS 'Published creative briefs. Brands manage their own; creators can only read public ones.';

-- ----------------------------------------------------------------------------
-- Brief skills (mapping to creator skills for matching)
-- ----------------------------------------------------------------------------

CREATE TABLE public.brief_skills (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id           UUID NOT NULL,

    skill              TEXT NOT NULL,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT brief_skills_brief_id_fkey
        FOREIGN KEY (brief_id) REFERENCES public.briefs(id) ON DELETE CASCADE
);

CREATE INDEX idx_brief_skills_brief ON public.brief_skills (brief_id);

-- ----------------------------------------------------------------------------
-- Saved creators (brand shortlist)
-- ----------------------------------------------------------------------------

CREATE TABLE public.saved_creators (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id   UUID NOT NULL,
    creator_profile_id UUID NOT NULL,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT saved_creators_unique UNIQUE (brand_profile_id, creator_profile_id),
    CONSTRAINT saved_creators_brand_fkey
        FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    CONSTRAINT saved_creators_creator_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_brand ON public.saved_creators (brand_profile_id);

-- ----------------------------------------------------------------------------
-- Collaboration requests
-- ----------------------------------------------------------------------------

CREATE TABLE public.collaboration_requests (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    brand_profile_id   UUID NOT NULL,
    creator_profile_id UUID NOT NULL,

    brief_id           UUID NOT NULL,
    message_text       TEXT NOT NULL,
    quote_minor        INTEGER,                 -- if the creator already quoted, or NULL
    status             public.collaboration_status NOT NULL DEFAULT 'invited',

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT collaboration_requests_unique UNIQUE (brand_profile_id, creator_profile_id, brief_id),
    CONSTRAINT collaboration_requests_brand_fkey
        FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    CONSTRAINT collaboration_requests_creator_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    CONSTRAINT collaboration_requests_brief_fkey
        FOREIGN KEY (brief_id) REFERENCES public.briefs(id) ON DELETE CASCADE
);

CREATE INDEX idx_collab_requests_creator ON public.collaboration_requests (creator_profile_id);
CREATE INDEX idx_collab_requests_brand ON public.collaboration_requests (brand_profile_id);

-- ----------------------------------------------------------------------------
-- Quotes
-- ----------------------------------------------------------------------------

CREATE TABLE public.quotes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    collaboration_id   UUID NOT NULL UNIQUE,
    creator_profile_id UUID NOT NULL,
    brand_profile_id   UUID NOT NULL,

    -- Bid
    amount_minor       INTEGER NOT NULL DEFAULT 0,
    currency           TEXT NOT NULL DEFAULT 'INR',
    timeline_days      INTEGER,
    revision_count     INTEGER NOT NULL DEFAULT 0,

    -- Terms
    package_description TEXT,
    licensing_notes     TEXT,
    revision_policy     TEXT,
    acceptance_notes    TEXT,

    -- Status
    status             public.quote_status NOT NULL DEFAULT 'submitted',
    submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at        TIMESTAMPTZ,
    declined_at        TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT quotes_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    CONSTRAINT quotes_brand_profile_id_fkey
        FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_quotes_creator ON public.quotes (creator_profile_id);
CREATE INDEX idx_quotes_brand ON public.quotes (brand_profile_id);

-- ----------------------------------------------------------------------------
-- Agreements
-- ----------------------------------------------------------------------------

CREATE TABLE public.agreements (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    collaboration_id   UUID NOT NULL UNIQUE,
    creator_profile_id UUID NOT NULL,
    brand_profile_id   UUID NOT NULL,

    -- Terms (stored as plain text / JSON block; this is NOT legal advice)
    agreed_terms       JSONB NOT NULL DEFAULT '{}',
    license_terms      TEXT,
    payment_terms      TEXT,
    acceptance_record  TEXT,

    -- Status
    status             public.agreement_status NOT NULL DEFAULT 'draft',
    accepted_by        public.user_role,   -- 'creator' or 'brand'
    accepted_at        TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT agreements_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    CONSTRAINT agreements_brand_profile_id_fkey
        FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_agreements_creator ON public.agreements (creator_profile_id);
CREATE INDEX idx_agreements_brand ON public.agreements (brand_profile_id);

COMMENT ON TABLE public.agreements IS 'Stores agreement terms and acceptance records only. This is NOT a legally enforceable e-signature tool.';

-- ----------------------------------------------------------------------------
-- Collaboration milestones
-- ----------------------------------------------------------------------------

CREATE TABLE public.collaboration_milestones (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    collaboration_id   UUID NOT NULL UNIQUE,
    collaboration_request_id UUID,

    title              TEXT NOT NULL,
    description        TEXT,
    due_at             TIMESTAMPTZ,
    order_num          INTEGER NOT NULL DEFAULT 0,

    -- Provenance
    status             public.milestone_status NOT NULL DEFAULT 'todo',
    completed_by       public.user_role,
    completed_at       TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT collaboration_milestones_collaboration_id_fkey
        FOREIGN KEY (collaboration_id) REFERENCES public.collaboration_requests(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_collab ON public.collaboration_milestones (collaboration_id);

-- ----------------------------------------------------------------------------
-- Deliverables
-- ----------------------------------------------------------------------------

CREATE TABLE public.deliverables (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    collaboration_id   UUID NOT NULL UNIQUE,
    milestone_id       UUID NOT NULL,

    title              TEXT NOT NULL,
    file_url           TEXT,
    file_meta_json     JSONB,                 -- {'mime','size','dimensions','duration','frames'}
    file_type          TEXT,
    file_size_bytes    BIGINT,
    width              INTEGER,
    height             INTEGER,
    duration_seconds   DOUBLE PRECISION,
    format             TEXT,
    aspect_ratio       TEXT,

    status             public.deliverable_status NOT NULL DEFAULT 'todo',
    submitted_by       public.user_role,
    submitted_at       TIMESTAMPTZ,
    reviewed_at        TIMESTAMPTZ,
    review_notes       TEXT,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT deliverables_milestone_id_fkey
        FOREIGN KEY (milestone_id) REFERENCES public.collaboration_milestones(id) ON DELETE CASCADE
);

CREATE INDEX idx_deliverables_collab ON public.deliverables (collaboration_id);

COMMENT ON TABLE public.deliverables IS 'Actual file uploads. File checks are for format compliance only, not originality or copyright.';

-- ----------------------------------------------------------------------------
-- Revisions
-- ----------------------------------------------------------------------------

CREATE TABLE public.revisions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    deliverable_id     UUID NOT NULL UNIQUE,
    creator_profile_id UUID NOT NULL,
    brand_profile_id   UUID NOT NULL,

    content              JSONB NOT NULL DEFAULT '{}',   -- notes, replaced assets, new urls
    status               public.revision_status NOT NULL DEFAULT 'pending',
    submitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at          TIMESTAMPTZ,
    rejected_at          TIMESTAMPTZ,
    reviewer_notes       TEXT,

    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT revisions_creator_profile_id_fkey
        FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    CONSTRAINT revisions_brand_profile_id_fkey
        FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_revisions_deliverable ON public.revisions (deliverable_id);

-- ----------------------------------------------------------------------------
-- Conversations
-- ----------------------------------------------------------------------------

CREATE TABLE public.conversations (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Participants are exactly two
    participant_a_id   UUID NOT NULL,
    participant_b_id   UUID NOT NULL,

    topic              TEXT NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT conversations_unique UNIQUE (participant_a_id, participant_b_id),
    CONSTRAINT conversations_participant_a_fkey
        FOREIGN KEY (participant_a_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT conversations_participant_b_fkey
        FOREIGN KEY (participant_b_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversations_paA ON public.conversations (participant_a_id);
CREATE INDEX idx_conversations_paB ON public.conversations (participant_b_id);

COMMENT ON TABLE public.conversations IS 'Two-participant threads between collaboration participants. Symmetric: (a,b) == (b,a).';

-- ----------------------------------------------------------------------------
-- Conversation members
-- ----------------------------------------------------------------------------

CREATE TABLE public.conversation_members (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id    UUID NOT NULL,
    profile_id         UUID NOT NULL,

    joined_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT conversation_members_unique UNIQUE (conversation_id, profile_id),
    CONSTRAINT conversation_members_conversation_fkey
        FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT conversation_members_profile_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_members_conversation ON public.conversation_members (conversation_id);

-- ----------------------------------------------------------------------------
-- Messages
-- ----------------------------------------------------------------------------

CREATE TABLE public.messages (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id    UUID NOT NULL,
    sender_id          UUID NOT NULL,
    body               TEXT NOT NULL,

    -- Read tracking
    read_at            TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT messages_conversation_fkey
        FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_fkey
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation ON public.messages (conversation_id, created_at);

COMMENT ON TABLE public.messages IS 'Persistent, authorized messages. "read_at" is set by the receiver\'s client when they view the message.';

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------

CREATE TABLE public.notifications (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id       UUID NOT NULL,
    actor_id           UUID,                    -- nullable (e.g. not a user notification)

    type               TEXT NOT NULL,           -- 'invitation', 'quote_submitted', 'revision_requested', 'mention', 'system'
    payload_json       JSONB NOT NULL DEFAULT '{}',
    read_at            TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT notifications_recipient_fkey
        FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_recipient ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications (recipient_id, read_at);

-- ----------------------------------------------------------------------------
-- Reports (admin moderation)
-- ----------------------------------------------------------------------------

CREATE TABLE public.reports (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reporter_id        UUID,                    -- nullable (self-report) or a staff member
    target_type        TEXT NOT NULL,           -- 'creator_profile' | 'portfolio_item' | 'brief' | 'message'
    target_id          UUID NOT NULL,
    reason             TEXT NOT NULL,
    details            TEXT,
    status             TEXT NOT NULL DEFAULT 'new',  -- 'new' | 'reviewing' | 'resolved' | 'dismissed'
    reviewer_id        UUID,
    reviewed_at        TIMESTAMPTZ,

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT reports_target_fkey UNIQUE (target_type, target_id)
);

CREATE INDEX idx_reports_target ON public.reports (target_type, target_id, created_at DESC);
CREATE INDEX idx_reports_status ON public.reports (status);

COMMENT ON TABLE public.reports IS 'User reports and admin moderation queue. Sensitive notes are server-only.';

-- ----------------------------------------------------------------------------
-- Audit logs
-- ----------------------------------------------------------------------------

CREATE TABLE public.audit_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_id           UUID,                    -- nullable for system/admin actions
    actor_type         TEXT,

    action             TEXT NOT NULL,           -- e.g. 'creator_profile_updated', 'brief_created'
    resource_type      TEXT,
    resource_id        UUID,
    ip_address         INET,
    user_agent         TEXT,
    metadata_json      JSONB NOT NULL DEFAULT '{}',

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_action ON public.audit_logs (action, created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Server-side audit trail for moderation and compliance. Never exposed to clients.';

-- ----------------------------------------------------------------------------
-- NGSI / trigram indexes for fuzzy text search on profile & brief content
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_profiles_username_trgm ON public.profiles USING gin (username gin_trgm_ops);
CREATE INDEX idx_briefs_title_trgm ON public.briefs USING gin (title gin_trgm_ops);
CREATE INDEX idx_briefs_objective_trgm ON public.briefs USING gin (objective gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS) — policies added in 002
-- ----------------------------------------------------------------------------
