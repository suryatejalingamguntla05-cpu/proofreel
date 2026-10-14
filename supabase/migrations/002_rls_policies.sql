-- ============================================================================
-- Proofreel — Row Level Security policies
-- Apply AFTER 001_initial_schema.sql
--
-- IMPORTANT:
--  * RLS is enforced on the Supabase side. The app ALSO enforces authorization
--    in TypeScript server code (belt-and-braces, never trust the browser).
--  * We never trust a role supplied by the browser; roles are derived server
--    side from profiles.role.
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Helper view: current session context
-- ----------------------------------------------------------------------------
-- We derive the "acting user" from the JWT auth token via the standard
-- supabase-auth helper `auth.uid()` in Postgres. For tests we seed an
-- override function is not used here; server code sets a session context via
-- supabase-rls or a manual equivalent.

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

CREATE POLICY "profiles are visible to authenticated users unless private"
    ON public.profiles
    FOR SELECT
    USING (
        is_public = true OR id IN (SELECT auth.uid())
    );

CREATE POLICY "profiles_owner_full_access"
    ON public.profiles
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- creator_profiles (owners only; admins can read for moderation)
-- ----------------------------------------------------------------------------

CREATE POLICY "creator_profiles_owner"
    ON public.creator_profiles
    USING (profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));

CREATE POLICY "creator_profiles_admin_moderation"
    ON public.creator_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- brand_profiles
-- ----------------------------------------------------------------------------

CREATE POLICY "brand_profiles_owner"
    ON public.brand_profiles
    USING (profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));

CREATE POLICY "brand_profiles_admin"
    ON public.brand_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- portfolio_items
-- ----------------------------------------------------------------------------

CREATE POLICY "portfolio_items_public_read"
    ON public.portfolio_items
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "portfolio_items_owner"
    ON public.portfolio_items
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

CREATE POLICY "portfolio_items_admin"
    ON public.portfolio_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- creator_tools
-- ----------------------------------------------------------------------------

CREATE POLICY "creator_tools_owner"
    ON public.creator_tools
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

-- ----------------------------------------------------------------------------
-- creator_workflow
-- ----------------------------------------------------------------------------

CREATE POLICY "creator_workflow_owner"
    ON public.creator_workflow
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

-- ----------------------------------------------------------------------------
-- social_accounts
-- ----------------------------------------------------------------------------

CREATE POLICY "social_accounts_owner"
    ON public.social_accounts
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

-- ----------------------------------------------------------------------------
-- social_metric_snapshots
-- ----------------------------------------------------------------------------

CREATE POLICY "social_metric_snapshots_owner"
    ON public.social_metric_snapshots
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

-- ----------------------------------------------------------------------------
-- creator_verification_requests
-- ----------------------------------------------------------------------------

CREATE POLICY "verification_requests_creator"
    ON public.creator_verification_requests
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

CREATE POLICY "verification_requests_admin"
    ON public.creator_verification_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- briefs
-- ----------------------------------------------------------------------------

CREATE POLICY "briefs_brand_own"
    ON public.briefs
    USING (brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

CREATE POLICY "briefs_creator_read"
    ON public.briefs
    FOR SELECT
    USING (
        is_public = true OR
        creator_profile_id IN (
            SELECT id FROM public.creator_profiles
            WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
        )
    );

CREATE POLICY "briefs_admin"
    ON public.briefs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- brief_skills
-- ----------------------------------------------------------------------------

CREATE POLICY "brief_skills_brief"
    ON public.brief_skills
    USING (brief_id IN (SELECT id FROM public.briefs WHERE brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    )));

-- ----------------------------------------------------------------------------
-- saved_creators
-- ----------------------------------------------------------------------------

CREATE POLICY "saved_creators_brand_own"
    ON public.saved_creators
    USING (brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

-- ----------------------------------------------------------------------------
-- collaboration_requests
-- ----------------------------------------------------------------------------

CREATE POLICY "collab_requests_brand_own"
    ON public.collaboration_requests
    USING (brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ))
    WITH CHECK (brand_profile_id IN (
        SELECT id FROM public.brand_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

CREATE POLICY "collab_requests_creator_own"
    ON public.collaboration_requests
    USING (creator_profile_id IN (
        SELECT id FROM public.creator_profiles
        WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
    ));

-- ----------------------------------------------------------------------------
-- quotes
-- ----------------------------------------------------------------------------

CREATE POLICY "quotes_collab_own"
    ON public.quotes
    USING (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    )
    WITH CHECK (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    );

-- ----------------------------------------------------------------------------
-- agreements
-- ----------------------------------------------------------------------------

CREATE POLICY "agreements_collab_own"
    ON public.agreements
    USING (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    )
    WITH CHECK (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    );

-- ----------------------------------------------------------------------------
-- collaboration_milestones
-- ----------------------------------------------------------------------------

CREATE POLICY "milestones_collab_own"
    ON public.collaboration_milestones
    USING (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    )
    WITH CHECK (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    );

-- ----------------------------------------------------------------------------
-- deliverables
-- ----------------------------------------------------------------------------

CREATE POLICY "deliverables_collab_own"
    ON public.deliverables
    USING (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    )
    WITH CHECK (
        collaboration_id IN (
            SELECT id FROM public.collaboration_requests
            WHERE brand_profile_id IN (
                SELECT id FROM public.brand_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
            OR creator_profile_id IN (
                SELECT id FROM public.creator_profiles
                WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
            )
        )
    );

-- ----------------------------------------------------------------------------
-- revisions
-- ----------------------------------------------------------------------------

CREATE POLICY "revisions_collab_own"
    ON public.revisions
    USING (
        deliverable_id IN (
            SELECT id FROM public.deliverables
            WHERE collaboration_id IN (
                SELECT id FROM public.collaboration_requests
                WHERE brand_profile_id IN (
                    SELECT id FROM public.brand_profiles
                    WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
                )
                OR creator_profile_id IN (
                    SELECT id FROM public.creator_profiles
                    WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
                )
            )
        )
    )
    WITH CHECK (
        deliverable_id IN (
            SELECT id FROM public.deliverables
            WHERE collaboration_id IN (
                SELECT id FROM public.collaboration_requests
                WHERE brand_profile_id IN (
                    SELECT id FROM public.brand_profiles
                    WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
                )
                OR creator_profile_id IN (
                    SELECT id FROM public.creator_profiles
                    WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id)
                )
            )
        )
    );

-- ----------------------------------------------------------------------------
-- conversations
-- ----------------------------------------------------------------------------

CREATE POLICY "conversations_participants"
    ON public.conversations
    USING (
        participant_a_id = auth.uid() OR participant_b_id = auth.uid()
    )
    WITH CHECK (
        participant_a_id = auth.uid() OR participant_b_id = auth.uid()
    );

-- ----------------------------------------------------------------------------
-- conversation_members
-- ----------------------------------------------------------------------------

CREATE POLICY "conversation_members_participants"
    ON public.conversation_members
    USING (
        profile_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM public.conversations
            WHERE participant_a_id = auth.uid() OR participant_b_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- messages
-- ----------------------------------------------------------------------------

CREATE POLICY "messages_participants"
    ON public.messages
    USING (
        sender_id = auth.uid() OR conversation_id IN (
            SELECT id FROM public.conversations
            WHERE (participant_a_id = auth.uid() OR participant_b_id = auth.uid())
        )
    );

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------

CREATE POLICY "notifications_owner"
    ON public.notifications
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ----------------------------------------------------------------------------
-- reports
-- ----------------------------------------------------------------------------

CREATE POLICY "reports_creator_moderate"
    ON public.reports
    USING (
        reporter_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        reporter_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------

CREATE POLICY "audit_logs_admin"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
